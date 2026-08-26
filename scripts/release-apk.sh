#!/usr/bin/env bash
# Local phone release: propose version bump → confirm → bake EXPO_PUBLIC_API_URL → assembleRelease.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BUMP="minor"
NO_BUMP=0
YES=0
ALLOW_EMULATOR_URL=0
DRY_RUN=0
ENV_FILE=""

usage() {
  cat <<'EOF'
Usage: scripts/release-apk.sh [options]

  Default: propose a MINOR semver bump, ask Y/n, then build a release APK.

Options:
  --minor               Propose minor bump (default)
  --patch               Propose patch bump (hotfixes)
  --major               Propose major bump (explicit only)
  --no-bump             Keep marketing version; still +1 versionCode
  --yes                 Skip confirmation prompt
  --allow-emulator-url  Allow 10.0.2.2 / localhost / 127.0.0.1
  --env-file <path>     Load EXPO_PUBLIC_API_URL from this file (default: .env.release if present)
  --dry-run             Apply version updates (after confirm) but skip Gradle
  -h, --help            Show this help

Examples:
  EXPO_PUBLIC_API_URL=http://192.168.1.10:4000 npm run release:apk
  npm run release:apk -- --major --yes --env-file .env.release
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --minor) BUMP="minor"; shift ;;
    --patch) BUMP="patch"; shift ;;
    --major) BUMP="major"; shift ;;
    --no-bump) NO_BUMP=1; shift ;;
    --yes) YES=1; shift ;;
    --allow-emulator-url) ALLOW_EMULATOR_URL=1; shift ;;
    --env-file)
      ENV_FILE="${2:-}"
      if [[ -z "$ENV_FILE" ]]; then
        echo "error: --env-file requires a path" >&2
        exit 1
      fi
      shift 2
      ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "error: unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ ! -d "$ROOT/android" ]]; then
  echo "error: android/ is missing." >&2
  echo "Create the native project first, e.g.:" >&2
  echo "  npx expo prebuild --platform android" >&2
  echo "  # or: npx expo run:android" >&2
  exit 1
fi

load_env_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  echo "Loading env from $file"
  # Export only EXPO_PUBLIC_* lines; ignore comments/blank.
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^[[:space:]]*(EXPO_PUBLIC_[A-Za-z0-9_]+)=(.*)$ ]]; then
      local key="${BASH_REMATCH[1]}"
      local val="${BASH_REMATCH[2]}"
      val="${val%\"}"
      val="${val#\"}"
      val="${val%\'}"
      val="${val#\'}"
      export "$key=$val"
    fi
  done < "$file"
}

if [[ -n "$ENV_FILE" ]]; then
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "error: env file not found: $ENV_FILE" >&2
    exit 1
  fi
  load_env_file "$ENV_FILE"
elif [[ -f "$ROOT/.env.release" ]]; then
  load_env_file "$ROOT/.env.release"
fi

API_URL="${EXPO_PUBLIC_API_URL:-}"
if [[ -z "$API_URL" ]]; then
  echo "error: EXPO_PUBLIC_API_URL is not set." >&2
  echo "Set it for a phone-reachable host, e.g.:" >&2
  echo "  EXPO_PUBLIC_API_URL=http://192.168.x.x:4000 npm run release:apk" >&2
  echo "Or create .env.release (see example.env)." >&2
  exit 1
fi

is_emulator_url() {
  local u="$1"
  [[ "$u" == *10.0.2.2* || "$u" == *localhost* || "$u" == *127.0.0.1* ]]
}

if is_emulator_url "$API_URL"; then
  if [[ "$ALLOW_EMULATOR_URL" -eq 0 ]]; then
    echo "error: EXPO_PUBLIC_API_URL looks emulator/localhost-only: $API_URL" >&2
    echo "Use a LAN IP or production URL reachable from the phone." >&2
    echo "Override only if intentional: --allow-emulator-url" >&2
    exit 1
  fi
  echo "warning: allowing emulator/localhost API URL: $API_URL" >&2
fi

