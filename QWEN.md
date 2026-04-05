# trekking-food-v2 — Quick Reference

## Documentation
- **Russian:** `docs/better-auth-integration_ru.md`
- **English:** `docs/better-auth-integration_en.md`

## Key Files
- **Auth client:** `lib/auth-client.ts`
- **Session hook:** `lib/use-session.ts`
- **Login:** `app/login.tsx`
- **Register:** `app/register.tsx`
- **Protected layout:** `app/(authenticated)/_layout.tsx`
- **Profile:** `app/(authenticated)/(tabs)/profile.tsx`
- **Env:** `.env` → `EXPO_PUBLIC_API_URL`

## Commands
```bash
npx expo start --clear     # Dev (Metro)
npx expo run:android       # Full rebuild
npm run apk                # Debug APK
npm run apk:release        # Release APK
```

## Notes
- Android emulator uses `10.0.2.2` to reach localhost
- Session stored in `expo-secure-store` (encrypted)
- Better Auth server must have `trustedOrigins` configured
- **CRITICAL FIX:** If `INSTALL_PARSE_FAILED_NO_CERTIFICATES` appears after `prebuild`:
  1. Delete `android/app/debug.keystore`
  2. Copy system keystore: `cp ~/.android/debug.keystore android/app/debug.keystore`
  3. Rebuild: `./gradlew assembleDebug --no-daemon --rerun-tasks`

## Qwen Added Memories
- При ошибке INSTALL_PARSE_FAILED_NO_CERTIFICATES (SHA-256 digest mismatch) в Android:
1. Удалить android/app/debug.keystore и скопировать ~/.android/debug.keystore
2. Удалить android/app/.cxx (кэш CMake)
3. Использовать ./gradlew installDebug вместо assembleDebug + adb install (собирает и ставит напрямую)
Проект: rn-gallery-26 (trekking-food-v2)
