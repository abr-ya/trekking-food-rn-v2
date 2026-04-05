
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Thin wrapper; session is loaded automatically via the expoClient plugin.
  return <>{children}</>;
}
