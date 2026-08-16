# Developer Setup Guide

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Frontend build and dev server |
| npm | 10+ | Package management |
| Supabase CLI | latest | Edge Function deployment, project linking |
| Git | any | Version control |

Optional:
- **Python 3.9+** — only needed if working on the Lambda email sender
- **AWS CLI** — only needed for Lambda deployment

---

## Clone & Install

```bash
git clone <repository-url>
cd SBG-Registration/frontend
npm install
```

---

## Environment Setup

### Frontend (.env.local)

```bash
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_APP_URL=http://localhost:5173

# Admin panel access
VITE_ADMIN_ENABLED=true
VITE_ADMIN_PATH=portal-ctrl
```

### Supabase Secrets (for Edge Functions)

```bash
cd supabase
chmod +x set-secrets.sh
# Edit set-secrets.sh with your values, then:
./set-secrets.sh
```

Required secrets:
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD`
- `LAMBDA_EMAIL_ENDPOINT`, `LAMBDA_API_KEY`
- `APP_URL`

---

## Running the Dev Server

```bash
cd frontend
npm run dev
```

Open http://localhost:5173

The dev server supports HMR (Hot Module Replacement) — changes are reflected instantly.

---

## Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Tests use **Vitest** with **React Testing Library** and **jsdom** environment.

Test files live alongside their components in `__tests__/` directories.

---

## Project Structure Walkthrough

```
frontend/src/
├── App.tsx                  # Root component: routing setup
├── components/
│   ├── admin/              # Admin dashboard components
│   │   ├── tabs/           # Tab content (Dashboard, Members, DataViz, etc.)
│   │   ├── AdminLayout.tsx # Layout wrapper with sidebar
│   │   ├── AdminSidebar.tsx
│   │   ├── AnnouncementComposer.tsx
│   │   ├── ApplicantDetailModal.tsx
│   │   ├── BulkActionToolbar.tsx
│   │   └── MembersTable.tsx
│   ├── registration/       # Multi-step registration form
│   │   ├── RegistrationForm.tsx    # Form orchestrator
│   │   ├── RenewalForm.tsx         # Returning member form
│   │   ├── StepPersonalInfo.tsx    # Step 1
│   │   ├── StepApplicationQuestions.tsx  # Step 2
│   │   ├── StepAttachments.tsx     # Step 3 (file uploads)
│   │   ├── SuccessState.tsx        # Confirmation screen
│   │   ├── ProgressBar.tsx
│   │   └── FlipCard.tsx
│   ├── id-card/            # Digital membership card
│   │   ├── IdCard.tsx
│   │   ├── IdCardFront.tsx
│   │   ├── IdCardBack.tsx
│   │   └── StickerLayer.tsx
│   └── ui/                 # Reusable UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── ...
├── pages/                  # Route-level components
│   ├── LandingPage.tsx
│   ├── RegisterPage.tsx
│   ├── IdFinderPage.tsx
│   ├── AdminLoginPage.tsx
│   └── AdminPage.tsx
├── store/                  # Zustand state stores
├── lib/                    # Utilities and API helpers
│   ├── api.ts              # Edge Function caller (with auth headers)
│   ├── supabase.ts         # Supabase client singleton
│   ├── utils.ts            # General helpers
│   └── validations.ts      # Zod schemas (shared validation)
└── types/                  # TypeScript type definitions
    └── index.ts
