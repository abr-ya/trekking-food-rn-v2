## 1. Page state

- [ ] 1.1 Add `page` state (default `1`) on the products list screen and pass it to `useProducts` instead of a hardcoded `1`
- [ ] 1.2 Reset `page` to `1` when the user submits a search so the new query always starts on the first page

## 2. Pagination bar

- [ ] 2.1 Add a sticky footer below the list: Previous, `Page X of Y`, Next (English copy)
- [ ] 2.2 Disable Previous on page 1 and Next on the last page / when there is no next page; keep both buttons visible when disabled
- [ ] 2.3 Narrow the top result-info line to total count (`Found: N products`); leave page position on the footer only

## 3. Page-change loading

- [ ] 3.1 Keep the previous page visible while the next page loads (`placeholderData` / `keepPreviousData` on `useProducts`, optional param if the default should not change for other callers)

## 4. Verify

- [ ] 4.1 Run `npx tsc --noEmit && npm run lint`
