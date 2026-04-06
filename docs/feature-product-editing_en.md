# Feature: Product Creation, Editing & Deletion

## Description

Add the ability to **create**, **edit**, and **delete** products in the trekking-food-v2 app.

A **hybrid approach** is used:
- **Quick edit** — a bottom sheet for fast name + category changes
- **Full form** — a dedicated screen for creating or editing all product fields (form is **reused** for both create and edit modes)
- **Delete** — confirmation dialog on card

---

## Current State

| Feature | Status |
|---|---|
| Product list display (FlatList + ProductCard) | ✅ |
| Search by name | ✅ |
| `fetchApiJson` API client (authenticated GET) | ✅ |
| Add products | ❌ |
| Edit products | ❌ |
| Delete products | ❌ |
| Mutation API hooks | ❌ |
| Category selector UI | ❌ |

---

## Architecture Overview

### Components

| Component | Purpose | Fields | Trigger |
|---|---|---|---|
| **Quick Edit Sheet** | Fast name + category edit | `name`, `category` | ✏️ icon on card |
| **Full Form Screen** | Create or full edit | All fields | ➕ header button or ⚙️ icon on card |
| **Delete Confirmation** | Remove product | — | 🗑️ icon on card |

### Navigation Flow

```
Products Screen (products.tsx)
  │
  ├─ [➕ Header button] ───→ router.push('/product-form')
  │                               Create mode, empty form
  │
  ├─ [✏️ on card] ──────────→ Open QuickEditSheet
  │                               Quick edit (name + category)
  │
  ├─ [⚙️ on card] ──────────→ router.push(`/product-form?id=${id}`)
  │                               Edit mode, pre-filled form
  │
  └─ [🗑️ on card] ──────────→ Alert.confirm → useDeleteProduct(id)
                                  Delete with confirmation
```

After any mutation:
1. Show success feedback (Alert)
2. Navigate back (if on form screen): `router.back()`
3. List auto-refreshes via React Query `invalidateQueries(["products"])`

---

## Data Model

### Product

```typescript
interface Product {
  id: string;
  name: string;
  kkal: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  price: number;
  is_vegetarian: boolean;
  product_category_id: string;
  is_common: boolean;
  user_id: string;
  category: ProductCategory;
}
```

### Input Types

```typescript
interface CreateProductInput {
  name: string;
  product_category_id: string;
  kkal: number;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  price?: number;
  is_vegetarian?: boolean;
}

interface UpdateProductInput extends Partial<CreateProductInput> {}

interface QuickUpdateInput {
  name?: string;
  product_category_id?: string;
}
```

### Validation Rules

| Field | Required | Rules |
|---|---|---|
| `name` | ✅ | Min 2 characters, trimmed |
| `product_category_id` | ✅ | Must be a valid category ID |
| `kkal` | ✅ | Number >= 0 |
| `proteins` | ❌ | Number >= 0 (default 0) |
| `fats` | ❌ | Number >= 0 (default 0) |
| `carbohydrates` | ❌ | Number >= 0 (default 0) |
| `price` | ❌ | Number >= 0 (default 0) |
| `is_vegetarian` | ❌ | Boolean (default false) |

---

## API Hooks

### File: `app/hooks/use-product-data.ts`

#### Queries

| Hook | Method | Endpoint | Purpose |
|---|---|---|---|
| `useProducts(params)` | GET | `/products?...` | List with pagination (existing) |
| `useProduct(id)` | GET | `/products/:id` | Single product (pre-fill edit form) |
| `useProductCategories()` | GET | `/product-categories` | Category list for selector |

#### Mutations

| Hook | Method | Endpoint | Purpose |
|---|---|---|---|
| `useCreateProduct()` | POST | `/products` | Create new product |
| `useUpdateProduct()` | PATCH | `/products/:id` | Partial update (full + quick edit) |
| `useDeleteProduct()` | DELETE | `/products/:id` | Delete product |

All mutations:
- Use `fetchApiJson` for authenticated requests
- Invalidate `["products"]` query key on success
- Handle errors and surface them to the caller

#### `fetchApiJson` Update

The existing helper only supports GET. Extend to accept options:

