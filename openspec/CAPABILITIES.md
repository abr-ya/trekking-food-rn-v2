# Capability Map

Lightweight inventory of the app's domains ("capabilities"). This is **not** a
spec — it's an orientation map. Real, authoritative specs live in
`openspec/specs/<capability>/spec.md` and are backfilled *just-in-time* as we
touch each area through OpenSpec changes.

- **Status legend:** ✅ implemented · 🟡 partial · ⬜ planned / not started
- **Spec:** whether an authoritative spec exists yet in `openspec/specs/`
- Domain source of truth: [`docs/BUSINESS_LOGIC.md`](../docs/BUSINESS_LOGIC.md)
  (may be shared / imported from the web app; keep mobile behavior aligned with
  domain rules unless an OpenSpec change explicitly diverges)

**Mobile note:** Capability names match the React web app so domain language
stays shared. **Admin-oriented surfaces are optional on mobile** — keep them on
the map for parity and backlog planning, but do not assume every admin web
feature will ship in this client.

## Capabilities

| Capability | Status | Spec | What it covers | Key code |
|---|---|---|---|---|
| `products` | 🟡 | ✅ | Product catalog: nutrition (kkal/proteins/fats/carbs), price, vegetarian flag, category, personal vs. shared (`isCommon`); list with pagination + search; create/edit form. Accepted spec covers list search + explicit page controls; form / category filter / delete UX may still be incomplete vs web | `app/hooks/use-product-data.ts`, `app/(authenticated)/(tabs)/products.tsx`, `app/(authenticated)/product-form.tsx` |
| `recipes` | ⬜ | ⬜ | Recipes as sets of ingredients (product + grams/serving); create, list, detail; edit metadata; add/edit ingredients | — |
| `categories` | 🟡 | ⬜ | Product categories: read for pickers (`GET /product-categories`). Full category CRUD UI (create/edit/delete, multi-filter) not in mobile yet | `useProductCategories` in `app/hooks/use-product-data.ts`, category picker in `product-form.tsx` |
| `hikings` | ⬜ | ⬜ | Trip entity: days/members/vegetarians, create, list (paginated + search), detail, group-size change with pack recompute | — |
| `food-planning` | ⬜ | ⬜ | Distribute products/recipes across days × meal times; per-person and total quantities; auto-calc totals; day comments | — |
| `packing` | ⬜ | ⬜ | Organize meal lines into day packs / trip packs per member; assignment UX (web: drag & drop); auto-distribute; export | — |
| `shopping-list` | ⬜ | ⬜ | Aggregate product totals across the trip; export | — |
| `auth` | ✅ | ⬜ | Better Auth email/password; Expo SecureStore session; protected `(authenticated)` routes; login/register/profile sign-out. Roles (owner / hiking-admin / admin tooling) — follow web domain when needed; not all role UIs required on mobile | `lib/auth-client.ts`, `lib/use-session.ts`, `app/login.tsx`, `app/register.tsx`, `app/(authenticated)/_layout.tsx`, `app/(authenticated)/(tabs)/profile.tsx` |
| `admin-features` | ⬜ | ⬜ | Admin CRUD for marketing/roadmap "features" (web home/landing). **Optional on mobile** — may stay web-only unless product decides otherwise | — |
| `navigation` | 🟡 | ⬜ | Tab navigator: Home / Products / Profile (Expo Router). Not the web top-menu / admin nav model | `app/(authenticated)/(tabs)/_layout.tsx`, `app/_layout.tsx` |
| `i18n` | ⬜ | ⬜ | UI language switching (`en`/`ru`) with persisted locale. Mobile UI strings are English today | — |
| `native-release` | 🟡 | ⬜ | Local version bump + release APK for phone-only use (no Metro / no EAS). Default proposes minor bump with confirm; major/patch via flags | `scripts/release-apk.sh`, `npm run release:apk` |

## Known planned / gaps

Candidates for future OpenSpec changes (`/opsx-propose` or propose workflow). Not
yet started unless noted.

- **Parity with web domains** — recipes, hikings, food-planning, packing,
  shopping-list are on the shared map but not started in this client.
- **Admin surfaces** — `admin-features` and admin-only nav/role UIs are
  **not committed for mobile**; track them here, decide per change whether to
  implement, stub, or leave web-only.
- **Products polish** — category filter on list UI, delete UX, full parity with
  web catalog flows.
- **Categories management** — beyond picker: create/edit/delete if mobile needs
  it (else keep API-backed picker only).
- **Edit vegetarians count** — domain gap also noted on web
  (`vegetariansTotal` at creation only); apply when hikings land on mobile.
- **Native / env ops** — development build required (`expo-dev-client`);
  `EXPO_PUBLIC_API_URL` via `.env` / `example.env`; rebuild after native modules.
  Phone-standalone APK: `npm run release:apk` (`native-release`).
- **Tests** — no Vitest suite in this app yet (web has thin coverage); add when
  an OpenSpec change introduces a testing strategy.

## How this maps to OpenSpec

```
CAPABILITIES.md (this file)     →  the map: what exists, at a glance
openspec/specs/<capability>/    →  the truth: written just-in-time per capability
openspec/changes/<change>/      →  the work: proposals for new/planned features
```

When a change is archived, its delta spec is synced into
`openspec/specs/<capability>/spec.md`, so the `Spec` column above fills in over
time. Keep the table honest: update Status/Spec as capabilities evolve.
