
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Просто обёртка, сессия загружается автоматически через expoClient плагин
  return <>{children}</>;
}
