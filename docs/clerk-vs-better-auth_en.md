# Clerk vs Better Auth for Expo/React Native — Comparison

## Clerk

### Approaches
| Approach | Expo Go | Description |
|----------|---------|-------------|
| **JavaScript (Custom flows)** | ✅ Yes | Custom UI, no native modules |
| **Native Components** | ❌ No | Clerk's native UI preview (SwiftUI/Compose) |

### Works in Expo Go:
- ✅ Email/password login (custom form)
- ✅ Phone/SMS login
- ✅ Session management
- ✅ `tokenCache` via `@clerk/expo` (in-memory storage)

### Does NOT work in Expo Go:
- ❌ Native OAuth (Google/Apple sign-in via native SDKs)
- ❌ Biometrics (Face ID / Touch ID)
- ❌ Clerk's native UI components

### `expo-secure-store` nuance:
- **Not required** for basic functionality
- Clerk can store tokens **in memory** (lost on app restart)
- If you add `expo-secure-store` → session persists → **requires Dev Build**

---

## Better Auth

### Architecture
- `better-auth` — server-side (Node.js/Edge runtime)
- `@better-auth/expo` — client-side for React Native

### Works in Expo Go:
- ❌ **Nothing works** — requires `expo-secure-store` (native module)

### Requirements:
- ✅ Development Build (`npx expo run:android`)
- ✅ `expo-secure-store` for session storage
- ✅ Separate backend server with Better Auth

### Supported providers:
- ✅ Email/Password
- ✅ OAuth (Google, Apple, GitHub, etc.)
- ✅ Magic links

### Known issues:
- Some plugins use `jose` (Node-only module) — bundling issues
- OAuth in production may have quirks (open issues exist)

---

## Comparison Table

| Feature | Clerk (JS flow) | Better Auth |
|---|---|---|
| **Expo Go** | ✅ Yes | ❌ No |
| **Session persists** | ⚠️ In-memory only | ✅ Yes (SecureStore) |
| **OAuth** | ⚠️ Web flow only | ✅ Yes |
| **Requires Dev Build for basics** | ❌ No | ✅ Yes |
| **Requires own server** | ❌ No (Clerk hosted) | ✅ Yes |
| **Custom UI** | ✅ Yes | ✅ Yes |
| **Biometrics** | ❌ (requires Dev Build) | ✅ Yes |
| **Pricing** | Free up to 10k users | Open Source (free) |
| **Setup complexity** | Low | Medium |

---

## Recommendations

### Choose Clerk if:
- You want to start quickly with Expo Go
- You don't want to host your own auth server
- You prefer simple setup
- You're okay with rebuilding later for `expo-secure-store`

### Choose Better Auth if:
- You already have your own Better Auth server
- You need full control over user data
- You're willing to build a Dev Build before starting development
- You want an Open Source solution

---

## Conclusion for this project

**For development via Expo Go → Clerk (JavaScript flow)** is the only option of the two.

**For production**, both approaches require a Dev Build for:
- `expo-secure-store` (session persistence)
- Native OAuth
- Biometrics
