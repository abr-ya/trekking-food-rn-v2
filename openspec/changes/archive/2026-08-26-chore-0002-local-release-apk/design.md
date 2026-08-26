## Context

See `proposal.md` for motivation. Today: `npm run apk` / `apk:release` wrap Gradle; `android/` is gitignored; versions drift (`app.json` `1.0.0` vs `package.json` `1.1.0`); `.env` defaults to emulator `10.0.2.2`. Debug + `expo-dev-client` is for Metro-backed development; phone-standalone needs release + phone-reachable API URL.

## Goals / Non-Goals

**Goals:**
- One developer command: propose version bump (default minor) → confirm → validate API URL → `assembleRelease` → print APK path + install notes
- Keep Expo (`app.json`) and npm (`package.json`) versions aligned; always raise Android `versionCode`
- Stay fully local (no EAS)

**Non-Goals:**
- EAS, CI, Play Store, iOS
- Changing app runtime behavior or auth
- Committing keystores or auto-generating production signing in-repo
- Making the agent run `apk:release` for the user (per `AGENTS.md` — user runs native builds)

## Decisions

### 1. Shell script + npm wrapper (not a new npm package)
- **Choice:** `scripts/release-apk.sh` + `"release:apk": "bash scripts/release-apk.sh"` in `package.json`.
- **Why:** No new dependencies; matches existing Gradle scripts; easy to read and edit.
- **Alternatives:** EAS only (rejected — user wants local); Node-only bump script without build (incomplete for the stated goal).

### 2. Version source of truth + interactive confirm
- **Choice:** `expo.version` in `app.json` is the product version; bump it, then mirror to `package.json`.
- **Android `versionCode`:** Keep `android.versionCode` in `app.json` and sync into Gradle when `android/` exists so over-installs work without a full prebuild dance. Always increment `versionCode` on a release run (including `--no-bump`).
- **Default bump:** propose **minor** (`1.1.0` → `1.2.0`). **Major** only with `--major`. **Patch** via `--patch` for hotfixes. Optional `--no-bump` keeps marketing version, still +1 `versionCode`.
- **Confirmation:** before writing version files, print the proposed `version` and `versionCode` and prompt `Y/n`. Decline aborts with no file changes. `--yes` skips the prompt (non-interactive).
- **Alternatives considered:** silent auto-patch (too easy to ship unnoticed); auto-minor with no prompt (rejected — user wants to confirm); major as default (too aggressive).

### 3. API URL gate
- **Choice:** Read `EXPO_PUBLIC_API_URL` from the environment; optionally load `.env.release` if present (without committing secrets). Reject `10.0.2.2` / `localhost` / `127.0.0.1` unless `--allow-emulator-url`.
- **Why:** Phone APKs with emulator URLs are the main footgun.
- **Alternatives:** Always use `.env` as-is (too easy to ship a broken phone build).

### 4. Signing
- **Choice:** Document that release signing must already be configured in the local Gradle project; script fails with a pointer if signing/keystore is missing. Do not commit `*.jks` / `release.keystore` (already gitignored).
- **Why:** Signing is machine-local and secret; automation should not invent a shared debug-as-release story without an explicit decision.
- **Alternatives:** Auto-create a debug-signed “release” (faster for personal devices, weaker; can be a follow-up if the team wants it).

### 5. Capability naming
- **Choice:** New capability `native-release` on the map (infra-facing, not a domain feature).
- **Why:** Clear home for release/version requirements; distinct from OpenSpec build numbers (`0002`).

## Risks / Trade-offs

- **[Risk] Release signing not configured on a fresh machine** → Mitigation: clear failure message + short README steps to create a local keystore.
- **[Risk] `android/` missing or stale after Expo config change** → Mitigation: fail if missing; document `npx expo prebuild` / `npx expo run:android` before first release; when present, patch Gradle version fields directly so bump sticks.
- **[Risk] Cleartext HTTP to LAN IP blocked on Android** → Mitigation: document that HTTP LAN may need network security config / HTTPS; out of scope to change NS config unless build already fails for that reason (note in README).
- **[Trade-off] Script updates gitignored `android/`** → Local-only; each machine must have `android/`; acceptable for current repo layout.

## Migration Plan

1. Land script + docs on branch `chore/0002-local-release-apk`.
2. Align current drift once via first successful `npm run release:apk` (or a one-time manual sync called out in tasks).
3. Rollback: remove script/docs; old `npm run apk:release` remains.

## Open Questions

- None that block implementation; optional later: debug-keystore-as-release convenience flag for personal sideloading only.
