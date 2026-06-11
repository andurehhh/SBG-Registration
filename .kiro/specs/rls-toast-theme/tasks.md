# Implementation Plan: RLS, Toast, and Theme

## Overview

This plan implements three features in dependency order: (1) database RLS hardening via a Postgres VIEW, (2) a Zustand-based toast notification system with admin action integration, and (3) a ThemeProvider with CSS variable layer and toggle component. Tasks are ordered so each step builds on prior work — the toast store must exist before integrating with admin actions, and CSS variables must be defined before the ThemeToggle renders meaningful icons.

## Tasks

- [x] 1. Database: RLS hardening and public view
  - [x] 1.1 Create SQL migration file `database/002_rls_and_view.sql`
    - Define `member_public_view` VIEW selecting only ID_Lookup_Fields from "Member" WHERE status = 'approved'
    - GRANT SELECT on `member_public_view` to `anon`
    - REVOKE SELECT on "Member" from `anon`
    - Ensure authenticated role retains full SELECT on "Member"
    - Add RLS policies: anon INSERT allowed, anon UPDATE/DELETE denied
    - Confirm Service_Role bypasses RLS (no explicit policy needed — Supabase default)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_

  - [x] 1.2 Update `IdFinderPage` to query `member_public_view`
    - Change Supabase query in `frontend/src/pages/IdFinderPage.tsx` from `Member` to `member_public_view`
    - Verify returned columns match the view definition (no sensitive fields)
    - _Requirements: 1.1, 1.3_

- [x] 2. Toast notification system
  - [x] 2.1 Create toast store `frontend/src/store/toast.ts`
    - Define `ToastVariant` type: 'success' | 'error' | 'warning' | 'info'
    - Define `Toast` interface: id, message, variant, duration, createdAt
    - Implement Zustand store with `addToast`, `dismissToast`, `clearAll`
    - `addToast`: generate UUID via `crypto.randomUUID()`, default duration 5000ms, enforce max 5 toasts by evicting oldest
    - `dismissToast`: filter by id (idempotent — no error if id not found)
    - Ignore `addToast` calls with empty/whitespace-only messages
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 2.2 Write property tests for toast store `frontend/src/store/__tests__/toast.test.ts`
    - **Property 3: Toast variant correctness** — For any valid variant and non-empty message, addToast produces a toast with matching fields
    - **Validates: Requirements 4.1**
    - **Property 4: Toast dismiss removes correct toast** — For any set of toasts and valid ID, dismissToast removes only that toast
    - **Validates: Requirements 4.3**
    - **Property 5: Toast max-5 newest invariant** — For any sequence of N > 5 additions, store contains only the 5 most recent
    - **Validates: Requirements 4.4, 4.5**
    - Use fast-check with `{ numRuns: 100 }`
    - Tag each test: `// Feature: rls-toast-theme, Property N: <title>`

  - [x] 2.3 Create `ToastContainer` component `frontend/src/components/ui/ToastContainer.tsx`
    - Fixed-position container at top-right of viewport
    - Map over `toasts` from store, render each with variant-specific styling (sbg-navy bg, sbg-purple for success, red-600 for error, amber for warning, blue for info)
    - Auto-dismiss via `setTimeout` using toast's `duration` — cleanup on unmount
    - Container: `role="status"` and `aria-live="polite"`
    - Error toasts: override to `aria-live="assertive"`
    - Dismiss button with `aria-label="Dismiss notification"`
    - Animate entry/exit with CSS transitions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

  - [x] 2.4 Mount `ToastContainer` in `App.tsx`
    - Import and render `<ToastContainer />` at the root level so toasts appear on all pages
    - _Requirements: 4.1_

