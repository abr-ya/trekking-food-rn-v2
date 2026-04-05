# Better Auth Integration in trekking-food-v2

## What We Did

---

### 1. Dependencies

```bash
# Native modules
npx expo install expo-secure-store   # Session storage (tokens)
npx expo install expo-network         # Network connectivity tracking
npm install better-auth @better-auth/expo
```

---

### 2. Environment Variables

**File:** `.env` (do NOT commit to git!)

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

- `10.0.2.2` — **your computer's** IP address for the Android emulator
- For a real device — use your computer's IP on the local network
- `EXPO_PUBLIC_` — Expo substitutes these variables at build time

---

### 3. File Structure

```
app/
├── login.tsx                          ← Login screen (email/password)
├── register.tsx                       ← Registration screen
├── _layout.tsx                        ← Root layout (Stack)
├── (authenticated)/                   ← Protected zone
│   ├── _layout.tsx                    ← Auth-guard: redirect to /login
│   └── (tabs)/                        ← Tab navigation
│       ├── _layout.tsx
│       ├── index.tsx                  ← Home screen
│       └── profile.tsx                ← Profile (email, name, logout)

lib/
├── auth-client.ts                     ← Better Auth client
├── auth-provider.tsx                  ← Provider (placeholder)
└── use-session.ts                     ← React hook for session
```

---

### 4. Better Auth Client

**File:** `lib/auth-client.ts`

```ts
import { createAuthClient } from 'better-auth/client';
import * as SecureStore from 'expo-secure-store';
import { expoClient } from '@better-auth/expo/client';

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000',
  plugins: [
    expoClient({
      storage: SecureStore,  // Session stored in SecureStore
    }),
  ],
});

export const { signIn, signUp, signOut } = authClient;
```

**Why `SecureStore`:**
- Session token is stored in the device's **encrypted storage**
- Persists across app restarts
- Accessible only to this app

---

### 5. Session Hook

**File:** `lib/use-session.ts`

```ts
import { useState, useEffect } from 'react';
import { sessionAtom } from './auth-client';

export function useSession() {
  const [session, setSession] = useState(() => sessionAtom.get());

  useEffect(() => {
    const unsubscribe = sessionAtom.listen((value) => {
      setSession(value);
    });
    return unsubscribe;
  }, []);

  return session;  // { data, isPending, error }
}
```

**Why:** `createAuthClient` uses nanostores. This wrapper converts it to a React hook.

---

### 6. Auth-Guard

**File:** `app/(authenticated)/_layout.tsx`

```ts
const session = useSession();

useEffect(() => {
  if (session.isPending) return;

  if (!session.data) {
    // No session → redirect to login
    router.replace('/login');
  }
}, [session.data, session.isPending]);

// Show content only if authenticated
if (!session.data) return <Loading />;

return <Stack>...</Stack>;
```

**Logic:**
- If no session — the user **won't see** protected screens
- While loading session — show a loader
- If authenticated — show the content

---

### 7. Login & Registration Screens

**Files:** `app/login.tsx`, `app/register.tsx`

**Login logic:**
```ts
const { data, error } = await signIn.email({ email, password });
if (error) { Alert.alert('Error', error.message); }
else { router.replace('/'); }
```

**Registration logic:**
```ts
const { data, error } = await signUp.email({
  email,
  password,
  name: email.split('@')[0],
});
if (error) { Alert.alert('Registration Error', error.message); }
else { Alert.alert('Success'); router.replace('/login'); }
```

**If already authenticated:**
```ts
useFocusEffect(
  useCallback(() => {
    if (session.data && !session.isPending) {
      router.replace('/');
    }
  }, [session.data, session.isPending]),
);
```

---

### 8. Profile

**File:** `app/(authenticated)/(tabs)/profile.tsx`

Shows:
- User email
- User name
- Logout button

```ts
const handleSignOut = async () => {
  try { await signOut(); } catch (err) {}
  router.replace('/login');
};
```

---

### 9. Backend Configuration

On the Better Auth server, add `trustedOrigins`:

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

**Why:** Without this, requests from the emulator/device will be rejected (CORS/Origin).

---

### 10. Build & Run

**Dev Build** (first time, after installing native modules):
```bash
npx expo run:android
```

**Regular run** (development):
```bash
npx expo start --clear
```

**Build APK** for a phone:
```bash
npm run apk          # Debug
npm run apk:release  # Release
```

---

### 11. Redirects

| Situation | From | To | Where configured |
|-----------|------|----|------------------|
| No session | `/(authenticated)/_layout.tsx` | `/login` | Auth-guard |
| Already logged in, on login | `/login.tsx` | `/` | `useFocusEffect` |
| Already logged in, on register | `/register.tsx` | `/` | `useFocusEffect` |
| Successful login | `/login.tsx` | `/` | `router.replace('/')` |
| Successful registration | `/register.tsx` | `/login` | Alert callback |
| Logout from profile | `/profile.tsx` | `/login` | `router.replace('/login')` |

---

### 12. Added to `.gitignore`

```
.env
```

---

### What's Next

- [ ] Add OAuth (Google, GitHub, Apple)
- [ ] Password recovery
- [ ] Email verification
- [ ] Profile settings
- [ ] Dynamic server URL switching (Secure Store for URL)
