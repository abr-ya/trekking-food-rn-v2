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