read_versions() {
  node -e '
const fs = require("fs");
const app = JSON.parse(fs.readFileSync("app.json", "utf8"));
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = app.expo?.version;
const versionCode = app.expo?.android?.versionCode;
if (!version || typeof version !== "string") {
  console.error("error: app.json expo.version is missing");
  process.exit(1);
}
if (typeof versionCode !== "number" || !Number.isInteger(versionCode) || versionCode < 1) {
  console.error("error: app.json expo.android.versionCode must be a positive integer");
  process.exit(1);
}
if (pkg.version !== version) {
  console.warn(`warning: package.json version (${pkg.version}) != app.json (${version}); using app.json`);
}
process.stdout.write(JSON.stringify({ version, versionCode }));
'
}

bump_semver() {
  local version="$1"
  local kind="$2"
  node -e '
const [version, kind] = process.argv.slice(1);
const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
if (!m) {
  console.error("error: version must be semver X.Y.Z, got: " + version);
  process.exit(1);
}
let major = Number(m[1]), minor = Number(m[2]), patch = Number(m[3]);
if (kind === "major") { major += 1; minor = 0; patch = 0; }
else if (kind === "minor") { minor += 1; patch = 0; }
else if (kind === "patch") { patch += 1; }
else { console.error("error: unknown bump " + kind); process.exit(1); }
process.stdout.write(`${major}.${minor}.${patch}`);
' "$version" "$kind"
}

CURRENT_JSON="$(read_versions)"
CURRENT_VERSION="$(node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v.version)' "$CURRENT_JSON")"
CURRENT_CODE="$(node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(String(v.versionCode))' "$CURRENT_JSON")"

if [[ "$NO_BUMP" -eq 1 ]]; then
  NEW_VERSION="$CURRENT_VERSION"
  BUMP_LABEL="no-bump"
else
  NEW_VERSION="$(bump_semver "$CURRENT_VERSION" "$BUMP")"
  BUMP_LABEL="$BUMP"
fi
NEW_CODE=$((CURRENT_CODE + 1))

echo
echo "Proposed release:"
echo "  bump:        $BUMP_LABEL"
echo "  version:     $CURRENT_VERSION → $NEW_VERSION"
echo "  versionCode: $CURRENT_CODE → $NEW_CODE"
echo "  API URL:     $API_URL"
echo

if [[ "$YES" -eq 0 ]]; then
  read -r -p "Apply this and build release APK? [Y/n] " answer
  answer="${answer:-Y}"
  case "$answer" in
    Y|y|yes|YES) ;;
    *)
      echo "Aborted. No version files changed."
      exit 1
      ;;
  esac
fi

write_versions() {
  local version="$1"
  local code="$2"
  node -e '
const fs = require("fs");
const version = process.argv[1];
const code = Number(process.argv[2]);
const appPath = "app.json";
const pkgPath = "package.json";
const app = JSON.parse(fs.readFileSync(appPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
app.expo = app.expo || {};
app.expo.version = version;
app.expo.android = app.expo.android || {};
app.expo.android.versionCode = code;
pkg.version = version;
fs.writeFileSync(appPath, JSON.stringify(app, null, 2) + "\n");
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
' "$version" "$code"
}

sync_gradle() {
  local version="$1"
  local code="$2"
  local gradle="$ROOT/android/app/build.gradle"
  if [[ ! -f "$gradle" ]]; then
    echo "error: android/app/build.gradle not found" >&2
    exit 1
  fi
  node -e '
const fs = require("fs");
const version = process.argv[1];
const code = process.argv[2];
const path = process.argv[3];
let text = fs.readFileSync(path, "utf8");
if (!/versionCode\s+\d+/.test(text) || !/versionName\s+"[^"]*"/.test(text)) {
  console.error("error: could not find versionCode/versionName in android/app/build.gradle");
  process.exit(1);
}
text = text.replace(/versionCode\s+\d+/, "versionCode " + code);
text = text.replace(/versionName\s+"[^"]*"/, "versionName \"" + version + "\"");
fs.writeFileSync(path, text);
' "$version" "$code" "$gradle"
}

