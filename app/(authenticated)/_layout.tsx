import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSession } from '../../lib/use-session';

export default function AuthenticatedLayout() {
  const session = useSession();

  useEffect(() => {
    if (session.isPending) return;

    if (!session.data) {
      // Нет сессии — на login
      console.log('[Authenticated] Нет сессии → /login');
      router.replace('/login');
    }
  }, [session.data, session.isPending]);

  if (session.isPending) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Показываем контент только если есть сессия
  if (!session.data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
