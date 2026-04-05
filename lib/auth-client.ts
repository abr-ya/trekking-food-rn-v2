import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/client';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000',
  plugins: [
    expoClient({
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, $fetch } = authClient;

// useSession — это nanostores Atom, нужно обернуть в React hook
export const sessionAtom = authClient.useSession;
