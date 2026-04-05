import { useEffect, useState } from 'react';
import { sessionAtom } from './auth-client';

export function useSession() {
  const [session, setSession] = useState(() => sessionAtom.get());

  useEffect(() => {
    const unsubscribe = sessionAtom.listen((value) => {
      setSession(value);
    });
    return unsubscribe;
  }, []);

  return session;
}
