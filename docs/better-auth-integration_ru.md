# Интеграция Better Auth в trekking-food-v2

## Что сделали

---

### 1. Зависимости

```bash
# Нативные модули
npx expo install expo-secure-store   # Хранение сессии (токены)
npx expo install expo-network         # Отслеживание сети
npm install better-auth @better-auth/expo
```

---

### 2. Переменные окружения

**Файл:** `.env` (не коммитим в git!)

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

- `10.0.2.2` — адрес **твоего компьютера** для Android эмулятора
- Для реального устройства — используй IP компьютера в локальной сети
- `EXPO_PUBLIC_` — Expo подставляет эти переменные на этапе сборки

---

### 3. Структура файлов

```
app/
├── login.tsx                          ← Экран входа (email/password)
├── register.tsx                       ← Экран регистрации
├── _layout.tsx                        ← Корневой layout (Stack)
├── (authenticated)/                   ← Защищённая зона
│   ├── _layout.tsx                    ← Auth-guard: редирект на /login
│   └── (tabs)/                        ← Tab-навигация
│       ├── _layout.tsx
│       ├── index.tsx                  ← Главная страница
│       └── profile.tsx                ← Профиль (email, имя, выход)

lib/
├── auth-client.ts                     ← Клиент Better Auth
├── auth-provider.tsx                  ← Провайдер (заглушка)
└── use-session.ts                     ← React hook для сессии
```

---

### 4. Клиент Better Auth

**Файл:** `lib/auth-client.ts`

```ts
import { createAuthClient } from 'better-auth/client';
import * as SecureStore from 'expo-secure-store';
import { expoClient } from '@better-auth/expo/client';

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000',
  plugins: [
    expoClient({
      storage: SecureStore,  // Сессия хранится в SecureStore
    }),
  ],
});

export const { signIn, signUp, signOut } = authClient;
```

**Почему `SecureStore`:**
- Токен сессии хранится в **зашифрованном хранилище** устройства
- Сохраняется между перезапусками приложения
- Доступно только этому приложению

---

### 5. Hook для сессии

**Файл:** `lib/use-session.ts`

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

**Зачем:** `createAuthClient` использует nanostores. Обёртка превращает в React hook.

---

### 6. Auth-guard

**Файл:** `app/(authenticated)/_layout.tsx`

```ts
const session = useSession();

useEffect(() => {
  if (session.isPending) return;

  if (!session.data) {
    // Нет сессии → редирект на login
    router.replace('/login');
  }
}, [session.data, session.isPending]);

// Показываем контент только если есть сессия
if (!session.data) return <Loading />;

return <Stack>...</Stack>;
```

**Логика:**
- Если нет сессии — пользователь **не увидит** защищённые экраны
- Загрузка сессии → показываем лоадер
- Если авторизован — показываем контент

---

### 7. Экраны входа/регистрации

**Файлы:** `app/login.tsx`, `app/register.tsx`

**Логика login:**
```ts
const { data, error } = await signIn.email({ email, password });
if (error) { Alert.alert('Ошибка', error.message); }
else { router.replace('/'); }
```

**Логика register:**
```ts
const { data, error } = await signUp.email({
  email,
  password,
  name: email.split('@')[0],
});
if (error) { Alert.alert('Ошибка', error.message); }
else { Alert.alert('Успех'); router.replace('/login'); }
```

**Если уже авторизован:**
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

### 8. Профиль

**Файл:** `app/(authenticated)/(tabs)/profile.tsx`

Показывает:
- Email пользователя
- Имя
- Кнопка выхода

```ts
const handleSignOut = async () => {
  try { await signOut(); } catch (err) {}
  router.replace('/login');
};
```

---

### 9. Настройки бэкенда

На сервере Better Auth нужно добавить `trustedOrigins`:

```ts
export const auth = betterAuth({
  // ...твой конфиг
  trustedOrigins: [
    "http://localhost:4000",
    "exp://",
    "trekkingfoodv2://",
  ],
});
```

**Зачем:** Без этого запросы с эмулятора/устройства будут отвергнуты (CORS/Origin).

---

### 10. Сборка и запуск

**Dev Build** (первый раз, после установки нативных модулей):
```bash
npx expo run:android
```

**Обычный запуск** (разработка):
```bash
npx expo start --clear
```

**Сборка APK** для телефона:
```bash
npm run apk          # Debug
npm run apk:release  # Release
```

---

### 11. Редиректы

| Ситуация | Откуда | Куда | Где настраивается |
|----------|--------|------|-------------------|
| Нет сессии | `/(authenticated)/_layout.tsx` | `/login` | Auth-guard |
| Есть сессия, но на login | `/login.tsx` | `/` | `useFocusEffect` |
| Есть сессия, но на register | `/register.tsx` | `/` | `useFocusEffect` |
| Успешный вход | `/login.tsx` | `/` | `router.replace('/')` |
| Успешная регистрация | `/register.tsx` | `/login` | Alert callback |
| Выход из профиля | `/profile.tsx` | `/login` | `router.replace('/login')` |

---

### 12. Что добавили в `.gitignore`

```
.env
```

---

### Что дальше

- [ ] Добавить OAuth (Google, GitHub)
- [ ] Восстановление пароля
- [ ] Верификация email
- [ ] Настройки профиля
- [ ] Динамическая смена сервера (Secure Store для URL)