- [x] 3. Checkpoint — Toast system
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Integrate toast with admin actions
  - [x] 4.1 Add toast triggers to `DashboardTab.tsx`
    - Import `useToastStore` and call `addToast` on success/error of toggle-registration and term-reset actions
    - _Requirements: 6.1, 6.2_

  - [x] 4.2 Add toast triggers to `PendingApplicantList.tsx`
    - Call `addToast` on approve/reject success and error
    - _Requirements: 6.1, 6.2_

  - [x] 4.3 Add toast triggers to `AnnouncementComposer.tsx`
    - Call `addToast` on send-announcement success, error, and partial-success (warning)
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Theme system — CSS variables and Tailwind config
  - [x] 5.1 Add CSS variable layer to `frontend/src/index.css`
    - Define `:root` dark mode defaults (--color-bg, --color-surface, --color-surface-raised, --color-border, --color-text-primary, --color-text-secondary, --grid-stroke: white)
    - Define `.light` class overrides (--color-bg: #f8f9fc, --color-surface: #ffffff, etc., --grid-stroke: #1a1f2e)
    - Add 150ms CSS transition on `background-color` and `color` for `html` and `body`
    - Update `.grid-bg` utility to use `var(--grid-stroke)` instead of hardcoded white
    - Set `body` background to `var(--color-bg)` and color to `var(--color-text-primary)`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 5.2 Extend Tailwind config `frontend/tailwind.config.ts`
    - Add semantic color utilities: `page`, `surface`, `surface-raised`, `border-theme`, `text-primary`, `text-secondary` mapped to CSS variables
    - _Requirements: 9.1_

- [x] 6. Theme system — ThemeProvider and toggle
  - [x] 6.1 Create `ThemeProvider` component `frontend/src/components/ThemeProvider.tsx`
    - Create React Context with `theme` and `toggleTheme`
    - Initialization: localStorage → system preference → dark default
    - On theme change: toggle `.light` class on `document.documentElement`, persist to localStorage
    - Wrap localStorage access in try/catch for private browsing fallback
    - Treat invalid localStorage values as missing (fall through to defaults)
    - Export `useTheme` hook
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 6.2 Create `ThemeToggle` component `frontend/src/components/ui/ThemeToggle.tsx`
    - Render Sun icon (from lucide-react) in dark mode, Moon icon in light mode
    - On click: call `toggleTheme` from `useTheme`
    - `aria-label`: "Switch to light mode" (when dark) / "Switch to dark mode" (when light)
    - _Requirements: 8.1, 8.2, 8.4_

  - [x] 6.3 Mount `ThemeProvider` in `App.tsx`
    - Wrap the application root with `<ThemeProvider>`
    - _Requirements: 7.1_

  - [x] 6.4 Place `ThemeToggle` in `LandingPage` navbar and `AdminSidebar`
    - Add `<ThemeToggle />` to `frontend/src/pages/LandingPage.tsx` navbar area
    - Add `<ThemeToggle />` to `frontend/src/components/admin/AdminSidebar.tsx`
    - _Requirements: 8.3_

  - [ ]* 6.5 Write property tests for ThemeProvider `frontend/src/components/__tests__/ThemeProvider.test.tsx`
    - **Property 6: Theme persistence round-trip** — For any theme value, after toggle sets it, localStorage returns the same value
    - **Validates: Requirements 7.1**
    - **Property 7: Theme DOM class synchronization** — For any sequence of theme changes, `.light` class presence equals (theme === 'light')
    - **Validates: Requirements 7.4**
    - **Property 8: Theme toggle involution** — For any initial state, toggling twice returns to original theme
    - **Validates: Requirements 8.2**
    - Use fast-check with `{ numRuns: 100 }`, mock localStorage and document.documentElement
    - Tag each test: `// Feature: rls-toast-theme, Property N: <title>`

- [x] 7. Final checkpoint — Full integration
  - Ensure all tests pass, ask the user if questions arise.
  - Verify IdFinderPage queries view correctly
  - Verify admin action toasts fire on success/error
  - Verify theme toggle persists and DOM class reflects state

## Task Dependency Graph

```json
{
  "waves": [
    {
      "name": "Wave 1: Database & Foundation",
      "tasks": ["1.1", "2.1", "5.1"]
    },
    {
      "name": "Wave 2: Core Components",
      "tasks": ["1.2", "2.2", "2.3", "5.2", "6.1"],
      "dependsOn": ["1.1", "2.1", "5.1"]
    },
    {
      "name": "Wave 3: UI Assembly",
      "tasks": ["2.4", "6.2", "6.3"],
      "dependsOn": ["2.3", "6.1"]
    },
    {
      "name": "Wave 4: Checkpoint & Integration Prep",
      "tasks": ["3", "6.4", "6.5"],
      "dependsOn": ["2.4", "6.2", "6.3"]
    },
    {
      "name": "Wave 5: Admin Action Integration",
      "tasks": ["4.1", "4.2", "4.3"],
      "dependsOn": ["3"]
    },
    {
      "name": "Wave 6: Final Checkpoint",
      "tasks": ["7"],
      "dependsOn": ["4.1", "4.2", "4.3", "6.4", "1.2"]
    }
  ]
}
```

## Notes

- Tasks marked with `*` are optional property-based test tasks and can be skipped for faster MVP
- The SQL migration (task 1.1) should be applied to Supabase manually or via the Supabase dashboard — the file serves as the source of truth
- Property tests use `fast-check` (already installed) + `vitest`
- RLS property tests (Properties 1 & 2) are integration-level — they validate the VIEW definition against mock data rather than hitting a live database. These are covered by the unit tests verifying IdFinderPage queries the correct view
- All CSS variable changes apply globally — no per-component overrides needed for theme switching
