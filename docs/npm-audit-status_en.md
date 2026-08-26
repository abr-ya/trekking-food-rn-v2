# npm audit: current status and package updates

Snapshot date: **2026-08-26**  
Project: `trekking-food-v2` (Expo Router / React Native)

## Current status

After `npm install` / `npm audit`:

```text
24 vulnerabilities (13 moderate, 11 high)
```

- No `critical` issues.
- Plain `npm audit fix` **has already been run** — remaining issues mostly need a **major upgrade** (breaking changes).
- Project is on **Expo SDK 54** (`expo ~54.0.33`), React Native `0.81.5`.

`npm audit fix` without `--force` changes almost nothing: there are no safe semver patches for most of the dependency chains.

## What to watch

### 1. These are audit warnings, not build failures

The vulnerability count **does not block** `expo start` or APK builds. It is npm’s report of known CVEs in the dependency tree.

### 2. Almost everything comes from the Expo stack

Typical chain:

`expo` → `@expo/cli` / `@expo/config` / `@expo/metro*` → `metro`, `postcss`, `uuid`, `xcode`, …

Direct dependencies flagged by audit (via transitive deps):

| Package | Role |
| --- | --- |
| `expo` | SDK core |
| `expo-constants` | config / constants |
| `expo-dev-client` | dev client |
| `expo-linking` | deep links |
| `expo-router` | navigation |
| `expo-splash-screen` | splash (via `@expo/prebuild-config`) |

Transitive packages that can often be fixed without a major Expo bump:

| Package | Severity | Notes |
| --- | --- | --- |
| `brace-expansion` | high | DoS when expanding `{}` patterns; often fixed via patch / overrides |
| `ws` | high | DoS via WebSocket fragments; npm reports `npm audit fix` as available |

### 3. Risk for a mobile app is usually lower than it looks

Many advisories target **dev/tooling** (Metro, CLI, PostCSS stringify, config-plugins), not runtime code on the user’s device.

React sooner if you:

- ship a **web** build / server-side tooling with untrusted input;
- process untrusted CSS/config through a vulnerable PostCSS;
- parse untrusted glob patterns in CI/CD via vulnerable `brace-expansion`.

For a typical offline/mobile Expo app this is usually **tech debt**, not a release blocker.

### 4. What not to do

- **`npm audit fix --force`** — npm will try to install `expo@57.x`, a **breaking change** that can break the project without a planned SDK upgrade.
- Bump only `expo-constants` / `expo-router` / `expo-linking` to SDK 57 versions while staying on Expo 54 — module versions must match the SDK.
- Skip `npx expo-doctor` after any bulk dependency updates.

## How to update packages

### Option A — safe minimum (stay on SDK 54)

1. Re-run the soft fix:

```bash
npm audit fix
```

2. If `ws` / `brace-expansion` are still reported — targeted `overrides` in `package.json` (only after `npm ls` and a successful build look fine):

```json
{
  "overrides": {
    "ws": "^7.5.11",
    "brace-expansion": "^1.1.18"
  }
}
```

Then:

```bash
rm -rf node_modules
npm install
npm audit
npm start
```

3. Refresh packages **compatible** with SDK 54 via Expo (preferred over manual bumps in `package.json`):

```bash
npx expo install --fix
npx expo-doctor
```

### Option B — clear most of the audit (upgrade Expo SDK)

Audit currently points at a fix via **`expo@57.0.16`** (major: 54 → 57).

Do this **on purpose**, not via `--force`:

1. Read the Expo changelog / upgrade guide from 54 (stepwise 54 → 55 → …, or jump to the target SDK using the official guide).
2. Update the core and related modules:

```bash
npx expo install expo@latest
npx expo install --fix
npx expo-doctor
```

3. Smoke-test the app: `expo start`, Android/iOS build, auth, router, splash, deep links.
4. Re-run:

```bash
npm audit
```

Expectation: most of the current 24 items go away with the updated Expo/Metro stack.

### Option C — targeted updates of non-Expo dependencies

Independent of the Expo audit, update as needed:

```bash
# examples of direct project dependencies
npm outdated
npx expo install @tanstack/react-query better-auth @better-auth/expo
```

For Expo-ecosystem packages always prefer `npx expo install <pkg>` so the version matches the current SDK.

## Short recommendation

| Goal | Action |
| --- | --- |
| Keep shipping quickly | Ignore the audit count on SDK 54; optionally add `overrides` for `ws` / `brace-expansion` |
| Reduce noise with low risk | `npm audit fix` + `npx expo install --fix` |
| Actually clear most CVEs | Planned Expo SDK upgrade (not `audit fix --force`) |

## Useful commands

```bash
npm audit
npm audit --json
npm outdated
npx expo-doctor
npx expo install --check
npx expo install --fix
```

## Versions at snapshot time

From `package.json`:

- `expo`: `~54.0.33`
- `expo-router`: `~6.0.23`
- `expo-dev-client`: `~6.0.20`
- `react`: `19.1.0`
- `react-native`: `0.81.5`
