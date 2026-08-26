## 1. Capability map and version baseline

- [ ] 1.1 Add `native-release` row to `openspec/CAPABILITIES.md` (status partial → implemented after ship; Spec ⬜ until archive sync)
- [ ] 1.2 Align current drift: set `app.json` `expo.version` and `package.json` `version` to the same baseline before the script owns bumps (pick one shared value, e.g. `1.1.0`)
- [ ] 1.3 Add `android.versionCode` (integer) under `expo.android` in `app.json` as the Expo-side counter the script increments

## 2. Release script

- [ ] 2.1 Create `scripts/release-apk.sh` with: default **minor** propose, `--patch` / `--minor` / `--major` / `--no-bump`, `--yes` (skip confirm), `--allow-emulator-url`, optional `--env-file`
- [ ] 2.2 Implement semver propose + write of `app.json` + mirror to `package.json`; always increment `android.versionCode` (including `--no-bump`)
- [ ] 2.3 Before writing versions, print current → proposed `version` / `versionCode` and prompt `Y/n`; on decline abort with no changes; honor `--yes`
- [ ] 2.4 When `android/` exists, sync `versionName` / `versionCode` into the Gradle app config; if `android/` is missing, exit with a clear prebuild / `expo run:android` message
- [ ] 2.5 Validate `EXPO_PUBLIC_API_URL` (env and/or `--env-file` / `.env.release`); reject emulator/localhost hosts unless `--allow-emulator-url`
- [ ] 2.6 Run local `assembleRelease` (same spirit as existing `apk:release`) and print APK path + install notes (no Metro required)
- [ ] 2.7 On signing/keystore failure, exit with a short pointer to README signing steps (do not commit keystores)

## 3. npm + docs

- [ ] 3.1 Add `"release:apk": "bash scripts/release-apk.sh"` to `package.json` (keep existing `apk` / `apk:release`)
- [ ] 3.2 Update README Build APK section: phone-standalone flow, URL rules, version bump (default minor + confirm / `--yes` / `--major` / `--patch`), signing note
- [ ] 3.3 Extend `example.env` comments (or add `example.env.release`) clarifying phone LAN / production URL for release builds

## 4. Verification

- [ ] 4.1 Dry-check script help / URL rejection / bump propose + decline path / `--yes` path without requiring a full Gradle run where possible
- [ ] 4.2 Tell the user the exact command to run for a real build (e.g. `EXPO_PUBLIC_API_URL=http://<lan-ip>:4000 npm run release:apk`) — do not run `apk:release` / Gradle as the agent
- [ ] 4.3 Run `npx tsc --noEmit && npm run lint` if any TS/JS touched; otherwise confirm no app code changes