```

---

## How to Deploy Edge Functions

### Link your Supabase project (first time only)

```bash
supabase link --project-id <your-project-id>
```

### Deploy a single function

```bash
supabase functions deploy register
supabase functions deploy approve
supabase functions deploy reject
supabase functions deploy send-announcement
supabase functions deploy process-email-queue
supabase functions deploy term-reset
```

### Deploy all functions

```bash
supabase functions deploy
```

Edge Functions live in `supabase/functions/<function-name>/index.ts`.

Shared utilities are in `supabase/functions/_shared/`:
- `emailTemplate.ts` — HTML email template builder
- `emailSender.ts` — Lambda email sender helper
- `rateLimiter.ts` — IP-based rate limiting

---

## How to Run SQL Migrations

1. Open your Supabase dashboard → **SQL Editor**
2. Run migration files from `database/` in this order:
   - `schema.sql`
   - `001_app_config.sql`
   - `002_rls_and_view.sql`
   - `003_audit_log.sql`
   - `004_semester_management.sql`
   - `005_renewal_view.sql`
3. Each file is self-contained and can be pasted directly into the editor

> **Tip**: On a fresh project, you can concatenate all files and run them at once. On an existing project, only run new migrations.

---

## Coding Conventions

### File Naming

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `RegistrationForm.tsx` |
| Utility modules | camelCase | `validations.ts` |
| Test files | Component + `.test.tsx` | `RegistrationForm.test.tsx` |
| SQL migrations | `NNN_description.sql` | `003_audit_log.sql` |

### Component Patterns

- **Feature-based co-location**: Components grouped by feature (`admin/`, `registration/`, `id-card/`)
- **Generic primitives** in `components/ui/` — never import feature components into UI primitives
- **Single responsibility**: One component per file, exported as default for lazy loading
- **Props interfaces** defined inline or in the same file

### State Management

- **Zustand** for global state (registration form data, admin session)
- **React Hook Form** for form-local state with Zod validation
- **Supabase client queries** for server state (no additional caching layer)

### Styling

- **Tailwind CSS** utility classes — no custom CSS files
- **8px border radius** (`rounded-lg`) on all interactive elements
- **CSS variables** for theme switching (see `ui.md`)
- Dark-first design with Space Mono headings and Inter body text

---

## How Admin Route Hiding Works

The admin panel is protected by three layers:

1. **Build-time gating** (`VITE_ADMIN_ENABLED`):
   - Set to `true` in `.env.local` to include admin routes
   - When `false`, admin code is completely tree-shaken from the production bundle
   - Defined as a Vite global in `vite.config.ts`

2. **Obscured URL path** (`VITE_ADMIN_PATH`):
   - Admin routes are mounted at `/<secret-path>/*` instead of `/admin/*`
   - The path value (e.g., `portal-ctrl`) is only known to team members
   - Defined as a compile-time constant via Vite's `define` config

3. **Authentication**:
   - Even if someone discovers the URL, they must authenticate via Supabase Auth
   - Unauthenticated users are redirected to the login page

In `App.tsx`:
```typescript
// Routes are conditionally rendered based on build flag
{__ADMIN_ENABLED__ && AdminPage && (
  <Route path={`/${__ADMIN_PATH__}/*`} element={<AdminPage />} />
)}
```

---

## CI Pipeline Explanation

The `.github/workflows/ci.yml` runs on every PR and push to `main`:

```
┌─────────────────────────────────────────┐
│ Trigger: push/PR to main                │
├─────────────────────────────────────────┤
│ 1. Checkout code                        │
│ 2. Setup Node 20 (with npm cache)       │
│ 3. npm ci (clean install)               │
│ 4. ESLint (zero warnings policy)        │
│ 5. TypeScript type check (tsc --noEmit) │
│ 6. Vitest (run all tests)               │
│ 7. Vite build (verify production build) │
└─────────────────────────────────────────┘
```

Additional workflows:
- **email-queue.yml**: Cron job (every 1 minute) — calls `process-email-queue` Edge Function
- **ping-supabase.yml**: Keep-alive ping (Sunday + Friday midnight) — prevents Supabase free-tier project from pausing

---

## Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server (port 5173)
npm run build            # Production build (TypeScript + Vite)
npm run preview          # Preview production build locally
npm run lint             # ESLint check
npx tsc --noEmit        # Type check without emitting

# Testing
npm run test             # Run tests once
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report

# Supabase
supabase link --project-id <id>          # Link project
supabase functions deploy <name>         # Deploy single function
supabase functions serve <name>          # Local function dev
supabase secrets set KEY=VALUE           # Set a secret
```
