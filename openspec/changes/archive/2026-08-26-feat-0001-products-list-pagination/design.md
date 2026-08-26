## Context

See proposal.md for motivation. The list screen (`app/(authenticated)/(tabs)/products.tsx`) already renders search, result meta (`Found: N products (page X/Y)`), and a `FlatList` of the current page. `useProducts` already accepts `page` and `limit` and keys the React Query cache on those values. The only missing piece is list-local page state wired to the hook and visible Previous / Next controls.

Page size stays 20. Create/edit, category filter, and delete are out of scope.

## Goals / Non-Goals

**Goals:**

- Drive `useProducts({ page })` from screen state instead of a hardcoded `1`.
- Put always-visible Previous / Next + page label on the products tab.
- Reset page to 1 when a new search is submitted.

**Non-Goals:**

- Changing the hook, API params, or response normalization.
- Infinite scroll, page-number chips, jump-to-page input, or a page-size picker.
- Extracting a shared pagination component (not needed until a second list uses it).

## Decisions

### 1. Previous / Next bar, not numbered pages

- **Choice:** A compact footer: Previous | `Page X of Y` | Next.
- **Why:** Fits a small mobile tab, matches “explicit control”, and needs no extra API. Numbered page chips and a page input are more UI than this list needs.
- **Alternatives:** Infinite scroll / “Load more” (not explicit page control; harder to jump back). Page-number row (clutters the tab once `totalPages` is large).

### 2. Sticky footer below the list, not inside `ListFooterComponent`

- **Choice:** A bar at the bottom of the screen, sibling to `FlatList` (search stays at the top).
- **Why:** Controls stay reachable without scrolling to the end of 20 cards. `ListFooterComponent` would hide them until the user scrolls.
- **Alternatives:** Controls in the existing result-info row (crowded next to “Found: N”). Header-only (easy to miss).

### 3. Reuse the existing result-info line for totals; footer owns page navigation

- **Choice:** Keep “Found: N products” in the current info row. Footer shows “Page X of Y” as the pager label so the two lines do not duplicate the same sentence.
- **Why:** Count vs position are different jobs; one line of each is enough.
- **Alternatives:** Drop the top info row entirely (loses total count). Repeat “page X/Y” in both places (noisy).

### 4. Page state on the screen; hook unchanged

- **Choice:** `const [page, setPage] = useState(1)` passed into `useProducts`. `handleSearch` sets page to 1 then updates `submittedSearch` (or both in one event so page 1 is requested with the new search).
- **Why:** Pagination is view state. The hook already caches per `["products", page, limit, search, categoryId]`.
- **Alternatives:** URL query `?page=` (overkill for a tab; back from product-form should not restore an old page). Moving page into the hook (hides UI state in a data hook).

### 5. Replace the page; keep previous data while the next page loads

- **Choice:** Do not append pages. Use React Query’s `placeholderData: keepPreviousData` (or equivalent `placeholderData: (prev) => prev`) so the list does not flash empty between pages.
- **Why:** Page navigation should feel like swapping the current 20 rows, not like a full-screen reload. `keepPreviousData` is a one-line hook option and does not change the public hook contract.
- **Alternatives:** Full-screen spinner on every page change (janky). Leave stale page 1 visible without placeholder (wrong items labeled as the new page).

If adding `placeholderData` to `useProducts` would affect other future callers, pass it only from this screen via a hook option — prefer a small optional param over forking the query.

### 6. Disabled buttons, not hidden

- **Choice:** Previous/Next stay visible when disabled (first/last/single page).
- **Why:** The spec requires visible controls even on a single page; hiding them would look like a missing feature.

## Risks / Trade-offs

- **[Risk]** A page request lands past `totalPages` (deleted products, search change race). → Clamp Next using `meta.totalPages`; reset to page 1 on search submit; if `meta.page` comes back lower than requested, trust `meta.page` for the indicator.
- **[Risk]** Footer plus tab bar feels tight on small phones. → Keep the bar one row, English labels “Previous” / “Next” (or chevron + text), no extra padding beyond existing list/tab spacing.
- **[Trade-off]** Explicit paging is slower than infinite scroll for long browse sessions. Acceptable: the catalog is a lookup list, and the user asked for explicit control.

## Migration Plan

- Ship with the products tab JS bundle; no native rebuild, env, or API migration.
- Rollback: revert the screen (and any optional `placeholderData` hook tweak); first-page-only behavior returns.

## Open Questions

None that block implementation. Copy can be “Previous” / “Next” and “Page {n} of {m}”; tweak during apply if the existing “Found: …” line should be shortened.
