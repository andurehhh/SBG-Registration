# SBG Membership & ID Management Portal

**Student Builder Group – PUP Biñan Campus**  
AWS Student Builder Group Rebranding

---

## Overview

A high-performance, serverless membership portal for SBG PUP Biñan. Handles multi-step registration, digital ID retrieval, and an admin approval dashboard with data visualizations.

## Features

- **Registration Portal** — Mobile-first form with student number validation, multi-select technical interests, and animated success state
- **ID Finder** — Search by student number; display a downloadable digital membership card for approved members
- **Admin Dashboard** — Protected route with stats cards, year-level bar chart, skills pie chart, and approve/reject workflow with AWS SES email notifications

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | Neon (Serverless Postgres) |
| ORM | Prisma |
| Email | AWS SES (SDK v3) |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Charts | Recharts |
| Icons | Lucide React |
| Image Export | html-to-image |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

```
DATABASE_URL=          # Neon Postgres connection string
AWS_REGION=            # e.g. ap-southeast-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SES_FROM_EMAIL=        # Verified SES sender address
ADMIN_SECRET=          # Secret for protecting the admin route
NEXT_PUBLIC_APP_URL=   # Your deployed URL (or http://localhost:3000)
```

### 3. Set up the database

```bash
# Push schema to Neon
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|---|---|
| `/` | Registration portal |
| `/id-finder` | Search and view digital membership card |
| `/admin/login` | Admin authentication |
| `/admin/dashboard` | Protected approval dashboard |

## Admin Access

Navigate to `/admin/login` and enter the `ADMIN_SECRET` value from your `.env.local`.

## Database Schema

```
Member {
  id             UUID (PK)
  student_number String (Unique)
  full_name      String
  email          String
  year_level     Int (1–4)
  section        String
  skills         String[]
  status         Enum: pending | approved | rejected
  sbg_id         String? (e.g. SBG-PUPBC-2026-0001)
  created_at     DateTime
  updated_at     DateTime
}
```

## SBG ID Format

`SBG-PUPBC-{YEAR}-{4-digit-sequence}` — e.g., `SBG-PUPBC-2026-0042`

## Neon Branching (Recommended)

Use Neon's branching feature to test the approval flow on a staging branch before pushing to production:

1. Create a branch in the Neon console
2. Set `DATABASE_URL` to the branch connection string in your staging environment
3. Test approval flow, then merge/promote to production

## AWS SES Setup

1. Verify your sender email in the AWS SES console
2. If in sandbox mode, also verify recipient emails (or request production access)
3. Set `SES_FROM_EMAIL` to your verified sender address

## Project Structure

```
app/
  actions/        Server Actions (register, approve, SES)
  admin/          Protected admin routes
  api/            API routes (auth, rate-limit)
  id-finder/      ID search page
  page.tsx        Registration portal
components/
  dashboard/      Charts, stats cards, members table
  id-card/        Visual ID card (SVG-based, downloadable)
  registration/   Registration form, success state
  ui/             Reusable primitives (Button, Input, Card, Badge)
lib/
  db.ts           Prisma client singleton
  ses.ts          AWS SES helpers
  utils.ts        SBG ID generation, formatters, constants
  validations.ts  Zod schemas
store/
  registration.ts Zustand store for form state
types/
  index.ts        Shared TypeScript types
prisma/
  schema.prisma   Database schema
```