```typescript
export async function fetchApiJson<T>(
  path: string,
  options?: { method?: string; body?: string }
): Promise<T> {
  const cookie = authClient.getCookie();
  const url = `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
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
```

---

## UI Components

### 1. Full Form Screen

**Route:** `app/(authenticated)/product-form.tsx`

**Modes:**

| Mode | Trigger | `id` param | Behavior |
|---|---|---|---|
| Create | ➕ header button | absent | Empty form, POST on save |
| Edit | ⚙️ icon on card | present (`?id=...`) | Pre-filled form, PUT on save |

**Layout:**

```
┌─────────────────────────────────┐
│  ← Back    Add Product    Save  │  (header, title changes per mode)
├─────────────────────────────────┤
│                                 │
│  Name *                         │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  Category *                     │
│  ┌───────────────────────────┐  │
│  │ Select category       ▼   │  │
│  └───────────────────────────┘  │
│                                 │
│  Calories (kcal) *              │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  Proteins (g)                   │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  Fats (g)                       │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  Carbohydrates (g)              │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  Price                          │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  Vegetarian           [Toggle]  │
│                                 │
│  ┌───────────────────────────┐  │
│  │         Save              │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**Key logic:**
- Reads `id` from `useLocalSearchParams()`
- If `id` present → fetch product via `useProduct(id)`, pre-fill form
- On save → validate → call `createProduct.mutateAsync()` or `updateProduct.mutateAsync()`
- Show loading spinner while fetching existing product (edit mode)

#### Category Selector

**Recommended:** Custom modal (TouchableOpacity → Modal with FlatList) — no new dependencies.

```
┌──────────────────────────────┐
│  Select Category             │
├──────────────────────────────┤
│  ○  Meat                     │
│  ○  Fish                     │
│  ○  Dairy                    │
│  ○  Grains                   │
│  ○  Vegetables               │
│  ○  Fruits                   │
│  ...                         │
├──────────────────────────────┤
│        Cancel                │
└──────────────────────────────┘
```

#### Dynamic Header

```typescript
useLayoutEffect(() => {
  navigation.setOptions({
    title: isEditMode ? "Edit Product" : "Add Product",
    headerRight: () => (
      <TouchableOpacity onPress={handleSave}>
        <Text style={{ color: "#0066cc", fontSize: 16, fontWeight: "600" }}>
          Save
        </Text>
      </TouchableOpacity>
    ),
  });
}, [isEditMode, handleSave, navigation]);
```

### 2. Quick Edit Sheet

**File:** `lib/components/QuickEditSheet.tsx`

**Fields:** `name` (TextInput) + `category` (Selector)

**Behavior:**
- Opens on ✏️ tap with pre-filled data
- "Save" → calls `useUpdateProduct` with `{ name?, product_category_id? }`
- "Cancel" / swipe down → closes without saving
- Slide up/down animation via `Animated` + `Modal`
- Background dimming (overlay)

**Technical:**
- React Native `Modal` + `translateY` animation
- No external dependencies (no `@gorhom/bottom-sheet`)

**Layout:**

```
┌─────────────────────────────────┐
│        (dimmed overlay)         │
│                                 │
│  ┌───────────────────────────┐  │
│  │  Quick Edit          [✕]  │  │
│  │                           │  │
│  │  Name                     │  │
│  │  ┌─────────────────────┐  │  │
│  │  │                     │  │  │
│  │  └─────────────────────┘  │  │
│  │                           │  │
│  │  Category                 │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ Current         ▼   │  │  │
│  │  └─────────────────────┘  │  │
│  │                           │  │
│  │  ┌─────────────────────┐  │  │
│  │  │       Save          │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 3. Product Card Actions

Each card gets action icons in the header:

```
┌─────────────────────────────────┐
│  Chicken Breast          ✏️ ⚙️ 🗑️│
│  Meat                           │
│  165 kcal  P:31g  F:3.6g  C:0g  │
│  Price: 250.00  🌿 Vegetarian   │
└─────────────────────────────────┘
```

| Icon | Action |
|---|---|
| ✏️ | Open Quick Edit Sheet |
| ⚙️ | Navigate to full form (edit mode) |
| 🗑️ | Confirmation dialog → delete |

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/products` | Create product |
| `PATCH` | `/products/:id` | Partial update (full form & quick edit) |
| `DELETE` | `/products/:id` | Delete product |
| `GET` | `/products/:id` | Get single product (edit pre-fill) |
| `GET` | `/product-categories` | Category list |

### Request Body (POST/PUT)

```json
{
  "name": "Chicken Breast",
  "product_category_id": "cat-123",
  "kkal": 165,
  "proteins": 31,
  "fats": 3.6,
  "carbohydrates": 0,
  "price": 250,
  "is_vegetarian": false
}
```

### Response

```json
{
  "id": "prod-456",
  "name": "Chicken Breast",
  "kkal": 165,
  "proteins": 31,
  "fats": 3.6,
  "carbohydrates": 0,
  "price": 250,
  "is_vegetarian": false,
  "product_category_id": "cat-123",
  "is_common": false,
  "user_id": "user-789",
  "category": {
    "id": "cat-123",
    "name": "Meat"
  }
}
```

---

## Implementation Plan

### Phase 1: Update `fetchApiJson` & Add Hooks

**File:** `app/hooks/use-product-data.ts`

