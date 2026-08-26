## Purpose

Defines the local developer workflow for bumping the Android app version and producing a release APK that runs on a physical phone without Metro or a connected computer.

## ADDED Requirements

### Requirement: Version bump keeps Expo and package versions aligned
The release workflow MUST propose a semver bump for the Expo app version in `app.json` and MUST set `package.json` `version` to the same value after confirmation. The default proposed bump MUST be **minor**. A **major** bump MUST require an explicit major flag. A **patch** bump MUST be available via an explicit patch flag. The Android `versionCode` MUST increase on every release run (including when the marketing version is left unchanged).

#### Scenario: Minor bump proposed by default
- **WHEN** the developer runs the release workflow without a bump-level flag
- **THEN** the workflow proposes incrementing the minor segment (and resetting patch) and, after confirmation, writes that version to `app.json` and `package.json`

#### Scenario: Major bump only when requested
- **WHEN** the developer runs the release workflow with the major bump flag
- **THEN** the workflow proposes a major increment (lower segments reset per semver) and, after confirmation, writes that version

#### Scenario: Patch bump when requested
- **WHEN** the developer runs the release workflow with the patch bump flag
- **THEN** the workflow proposes a patch increment and, after confirmation, writes that version

### Requirement: Version change requires confirmation unless skipped
Before writing version files, the release workflow MUST display the current and proposed `version` and `versionCode` and MUST ask the developer to confirm. If the developer declines, the workflow MUST exit without changing version files or starting the release build. When the non-interactive skip flag is set, the workflow MUST apply the proposed bump without prompting.

#### Scenario: Developer confirms the proposed version
- **WHEN** the workflow shows a proposed bump and the developer confirms
- **THEN** version files are updated and the release build proceeds

#### Scenario: Developer declines the proposed version
- **WHEN** the workflow shows a proposed bump and the developer declines
- **THEN** no version files are changed and the release build does not start

#### Scenario: Non-interactive skip
- **WHEN** the developer passes the documented skip-confirmation flag
- **THEN** the proposed bump is applied without an interactive prompt

### Requirement: Release APK is produced locally without cloud builds
The release workflow MUST produce an Android release APK using the project's local native toolchain (Gradle). The workflow MUST NOT require EAS or any cloud build service.

#### Scenario: Successful local release build
- **WHEN** the native Android project is present, release signing is configured, and the developer runs the release workflow
- **THEN** a release APK file is written under the project's Android build outputs and its path is printed

#### Scenario: Missing android project
- **WHEN** the developer runs the release workflow and the local `android/` project is missing
- **THEN** the workflow fails with a clear message that a native prebuild / `expo run:android` setup is required before release

### Requirement: Phone-safe API URL is baked into the release
The release workflow MUST use `EXPO_PUBLIC_API_URL` from the environment (or an explicitly provided release env file) at build time. The workflow MUST refuse to proceed when the URL is missing or targets emulator/localhost-only hosts (`10.0.2.2`, `localhost`, `127.0.0.1`) unless the developer passes an explicit override flag.

#### Scenario: Emulator URL rejected by default
- **WHEN** `EXPO_PUBLIC_API_URL` is `http://10.0.2.2:4000` and no override flag is set
- **THEN** the workflow exits with a non-zero status and explains that a phone-reachable API URL is required

#### Scenario: Phone LAN or production URL accepted
- **WHEN** `EXPO_PUBLIC_API_URL` is a LAN IP or https production host and the developer runs the release workflow
- **THEN** the build proceeds and that URL is the one embedded for the client

#### Scenario: Override for intentional emulator-oriented release
- **WHEN** the developer passes the documented override flag with an emulator/localhost URL
- **THEN** the workflow proceeds after a warning

### Requirement: Install guidance is printed after a successful build
After a successful release APK build, the workflow MUST print concise install guidance suitable for a physical device (ADB install and/or copying the APK), and MUST state that Metro on a computer is not required to run the installed app.

#### Scenario: Post-build output
- **WHEN** the release APK build completes successfully
- **THEN** the console shows the APK path and short install notes including that the app does not need Metro
