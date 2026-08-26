# AGENTS.md

Guidance for AI agents working in this repo. Keep it thin — the detailed sources
of truth live in `openspec/` and `docs/`.

## What this project is

Trekking Food — a **mobile app** (Expo / React Native + TypeScript) for planning
meals on hiking trips. Backend is a separate REST API with Better Auth (not in
this repo). This client talks to it over HTTP; Android emulator uses
`10.0.2.2` to reach the host machine.

## Work through OpenSpec — this is the primary workflow

All non-trivial work goes through OpenSpec. Do not free-code features outside it.

Sources of truth (read these first, in this order):

1. `openspec/BACKLOG.md` — **the workflow**: idea pool, build log, numbering,
   branching, and the pull ritual. Follow it exactly.
2. `openspec/CAPABILITIES.md` — capability map (what exists / is planned).
3. `openspec/config.yaml` — project context + per-artifact rules.
4. `docs/BUSINESS_LOGIC.md` — authoritative domain model and business rules.

Key points (see `BACKLOG.md` for the full ritual):

- Pick the next feature from the **Idea pool** by meaning (priority / readiness /
  dependencies), not by number.
- A feature gets its **build number** (`NNNN`) the moment work starts. That
  number is the through-line: branch `feat/NNNN-<slug>` → change
  `feat-NNNN-<slug>` (OpenSpec names must start with a letter).
- Commit scopes use the short project area / capability, not the build number:
  `docs(i18n): propose top-menu localization`, `feat(products): …`.
- Run each change through `propose → apply → sync accepted specs → archive`.
- Before archiving, always check delta spec synchronization against
  `openspec/specs/<capability>/spec.md`. If the OpenSpec CLI is unavailable,
  perform the sync check manually and update accepted specs before moving the
  change into `openspec/changes/archive/`.

## Checkpoints — pause and hand back to the human

Stop and tell the user (do not proceed automatically) at these points:

- **After the feature spec/proposal is created, before implementation.** Present
  what will be built and wait for approval to start coding.
- **After implementation/validation, before accepted-spec sync.** Do not update
  `openspec/specs/<capability>/spec.md` until the user explicitly approves spec
  sync for the change.
- **After accepted-spec sync, before archive.** Do not move the change into
  `openspec/changes/archive/` or mark it archived until the user explicitly
  approves archiving.

## Commands: who runs what

Commands the **agent may run** (read-only / verification):

- `npx tsc --noEmit` — type check
- `npm run lint` — Expo ESLint

Commands the **user runs** — do NOT execute these; instead tell the user the
exact command to run:

- `npx expo start` / `npx expo start --dev-client` — Metro bundler
- `npx expo run:android` / `npm run android` — native rebuild + install on
  emulator/device (needed after native module or env changes)
- `npm run ios` — iOS native run
- `npm run apk` / `npm run apk:release` — Gradle APK builds
- Any package install. When a dependency is needed, tell the user **when** and the
  **exact command**. Prefer `npx expo install <pkg>` for Expo-ecosystem packages
  so versions match the SDK. Do not add or modify dependencies yourself.

## Token economy

Optimize for low token usage:

- Be concise; avoid restating unchanged context or large file dumps.
- Read narrowly (targeted ranges / specific files) instead of broad scans; reuse
  what's already in context.
- Prefer small, targeted edits over rewriting whole files.
- Don't pipe large command output into the chat; summarize.

If a repo/editor setting would meaningfully reduce token use, suggest it (and the
exact change) rather than applying it silently.

## Stack & layout (brief)

- **Runtime:** Expo SDK 54, React Native `0.81.x`, React `19.1`, TypeScript.
- **Routing:** Expo Router (file-based) under `app/`. Auth screens at root;
  protected area in `app/(authenticated)/` with tab navigator.
- **Auth:** Better Auth client (`lib/auth-client.ts`) + `@better-auth/expo` +
  `expo-secure-store`. Session cookie must be `await authClient.getCookie()`
  before REST calls (`fetchApiJson`).
- **Data:** TanStack React Query; product hooks in `app/hooks/`
  (alias `@hooks/*`). Authenticated REST via `fetchApiJson` in `lib/auth-client.ts`
  — screens must not call the API with raw `fetch`.
- **Env:** `.env` from `example.env`; `EXPO_PUBLIC_API_URL` = API root (auth at
  `{URL}/api/auth`). Restart Metro after env changes. Native modules require a
  **development build** (`expo-dev-client`), not Expo Go alone.
- Mobile-specific notes also live in `docs/` (auth, troubleshooting, audit).

## Conventions (brief; full list in `openspec/config.yaml`)

- Path aliases: `@/*` → repo root; `@hooks/*` → `app/hooks/*`.
- API payloads often use snake_case; keep types/normalization consistent with
  existing hooks (do not invent a parallel camelCase layer without a change).
- Screens/components do not call the API directly — go through hooks /
  `fetchApiJson`.
- User-facing UI strings are in English.
- Verify changes with `npx tsc --noEmit && npm run lint`.
- After adding/changing native Expo modules, remind the user to rebuild with
  `npx expo run:android` (JS reload is not enough).
