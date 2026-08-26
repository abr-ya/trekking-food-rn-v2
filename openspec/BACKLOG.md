# Backlog

Two separate registers:

- **Idea pool** — candidate features, **no numbers**. Identified by a stable
  `slug`. Pick the next one *by meaning* (priority / value / dependencies).
- **Build log** — append-only, **numbered**. A feature gets its number the moment
  you *start* implementing it. The number is the build order (not the order ideas
  were added) and is the through-line: `#0001` → branch `feat/0001-<slug>` →
  change `feat-0001-<slug>` → accepted-spec sync → archive
  `YYYY-MM-DD-feat-0001-<slug>` (exact archive naming follows OpenSpec CLI).

Capabilities referenced below are defined in [`CAPABILITIES.md`](./CAPABILITIES.md).

This backlog is for the **mobile client** (`trekking-food-rn-v2`). The React web
app has its own backlog — do not reuse web build numbers here. Domain rules are
shared via [`docs/BUSINESS_LOGIC.md`](../docs/BUSINESS_LOGIC.md).

**Admin note:** Ideas under `admin-features` (and other admin-only UIs) stay on
the map for planning; shipping them on mobile is **optional** and decided per
change.

---

## Workflow

**Numbering**
- Format: 4 digits, zero-padded (`0001`).
- Source of truth for the next number = **last row of the Build log + 1**
  (don't parse folder names — archived changes are date-prefixed).
- First real OpenSpec change is `0001`.
- OpenSpec change names must start with a letter, so the change name is
  `<type>-<NNNN>-<slug>` (mirrors the branch with `-` instead of `/`), e.g.
  `feat-0001-products-list-polish`.

**Adding an idea**
- Append a row to the Idea pool with a unique, stable `slug` (kebab-case).
- `slug` is the idea's identity until it gets a number — reference it in
  `Depends` and don't rename it after work starts.

**Branching**
- One feature = one branch.
- Naming: `<type>/<NNNN>-<slug>` where `type` is `feat` / `fix` / `chore`,
  `NNNN` is the build number, `slug` matches the change/idea slug.
  Example: `feat/0001-products-list-polish`.
- Commits use the short project area / capability as scope, not the build number:
  `feat(products): …`, `docs(auth): …`.
- Creating the branch is the "pull" moment — it's when the number is assigned.
- **Do not create a git commit unless the user explicitly confirms** (see
  `.cursor/rules/no-commit-without-confirmation.mdc`).

**Pulling a task (start implementing)**
1. From the Idea pool, take the most valuable row with `Ready? = yes` and no open
   `Depends`.
2. `next = last # in Build log + 1` (or `0001` if the log is empty).
3. Create the branch: `git checkout -b <type>/0001-<slug>` (use the real next #).
4. `openspec new change "<type>-0001-<slug>"` (name must start with a letter).
5. Append a row to the Build log: `#`, `slug`, `capability`, today's date,
   `in-progress`.
6. Remove the idea from the Idea pool.
7. Run the change through `propose → apply` (pause for human approval at
   checkpoints in `AGENTS.md`).
8. Before archive, always check whether delta specs are synced into
   `openspec/specs/<capability>/spec.md`; if the CLI is unavailable, do the sync
   check manually.
9. Archive only after accepted specs are synced or an explicit decision is made
   to archive without syncing, then set the Build log row to `archived`.

**Temporary docs archive flow**
- While OpenSpec specs are being backfilled capability-by-capability, treat old
  `docs/` plans/reports carefully.
- When a change audits or extends a screen/capability, review only the `docs/`
  files that are directly relevant.
- After their behavior is represented in OpenSpec (`openspec/changes/.../specs/**`
  and later accepted specs), move those processed source docs to `docs/archive/`.
- Do not archive unrelated docs as part of the same change.
- Keep `docs/BUSINESS_LOGIC.md` and other intentionally authoritative docs active
  unless a later change explicitly replaces their role.
- Living technical references (endpoint contracts, payload examples, cache notes)
  belong in `docs/reference/` with capability-scoped kebab-case names when
  extracted from old plans.

**Priorities:** `P0` (urgent) · `P1` (next up) · `P2` (later) · `P3` (nice to have).

---

## Idea pool

Candidates, no numbers. Pick by meaning.

### Foundation / polish (current mobile surface)

| Slug | Feature | Capability | Prio | Ready? | Depends (slug) | Notes |
|------|---------|------------|------|--------|----------------|-------|
| auth-spec-backfill | Backfill accepted `auth` spec from current login/register/session/guard | auth | P1 | yes | — | Document Better Auth Expo client, SecureStore, `fetchApiJson` + `await getCookie`, protected layout |
| products-spec-backfill | Backfill accepted `products` spec for list + form as shipped | products | P1 | yes | — | Cover search, pagination hook, create/edit form, category picker; note gaps vs web |
| products-list-polish | Category filter + delete UX on products list | products | P1 | yes | products-spec-backfill | Hook already supports `categoryId` + `useDeleteProduct`; wire UI |
| navigation-tabs-spec | Spec tab navigator (Home / Products / Profile) | navigation | P2 | yes | — | Mobile nav model ≠ web top menu |
| categories-picker-vs-crud | Decide mobile category scope: picker-only vs full CRUD | categories | P2 | no | — | Clarify product need before building admin-like category screens |

### Domain parity (not started on mobile)

| Slug | Feature | Capability | Prio | Ready? | Depends (slug) | Notes |
|------|---------|------------|------|--------|----------------|-------|
| recipes-mobile-mvp | Recipes list + detail + create/edit ingredients (MVP) | recipes | P1 | no | products-spec-backfill | Blocked until products baseline is solid; Ready? → yes when scoped |
| hikings-mobile-mvp | Hikings list + create + detail shell | hikings | P1 | no | — | Needs UX scope for mobile (no web drag-and-drop assumption) |
| food-planning-mobile | Days × meal times plan on hiking detail | food-planning | P1 | no | hikings-mobile-mvp | |
| packing-mobile | Pack assignment UX suitable for touch (not web DnD copy) | packing | P2 | no | food-planning-mobile | |
| shopping-list-mobile | Trip shopping list + share/export | shopping-list | P2 | no | food-planning-mobile | |
| edit-vegetarians-count | Edit vegetarians count after hiking create | hikings | P2 | yes | hikings-mobile-mvp | Domain TODO in `docs/BUSINESS_LOGIC.md`; Ready once hikings exist |

### Optional / later

| Slug | Feature | Capability | Prio | Ready? | Depends (slug) | Notes |
|------|---------|------------|------|--------|----------------|-------|
| i18n-foundation | Locale switching (`en`/`ru`) with persistence | i18n | P3 | yes | — | UI is English-only today |
| admin-features-mobile | Admin marketing/roadmap features UI | admin-features | P3 | no | — | **Optional on mobile** — may stay web-only |
| mobile-test-strategy | Choose and scaffold unit/component tests | (infra) | P2 | yes | — | No Vitest/Jest suite yet; propose before adding deps |
| npm-audit-followup | Track Expo SDK / overrides for npm audit | (infra) | P3 | yes | — | See `docs/npm-audit-status_en.md`; avoid `audit fix --force` |

---

## Build log

Append-only. Number = order implementation started. Next number = **0003**.

| # | Slug | Capability | Started (YYYY-MM-DD) | Change / Status |
|---|------|------------|----------------------|-----------------|
| 0001 | products-list-pagination | products | 2026-08-26 | 2026-08-26-feat-0001-products-list-pagination / archived |
| 0002 | local-release-apk | native-release | 2026-08-26 | chore-0002-local-release-apk / in-progress |
