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

```bash
npm run apk          # Debug
npm run apk:release  # Release
```

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
