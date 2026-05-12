# Project Structure

## Top-Level Layout

```
sbg-portal/
├── app/                        # Next.js App Router
│   ├── (public)/               # Public-facing routes
│   │   ├── page.tsx            # Landing / Registration portal
│   │   └── id-finder/
│   │       └── page.tsx        # ID search & Visual ID display
│   ├── admin/                  # Protected admin routes
│   │   ├── layout.tsx          # Admin layout with auth guard
│   │   └── dashboard/
│   │       └── page.tsx        # Approval dashboard + charts
│   ├── api/                    # API routes (if needed beyond Server Actions)
│   │   └── rate-limit/         # Rate limiting for ID finder
│   ├── actions/                # Next.js Server Actions
│   │   ├── register.ts         # Member registration action
│   │   └── approve.ts          # Approval: DB update + SES email
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles + Tailwind imports
│
├── components/                 # Reusable React components
│   ├── ui/                     # Generic UI primitives (buttons, inputs, cards)
│   ├── registration/           # Registration form components
│   ├── id-card/                # Visual ID card component (SVG-based)
│   └── dashboard/              # Dashboard-specific components (charts, tables)
│
├── lib/                        # Shared utilities and config
│   ├── db.ts                   # Prisma/Drizzle client singleton
│   ├── ses.ts                  # AWS SES client and email helpers
│   ├── validations.ts          # Zod schemas (member registration, student number)
│   └── utils.ts                # General helpers (SBG ID generation, etc.)
│
├── prisma/                     # Prisma ORM (if using Prisma)
│   └── schema.prisma           # Database schema
│
├── drizzle/                    # Drizzle ORM (if using Drizzle)
│   └── schema.ts               # Database schema
│
├── public/                     # Static assets
│   ├── sbg-logo.svg
│   └── og-image.png
│
├── store/                      # Zustand stores (if needed)
│   └── registration.ts
│
├── types/                      # Shared TypeScript types
│   └── index.ts
│
├── .env.local                  # Local environment variables (never commit)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Key Conventions

- **App Router only** — no `pages/` directory
- **Server Actions** in `app/actions/` for all DB mutations and SES calls; keep them thin and call lib helpers
- **Components** are co-located by feature under `components/`; generic primitives go in `components/ui/`
- **Zod schemas** live in `lib/validations.ts` and are shared between client (React Hook Form) and server (Server Actions)
- **Single DB client** — instantiate Prisma/Drizzle once in `lib/db.ts` and import from there everywhere
- **Environment variables** — all secrets via `.env.local`; never hardcode credentials
- **Naming**: files use `kebab-case`, React components use `PascalCase`, utilities use `camelCase`

## Member Status Flow

```
pending → approved (assigns sbg_id, sends SES email)
pending → rejected
```

## SBG ID Format

`SBG-PUPBC-{YEAR}-{4-digit-sequence}` — e.g., `SBG-PUPBC-2026-0042`
Generated server-side in the approval Server Action.
