# Project Structure

## Top-Level Layout

```
SBG-Registration/
├── frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/           # Admin dashboard components
│   │   │   │   └── tabs/        # Dashboard, Members, DataViz, Announcements
│   │   │   ├── registration/    # Multi-step registration form
│   │   │   ├── id-card/         # Digital ID card (front/back/sticker)
│   │   │   └── ui/              # Reusable UI primitives (Button, Input, Card, etc.)
│   │   ├── pages/               # Route-level page components
│   │   ├── store/               # Zustand state management
│   │   ├── lib/                 # Utilities & API helpers
│   │   │   ├── api.ts           # Edge Function caller with auth
│   │   │   ├── supabase.ts      # Supabase client singleton
│   │   │   ├── utils.ts         # General helpers
│   │   │   └── validations.ts   # Zod schemas
│   │   └── types/               # TypeScript type definitions
│   ├── public/                  # Static assets
│   ├── index.html
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── supabase/
│   ├── functions/
│   │   ├── register/            # Handle new registrations + file uploads
│   │   ├── approve/             # Approve applicant (assign SBG ID, trigger email)
│   │   ├── reject/              # Reject applicant
│   │   ├── send-announcement/   # Queue announcement emails
│   │   ├── send-approval-email/ # Approval confirmation email
│   │   ├── registration-confirmation/  # Post-registration email trigger
│   │   ├── process-email-queue/ # Batch process pending emails
│   │   ├── term-reset/          # End-of-term: mark all approved as inactive
│   │   ├── webhook-email-sender/ # Webhook-based email trigger
│   │   └── _shared/             # Shared utilities
│   │       ├── emailTemplate.ts # Email HTML template builder
│   │       ├── emailSender.ts   # Lambda email sender helper
│   │       └── rateLimiter.ts   # IP-based rate limiting
│   └── set-secrets.sh           # Deploy secrets script
│
├── lambda/
│   └── email-sender/            # Python Lambda function (Gmail SMTP)
│
├── .github/
│   └── workflows/
│       ├── email-queue.yml      # Cron job: process email queue (every 1 min)
│       └── ci.yml               # CI: lint + test on PRs
│
└── README.md
```

## Key Conventions

- **Vite SPA** — no SSR, client-side routing via React Router v6
- **Supabase client queries** — direct DB access from frontend with Row-Level Security (RLS)
- **Edge Functions** — handle mutations that need elevated permissions (service role key)
- **Components** are co-located by feature under `components/`; generic primitives go in `components/ui/`
- **Zod schemas** in `lib/validations.ts` — shared between client (React Hook Form) and Edge Functions
- **Single Supabase client** — instantiated once in `lib/supabase.ts`
- **Environment variables** — all secrets via `.env.local` (frontend) or Supabase Secrets (backend)
- **Naming**: files use `kebab-case` or `PascalCase` for components, utilities use `camelCase`

## Member Status Flow

```
pending → approved (assigns sbg_id, queues approval email)
pending → rejected
approved → inactive (end-of-term reset)
rejected/inactive → pending (re-registration allowed)
```

## SBG ID Format

`SBG-PUPBC-{YEAR}-{4-digit-sequence}` — e.g., `SBG-PUPBC-2026-0042`
Generated server-side in the `approve` Edge Function.
