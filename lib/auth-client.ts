import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/client';
import * as SecureStore from 'expo-secure-store';

/**
 * Better Auth's client appends `/api/auth` when `baseURL` is origin-only.
 * `$fetch("/products")` would hit `/api/auth/products`, not your REST API.
 *
 * - `EXPO_PUBLIC_API_URL` = server root (e.g. http://10.0.2.2:4000) → auth at …/api/auth, REST at …/products
 * - Or set it to the full auth base (…/api/auth) if your app already uses that — we won't double-append.
 */
function resolveServerAndAuthBase(raw: string): { apiOrigin: string; authBaseURL: string } {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (trimmed.toLowerCase().endsWith('/api/auth')) {
    return {
      apiOrigin: trimmed.slice(0, -'/api/auth'.length) || trimmed,
      authBaseURL: trimmed,
    };
  }
  return {
    apiOrigin: trimmed,
    authBaseURL: `${trimmed}/api/auth`,
  };
}

const { apiOrigin, authBaseURL } = resolveServerAndAuthBase(
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000',
);

/** Use for app REST routes (e.g. `/products`), not Better Auth paths. */
export const API_ORIGIN = apiOrigin;

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [
    expoClient({
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, $fetch } = authClient;

export interface FetchApiOptions {
  method?: string;
  body?: string;
}

/** Authenticated JSON request to the API server (session cookie from Expo plugin). */
export async function fetchApiJson<T>(
  path: string,
  options?: FetchApiOptions,
): Promise<T> {
  const cookie = authClient.getCookie();
  const url = `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: options?.body,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// useSession is a nanostores atom — wrap it in a React hook (see use-session.ts).
export const sessionAtom = authClient.useSession;
