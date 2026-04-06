import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSession } from '../../lib/use-session';

export default function AuthenticatedLayout() {
  const session = useSession();

  useEffect(() => {
    if (session.isPending) return;

    if (!session.data) {
      // No session — go to login
      console.log('[Authenticated] No session → /login');
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

  // Render protected content only when a session exists
  if (!session.data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="product-form"
        options={{
          headerShown: true,
          title: "Product",
          headerTintColor: "#0066cc",
        }}
      />
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
