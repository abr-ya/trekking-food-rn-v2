## Why

Installing a phone-usable build today is manual and easy to get wrong: debug APKs depend on Metro, `EXPO_PUBLIC_API_URL` often points at the emulator (`10.0.2.2`), and app versions drift across `app.json` / `package.json`. We need a repeatable local (no cloud) path to bump version and produce a release APK that runs on a device without a computer.

## What Changes

- Add a **local release workflow** (script + npm script) that:
  - proposes a **minor** semver bump by default (major only with an explicit flag; patch optional for hotfixes), keeps `package.json` in sync, and **asks for confirmation** before writing (skip with `--yes`)
  - always bumps Android `versionCode` for installability over prior builds
  - builds a **release** APK via existing Gradle (`assembleRelease`)
  - fails fast if the API URL looks emulator/localhost-only (unless explicitly overridden)
  - prints the APK path and short install notes
- Document the workflow in README (and a short reference note if needed)
- Register `native-release` on the capability map
- **Non-goals:** EAS/cloud builds, Play Store publishing, iOS IPA, CI pipelines, changing runtime app features

## Capabilities

### New Capabilities
- `native-release`: Local version bump + release APK production for device-only use (no Metro / no cloud build)

### Modified Capabilities
- _(none)_

## Impact

- New files under `scripts/` and npm scripts in `package.json`
- Docs: README (+ optional `docs/reference/…`)
- `openspec/CAPABILITIES.md` gains `native-release`
- Relies on local `android/` (gitignored / prebuild) and a configured release signing keystore
- No new runtime dependencies; no app UI changes; no backend changes
- Agent/user still run Gradle/APK commands locally (per `AGENTS.md`); automation is the script glue, not CI
