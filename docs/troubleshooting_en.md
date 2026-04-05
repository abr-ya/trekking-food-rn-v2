# Trekking Food V2 — Troubleshooting Guide

---

## 1. APK Installation Fails: `INSTALL_PARSE_FAILED_NO_CERTIFICATES`

### Error Message
```
Failure [INSTALL_PARSE_FAILED_NO_CERTIFICATES: Failed to collect certificates 
from /data/app/vmdl*.tmp/base.apk using APK Signature Scheme v2: 
SHA-256 digest of contents did not verify]
```

### When It Happens
- Running `npx expo run:android` after a prebuild or major changes
- Debug keystore is corrupted or out of sync with the device
- APK was built with a different signing key than the one installed on the device

### Solution

**Step 1:** Build APK manually
```bash
cd android && ./gradlew assembleDebug -x lint -x test && cd ..
```

**Step 2:** Remove old app from device
```bash
adb uninstall com.anonymous.trekkingfoodv2
```

**Step 3:** Install APK directly via ADB
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 2. Module Resolution Error: `Unable to resolve "module-name"`

### Error Message
```
Unable to resolve "better-auth/expo" from "lib/auth-client.ts"
```

### When It Happens
- Wrong import path (e.g., `better-auth/expo` instead of `better-auth/client`)
- Metro bundler cache is stale
- Missing dependency (not installed)

### Solution

**Step 1:** Check the correct import path by looking at the package's `exports` in `node_modules/<package>/package.json`

**Step 2:** Clear Metro cache
```bash
npx expo start --clear
```

**Step 3:** If still failing, verify the package is installed
```bash
npm ls better-auth @better-auth/expo
```

---

## 3. Native Module Not Found: `Cannot find native module 'ExpoNetwork'`

### Error Message
```
[Error: Cannot find native module 'ExpoNetwork']
```

### When It Happens
- You installed a new native module (e.g., `expo-network`) via npm but didn't rebuild the native project
- Running `npx expo start` instead of `npx expo run:android`

### Solution

You need a full rebuild because native modules require recompiling native code:
```bash
npx expo run:android
```

If that fails, try:
```bash
npx expo prebuild --clean
npx expo run:android
```

---

## 4. Navigation Error: `Attempted to navigate before mounting the Root Layout`

### Error Message
```
Attempted to navigate before mounting the Root Layout component. 
Ensure the Root Layout component is rendering a Slot, or other navigator on the first render.
```

### When It Happens
- `router.replace()` or `router.push()` is called in `useEffect` during the first render
- The navigation tree is not yet mounted when the redirect fires

### Solution

**Option 1:** Use `useFocusEffect` instead of `useEffect` for redirects
```ts
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

useFocusEffect(
  useCallback(() => {
    if (condition) {
      router.replace('/target');
    }
  }, [condition]),
);
```

**Option 2:** Move navigation logic to a layout component that wraps the protected routes

---

## 5. Auth Error: `Missing or null Origin`

### Error Message (on server)
```
ERROR [Better Auth]: Missing or null Origin
```

### When It Happens
- The app sends requests without the `Origin` header
- `trustedOrigins` is not configured on the Better Auth server

### Solution

Add `trustedOrigins` to your Better Auth server config:
```ts
export const auth = betterAuth({
  // ...your config
  trustedOrigins: [
    "http://localhost:4000",
    "exp://",
    "trekkingfoodv2://",
  ],
});
```

---

## 6. Auth Error: `Invalid CallBack URL`

### Error Message
```
Invalid CallBack URL
```

### When It Happens
- Passing `callbackURL` to `signIn.email()` when the server doesn't recognize it
- The `callbackURL` is not in `trustedOrigins` on the server

### Solution

**Option 1:** Remove `callbackURL` from `signIn.email()` for email/password auth
```ts
// Instead of:
await signIn.email({ email, password, callbackURL: '/' });

// Use:
await signIn.email({ email, password });
router.replace('/');  // Navigate manually after success
```

**Option 2:** Add the URL to `trustedOrigins` on the server

---

## 7. Import Path Errors: `Unable to resolve "../../../lib/..."`

### Error Message
```
Unable to resolve "../../../lib/auth-client" from "app/(auth)/login.tsx"
```

### When It Happens
- Wrong relative path depth (too many or too few `../`)
- File was moved but imports weren't updated

### Solution

**Count the directory levels:**
```
app/(auth)/login.tsx  →  lib/auth-client.ts
  login.tsx           →  go up 2 levels to app/  →  ../../lib/auth-client
```

**Rule of thumb:**
- `app/file.tsx` → `../lib/`
- `app/(group)/file.tsx` → `../../lib/`
- `app/(group)/(subgroup)/file.tsx` → `../../../lib/`

---

## 8. ESLint: `react/no-unescaped-entities`

### Error Message
```
`'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.
```

### When It Happens
- Using apostrophes (`'`) directly in JSX text content
- e.g., `Don't have an account?`

### Solution

Escape the apostrophe:
```tsx
// Instead of:
<Text>Don't have an account?</Text>

// Use:
<Text>Don&apos;t have an account?</Text>
```

---

## 9. CMake Build Error: `add_subdirectory given source which is not an existing directory`

### Error Message
```
CMake Error: add_subdirectory given source ".../build/generated/source/codegen/jni/" 
which is not an existing directory.
```

### When It Happens
- Clean task deletes generated directories but CMake cache still references them
- Running `./gradlew clean` after adding new native modules

### Solution

Delete CMake cache and rebuild:
```bash
rm -rf android/app/.cxx
rm -rf android/app/build
rm -rf android/build
npx expo run:android
```

---

## 10. Debug Keystore Issues

### Error Message
```
SHA-256 digest of contents did not verify
```

### When It Happens
- Debug keystore is corrupted or mismatched
- Switching between different development machines

### Solution

**Regenerate debug keystore:**
```bash
rm ~/.android/debug.keystore
keytool -genkey -v -keystore ~/.android/debug.keystore \
  -storepass android -alias androiddebugkey -keypass android \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Android Debug,O=Android,C=US"
```

**Then rebuild:**
```bash
npx expo run:android
```

---

## General Troubleshooting Steps

If something doesn't work, try these in order:

1. **Clear Metro cache**
   ```bash
   npx expo start --clear
   ```

2. **Uninstall and reinstall app**
   ```bash
   adb uninstall com.anonymous.trekkingfoodv2
   npx expo run:android
   ```

3. **Clean build artifacts**
   ```bash
   rm -rf android/app/.cxx android/app/build android/build
   ```

4. **Full prebuild**
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```

5. **Reinstall dependencies**
   ```bash
   rm -rf node_modules
   npm install
   npx expo prebuild --clean
   npx expo run:android
   ```
