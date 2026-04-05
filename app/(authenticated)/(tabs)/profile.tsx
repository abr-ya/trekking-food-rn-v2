import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { signOut } from "../../../lib/auth-client";
import { useSession } from "../../../lib/use-session";

export default function Profile() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Redirect even if sign out fails
    }
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {session?.user ? (
        <>
          <Text style={styles.email}>{session.user.email}</Text>
          <Text style={styles.name}>{session.user.name}</Text>
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Not authenticated</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  email: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    padding: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
