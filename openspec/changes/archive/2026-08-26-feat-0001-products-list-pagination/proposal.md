## Why

The products list already fetches a paginated API (`page`, `limit`, `totalPages`) and shows “page X/Y”, but the screen always requests `page: 1`. Users cannot reach products beyond the first 20 items. Explicit page controls on the list fix that without waiting for later catalog polish (category filter, delete).

## What Changes

- Keep using the existing `useProducts` query (`page`, `limit`, search). No API or hook contract change.
- Track the current page in the products list screen and pass it into `useProducts`.
- Add visible Previous / Next controls plus a page indicator (e.g. “Page 2 of 5”).
- Disable Previous on the first page and Next on the last page (or when there is no next page).
- Reset to page 1 when the user submits a new search.
- Keep page size at 20 (existing default). No infinite scroll, page-number grid, or jump-to-page field.

## Capabilities

### New Capabilities

- `products`: Mobile product catalog list — search, server-side pagination, and explicit page navigation. (First OpenSpec spec for this capability; create/edit form and category filter stay out of this change.)

### Modified Capabilities

- *(none — `openspec/specs/products/` does not exist yet)*

## Impact

- **Code:** `app/(authenticated)/(tabs)/products.tsx` (page state + controls). `app/hooks/use-product-data.ts` is already sufficient.
- **API:** unchanged (`GET /products?page=&limit=&search=`).
- **Dependencies:** none.
- **Docs/backlog:** idea pulled as build `#0001` on `feat/0001-products-list-pagination`.
- **Out of scope:** category filter, delete UX, infinite scroll, page-size picker, product form.