# Android blocks plain HTTP unless usesCleartextTraffic is enabled.
ensure_cleartext_for_http() {
  local url="$1"
  [[ "$url" == http://* ]] || return 0

  node -e '
const fs = require("fs");
const appPath = "app.json";
const app = JSON.parse(fs.readFileSync(appPath, "utf8"));
app.expo = app.expo || {};
app.expo.android = app.expo.android || {};
if (app.expo.android.usesCleartextTraffic !== true) {
  app.expo.android.usesCleartextTraffic = true;
  fs.writeFileSync(appPath, JSON.stringify(app, null, 2) + "\n");
  console.log("Set expo.android.usesCleartextTraffic=true (required for http:// API)");
}
'
  local manifest="$ROOT/android/app/src/main/AndroidManifest.xml"
  if [[ -f "$manifest" ]] && ! grep -q 'usesCleartextTraffic="true"' "$manifest"; then
    node -e '
const fs = require("fs");
const path = process.argv[1];
let text = fs.readFileSync(path, "utf8");
if (/android:usesCleartextTraffic=/.test(text)) {
  text = text.replace(/android:usesCleartextTraffic="[^"]*"/, "android:usesCleartextTraffic=\"true\"");
} else if (/<application\b[^>]*>/.test(text)) {
  text = text.replace(/<application\b/, "<application android:usesCleartextTraffic=\"true\"");
} else {
  console.error("error: could not patch AndroidManifest.xml for cleartext");
  process.exit(1);
}
fs.writeFileSync(path, text);
console.log("Patched AndroidManifest.xml usesCleartextTraffic=true");
' "$manifest"
  fi
}

ensure_cleartext_for_http "$API_URL"
write_versions "$NEW_VERSION" "$NEW_CODE"
sync_gradle "$NEW_VERSION" "$NEW_CODE"
echo "Updated app.json, package.json, and android/app/build.gradle"

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "dry-run: skipping Gradle assembleRelease"
  exit 0
fi

echo "Building release APK (assembleRelease)…"
set +e
(
  cd "$ROOT/android"
  ./gradlew assembleRelease -x lint -x test
)
gradle_status=$?
set -e

if [[ "$gradle_status" -ne 0 ]]; then
  echo >&2
  echo "error: Gradle release build failed (exit $gradle_status)." >&2
  echo "If this is a signing/keystore problem:" >&2
  echo "  - Release currently may use the debug keystore (see android/app/build.gradle)." >&2
  echo "  - For a dedicated release keystore, see README (Build APK / signing)." >&2
  echo "  - Do not commit *.jks / release.keystore." >&2
  exit "$gradle_status"
fi

APK_DIR="$ROOT/android/app/build/outputs/apk/release"
DEFAULT_APK="$APK_DIR/app-release.apk"
if [[ ! -f "$DEFAULT_APK" ]]; then
  DEFAULT_APK="$(find "$APK_DIR" -name '*.apk' ! -name 'trekking-food-v2-*.apk' 2>/dev/null | head -n 1 || true)"
fi

APK_PATH=""
if [[ -n "${DEFAULT_APK:-}" && -f "$DEFAULT_APK" ]]; then
  VERSIONED_NAME="trekking-food-v2-${NEW_VERSION}.apk"
  APK_PATH="$APK_DIR/$VERSIONED_NAME"
  cp -f "$DEFAULT_APK" "$APK_PATH"
fi

echo
echo "Release APK ready."
if [[ -n "${APK_PATH:-}" && -f "$APK_PATH" ]]; then
  echo "  APK: $APK_PATH"
  echo "  (also: $DEFAULT_APK)"
else
  echo "  APK: (look under android/app/build/outputs/apk/release/)"
fi
echo
echo "Install on a phone (Metro / computer not required to run the app):"
if [[ -n "${APK_PATH:-}" && -f "$APK_PATH" ]]; then
  echo "  adb install -r \"$APK_PATH\""
else
  echo "  adb install -r <apk-path>"
fi
echo "  # or copy the APK to the device and open it"
echo
echo "Remember: the API at $API_URL must be reachable from the phone."