- [ ] Extend `fetchApiJson` to accept `{ method?, body? }` options
- [ ] Add `CreateProductInput`, `UpdateProductInput` types
- [ ] Add `useProductCategories()` — GET `/product-categories`
- [ ] Add `useProduct(id)` — GET single product
- [ ] Add `useCreateProduct()` — POST mutation
- [ ] Add `useUpdateProduct()` — PATCH mutation
- [ ] Add `useDeleteProduct()` — DELETE mutation
- [ ] All mutations invalidate `["products"]` query key

**Pre-check (before coding):**

- [ ] **Verify error response format** — make a test request (e.g. POST `/products` with empty body or invalid data) and check what the server returns on 400/422. Is it `{ error: "message" }`, `{ message: "..." }`, or something else? This determines how we parse and display errors in the UI.
- [ ] **Verify `/product-categories` response** — check that it returns `[{ id, name }]` and not wrapped in `{ data: [...] }`.
- [ ] **Verify required fields on server** — does the server auto-set `user_id`, `is_common`, or does the client need to send them?

### Phase 2: Full Form Screen

**File:** `app/(authenticated)/product-form.tsx`

- [ ] Create screen with all form fields
- [ ] Support create mode (no `id`) and edit mode (`?id=...`)
- [ ] Pre-fill form from `useProduct(id)` in edit mode
- [ ] Category selector (custom modal with FlatList)
- [ ] Switch toggle for `is_vegetarian`
- [ ] Validation (name, category, kkal required)
- [ ] Dynamic header title + Save button
- [ ] Loading state while fetching product (edit mode)
- [ ] Error handling (Alert on server error)
- [ ] Success → `router.back()`

### Phase 3: Integrate Form with Products Screen

**File:** `app/(authenticated)/(tabs)/products.tsx`

- [ ] Add ➕ header button → `router.push('/product-form')`
- [ ] Add ⚙️ icon on each card → `router.push(`/product-form?id=${id}`)`
- [ ] Add 🗑️ icon on each card → `Alert.confirm` → `useDeleteProduct(id)`

### Phase 4: Quick Edit Sheet

**File:** `lib/components/QuickEditSheet.tsx`

- [ ] Create component: `Modal` + `Animated` slide up/down
- [ ] Fields: `name` (TextInput) + `category` (selector)
- [ ] Pre-fill with product data on open
- [ ] "Save" → call `useUpdateProduct` with partial data
- [ ] "Cancel" / swipe down → close without saving
- [ ] Background overlay (dimmed)

**File:** `app/(authenticated)/(tabs)/products.tsx`

- [ ] Add ✏️ icon on each card → open `QuickEditSheet`
- [ ] Pass product data as props to sheet
- [ ] On save success → card updates (React Query invalidation)

### Phase 5: Testing & Polish

- [ ] Create product via full form → verify in list
- [ ] Edit via full form → verify changes
- [ ] Quick edit (name only) → verify changes
- [ ] Quick edit (category only) → verify changes
- [ ] Delete product → verify removal from list
- [ ] Validation errors (empty name, invalid kkal, etc.)
- [ ] Server error handling (Alert with message)
- [ ] Loading states (form pre-fill, mutations)
- [ ] Test on different screen sizes

---

## File Structure

```
app/
  hooks/
    use-product-data.ts             # All product queries + mutations
  (authenticated)/
    (tabs)/
      products.tsx                  # + ➕ header, ✏️ ⚙️ 🗑️ on cards
    product-form.tsx                # New: create/edit full form

lib/
  auth-client.ts                    # + fetchApiJson options support
  components/
    QuickEditSheet.tsx              # New: quick edit bottom sheet
    CategoryPicker.tsx              # New: category selector modal
```

---

## Dependencies

| Package | Status | Notes |
|---|---|---|
| `@tanstack/react-query` | ✅ Already installed | Mutations + cache invalidation |
| `expo-router` | ✅ Already installed | Navigation + route params |
| `react-native` | ✅ Built-in | Modal, Animated, Switch, TextInput, Alert |
| `@expo/vector-icons` | ✅ Already installed | Ionicons for action icons |
| **New dependencies** | ❌ None required | All UI built from built-in components |

---

## Design Decisions

1. **Single reusable form** — `product-form.tsx` handles both create and edit. Mode determined by presence of `id` query param.

2. **No new dependencies** — category picker and bottom sheet are custom implementations using built-in `Modal` + `Animated`.

3. **Two edit depths** — quick sheet for fast name/category changes, full form for everything else. User chooses via ✏️ vs ⚙️ icons.

4. **`fetchApiJson` extended** — was GET-only, now supports `method` and `body` for mutations.

5. **React Query invalidation** — all mutations invalidate `["products"]`, triggering automatic list refresh.

6. **Error handling** — server errors caught and displayed via `Alert.alert`.

7. **Loading states** — spinner shown while fetching existing product in edit mode.
