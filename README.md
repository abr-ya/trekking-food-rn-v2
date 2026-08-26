# trekking-food-v2

Mobile app for planning meals during trekking trips — meal planning, shopping lists, and food distribution among participants.

## Features

- 🍲 **Meal planning** — plan breakfast, lunch, and dinner for the entire trekking route
- 📝 **Shopping lists** — auto-generated grocery lists based on planned meals
- 🎒 **Food distribution** — distribute products and food among trekking participants
- 📊 **Calorie tracking** — monitor calorie intake for each participant

## Tech Stack

- **Framework:** Expo (React Native)
- **Navigation:** Expo Router (file-based routing)
- **Authentication:** Better Auth (email/password)
- **State management:** nanostores
- **TypeScript**

## Project Structure

```
app/
├── login.tsx                          ← Login screen
├── register.tsx                       ← Registration screen
├── _layout.tsx                        ← Root layout
├── (authenticated)/                   ← Protected area
│   ├── _layout.tsx                    ← Auth-guard
│   └── (tabs)/                        ← Tab navigation
│       ├── index.tsx                  ← Home screen
│       └── profile.tsx                ← User profile

lib/
├── auth-client.ts                     ← Better Auth client
└── use-session.ts                     ← Session hook
```

## Documentation

### Auth

- **Russian:** `docs/better-auth-integration_ru.md`
- **English:** `docs/better-auth-integration_en.md`

## Getting Started

### Prerequisites

- Node.js
- Android Studio (for Android emulator)
- Expo CLI

### Install dependencies

```bash
npm install
```

### Run the app

```bash
npx expo start --clear
```

### Build APK

Debug (dev / Metro-oriented):

```bash
npm run apk          # Debug
npm run apk:release  # Release Gradle only (no version bump / URL checks)
```

#### Phone-standalone release (recommended)

Produces a **release** APK that runs on a physical phone **without Metro** and without keeping a computer connected. Local only — no EAS/cloud build.

```bash
# API must be reachable from the phone (LAN IP or production), not 10.0.2.2 / localhost
EXPO_PUBLIC_API_URL=http://192.168.x.x:4000 npm run release:apk
```

Or put the URL in `.env.release` (see `example.env`) and run `npm run release:apk`.

**Version bump:** by default the script **proposes a minor** bump (`1.1.0` → `1.2.0`), shows `version` + `versionCode`, and asks `Y/n`.

| Flag | Effect |
|------|--------|
| (default) | Propose **minor** bump + confirm |
| `--patch` | Propose patch bump |
| `--major` | Propose major bump (explicit only) |
| `--no-bump` | Keep marketing version; still +1 `versionCode` |
| `--yes` | Skip confirmation |
| `--allow-emulator-url` | Allow `10.0.2.2` / localhost (not for real phones) |
| `--env-file <path>` | Load `EXPO_PUBLIC_*` from a file |
| `--dry-run` | Apply version files after confirm, skip Gradle |

```bash
npm run release:apk -- --major
npm run release:apk -- --patch --yes
```

**Signing:** the local `android/` release build may use the debug keystore (fine for personal sideloads). For a dedicated release keystore, configure `signingConfigs` in `android/app/build.gradle` — do **not** commit `*.jks` / `release.keystore`.

**Install:**

```bash
adb install -r android/app/build/outputs/apk/release/trekking-food-v2-<version>.apk
# or copy the APK onto the phone
```

> First-time / missing `android/`: run `npx expo run:android` (or `npx expo prebuild --platform android`) before `release:apk`.

### First-time setup (after cloning)

```bash
npx expo run:android   # Build dev APK with native modules
```

## Environment Variables

Create a `.env` file in the project root:

```
EXPO_PUBLIC_API_URL=http://your-backend-server-url
```

> **Note:** For Android emulator, use `10.0.2.2` instead of `localhost` to reach your computer.

## License

Private project.
