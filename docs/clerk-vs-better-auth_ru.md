# Сравнение: Clerk vs Better Auth для Expo/React Native

## Clerk

### Подходы
| Подход | Expo Go | Описание |
|--------|---------|----------|
| **JavaScript (Custom flows)** | ✅ Да | Кастомная UI, без нативных модулей |
| **Native Components** | ❌ Нет | Превью UI от Clerk (SwiftUI/Compose) |

### Работает в Expo Go:
- ✅ Email/password вход (кастомная форма)
- ✅ Phone/SMS вход
- ✅ Session management
- ✅ `tokenCache` через `@clerk/expo` (хранит в памяти)

### Не работает в Expo Go:
- ❌ Нативный OAuth (Google/Apple sign-in через нативные SDK)
- ❌ Биометрия (Face ID / Touch ID)
- ❌ Native UI компоненты от Clerk

### Нюанс с `expo-secure-store`:
- **Не обязателен** для базовой работы
- Clerk может хранить токены **в памяти** (исчезнут при перезапуске)
- Если добавить `expo-secure-store` → сессия сохраняется → **нужен Dev Build**

---

## Better Auth

### Архитектура
- `better-auth` — серверная часть (Node.js/Edge runtime)
- `@better-auth/expo` — клиентская часть для React Native

### Работает в Expo Go:
- ❌ **Ничего не работает** — требуется `expo-secure-store` (нативный модуль)

### Что нужно:
- ✅ Development Build (`npx expo run:android`)
- ✅ `expo-secure-store` для хранения сессий
- ✅ Отдельный backend-сервер с Better Auth

### Поддерживаемые провайдеры:
- ✅ Email/Password
- ✅ OAuth (Google, Apple, GitHub, и др.)
- ✅ Магические ссылки

### Известные проблемы:
- Некоторые плагины используют `jose` (Node-only модуль) — проблемы с бандлом
- OAuth в production может иметь нюансы (есть открытые issues)

---

## Сравнительная таблица

| Характеристика | Clerk (JS flow) | Better Auth |
|---|---|---|
| **Expo Go** | ✅ Да | ❌ Нет |
| **Сессия сохраняется** | ⚠️ Только в памяти | ✅ Да (SecureStore) |
| **OAuth** | ⚠️ Только web flow | ✅ Да |
| **Нужен Dev Build для базы** | ❌ Нет | ✅ Да |
| **Нужен свой сервер** | ❌ Нет (Clerk hosted) | ✅ Да |
| **Кастомный UI** | ✅ Да | ✅ Да |
| **Биометрия** | ❌ (нужен Dev Build) | ✅ Да |
| **Стоимость** | Бесплатно до 10k пользователей | Open Source (бесплатно) |
| **Сложность настройки** | Низкая | Средняя |

---

## Рекомендации

### Выбирайте Clerk если:
- Хотите быстро начать разработку с Expo Go
- Не хотите поднимать свой сервер авторизации
- Нужна простота настройки
- Готовы пересобрать билд позже для `expo-secure-store`

### Выбирайте Better Auth если:
- Уже есть свой сервер с Better Auth
- Нужен полный контроль над данными пользователей
- Готовы собрать Dev Build перед началом разработки
- Хотите Open Source решение

---

## Вывод для текущего проекта

**Для разработки через Expo Go → Clerk (JavaScript flow)** — единственный вариант из двух.

**Для production** в обоих случаях рекомендуется Dev Build для:
- `expo-secure-store` (сохранение сессии)
- Нативный OAuth
- Биометрия
