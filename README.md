# SBG Membership & ID Management Portal

**Student Builder Group – PUP Biñan Campus**
A serverless, cloud-native membership portal for managing registrations, member approvals, and digital ID retrieval.

---

## Overview

The SBG Registration Portal is a comprehensive membership management system that handles:
- **Multi-step registration** with document uploads and validation
- **Digital ID retrieval** for approved members
- **Admin dashboard** for review, approval, and member management
- **Automated email notifications** for registrations, approvals, and announcements
- **Data visualization** with member statistics and analytics

Built entirely serverless using **Supabase** backend and **React** frontend.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | SPA with HMR |
| **Styling** | Tailwind CSS + PostCSS | Responsive UI |
| **State** | Zustand | Global state management |
| **Forms** | React Hook Form + Zod | Form validation |
| **Database** | Supabase (PostgreSQL) | Member data, email queue, feature flags |
| **Auth** | Supabase Auth (JWT) | Admin authentication |
| **Email** | AWS Lambda + Gmail SMTP | Transactional emails |
| **File Upload** | Cloudinary (CDN) | Document storage (signed uploads) |
| **Backend** | Supabase Edge Functions (Deno) | Serverless backend logic |
| **Automation** | GitHub Actions (Cron) | Email queue processor |
| **Charts** | Recharts | Admin analytics |
| **ID Export** | html-to-image | Digital ID cards |

---

## System Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend (React/Vite)"]
        Website["Web Application"]
        Pages["Registration | ID Finder | Admin Dashboard"]
    end

    subgraph Supabase["Supabase (Backend-as-a-Service)"]
        Auth["Authentication"]
        DB[(PostgreSQL Database)]
        EdgeFns["Edge Functions"]
    end

    subgraph AWS["AWS Services"]
        Lambda["Lambda Function (Email Sender)"]
        APIGw["API Gateway"]
    end

    subgraph External["External Services"]
        Gmail["Gmail SMTP"]
        Cloudinary["Cloudinary CDN"]
    end

    subgraph GitHub["Automation"]
        Actions["GitHub Actions (Email Queue)"]
    end

    Website -->|Auth & Data| Auth
    Pages -->|CRUD via RLS| DB
    Pages -->|Edge Function calls| EdgeFns

    EdgeFns -->|File Upload| Cloudinary
    EdgeFns -->|Query/Insert| DB
    EdgeFns -->|Send Email| Lambda

    Lambda -->|SMTP| Gmail
    Actions -->|Process Queue| EdgeFns
```

---

## Getting Started

### Prerequisites
- Node.js 20+ and npm
- Supabase CLI (`npm i -g supabase`)
- A Supabase project
- AWS Lambda function deployed (for emails)
- Gmail account with app password
- Cloudinary account

### 1. Clone and install

```bash
git clone <repository-url>
cd SBG-Registration/frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_APP_URL=http://localhost:5173
```

### 3. Run development server

```bash
npm run dev
```

Visit http://localhost:5173

---

## Supabase Backend Setup

### Link your project

```bash
supabase link --project-id <your-project-id>
```

### Set secrets

Edit `supabase/set-secrets.sh` with your actual values, then:

```bash
chmod +x supabase/set-secrets.sh
./supabase/set-secrets.sh
```

Required secrets:
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD`
- `LAMBDA_EMAIL_ENDPOINT`, `LAMBDA_API_KEY`
- `APP_URL`

### Deploy Edge Functions

```bash
supabase functions deploy register
supabase functions deploy approve
supabase functions deploy reject
supabase functions deploy send-announcement
supabase functions deploy send-approval-email
supabase functions deploy registration-confirmation
supabase functions deploy process-email-queue
supabase functions deploy term-reset
```

### Database setup

The database schema is managed via Supabase. Key tables:
- `Member` — student registrations and membership data
- `EmailQueue` — queued emails with retry logic
- `SchoolYear` — academic year tracking
- `AppConfig` — application-level feature flags (registration open/closed)

---

## Email System

### How it works

1. **Trigger**: User action (register, approve, send announcement)
2. **Queue**: Email inserted into `EmailQueue` table with `status='pending'`
3. **Processing**: GitHub Actions cron runs every 1 minute
4. **Sending**: Edge function retrieves pending emails and calls AWS Lambda
5. **Lambda**: Connects via Gmail SMTP and sends email
6. **Update**: Queue status updated to `'sent'` or `'failed'`
7. **Retry**: Failed emails retry up to 3 times

### GitHub Actions setup

1. Add `SUPABASE_SERVICE_ROLE_KEY` to your repository's Actions secrets
2. The `.github/workflows/email-queue.yml` cron triggers every minute

> **Note**: GitHub Actions cron has no SLA on exact timing — jobs may be delayed by 1–5 minutes under load. This is acceptable for non-time-critical transactional emails.

---

## CI Pipeline

The `.github/workflows/ci.yml` runs on every PR and push to main:
- Lint (ESLint)
- Type check (TypeScript)
- Tests (Vitest)
- Build verification

---

## Project Structure

```
SBG-Registration/
├── frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── components/          # UI components by feature
│   │   ├── pages/               # Route pages
│   │   ├── store/               # Zustand stores
│   │   ├── lib/                 # API helpers & utilities
│   │   └── types/               # TypeScript types
│   └── vite.config.ts
│
├── supabase/
│   ├── functions/               # Edge Functions (Deno)
│   └── set-secrets.sh           # Secrets deployment script
│
├── lambda/
│   └── email-sender/            # Python Lambda (Gmail SMTP)
│
└── .github/workflows/
    ├── email-queue.yml          # Email queue cron
    └── ci.yml                   # Lint, test, build
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `VITE_APP_URL` | Frontend deployment URL |

### Supabase Secrets

| Secret | Description |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GMAIL_ADDRESS` | Gmail sender address |
| `GMAIL_APP_PASSWORD` | Gmail app password (16-char token) |
| `LAMBDA_EMAIL_ENDPOINT` | AWS API Gateway URL for email Lambda |
| `LAMBDA_API_KEY` | API key for Lambda endpoint |
| `APP_URL` | Frontend URL (used in email links) |

### GitHub Actions Secrets

| Secret | Description |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Elevated key for email queue processing |

> **Never commit actual secret values.** Use `.env.example` as a template.

---

## Troubleshooting

### Emails not sending?
1. Check `EmailQueue` table for failed entries: `SELECT * FROM "EmailQueue" WHERE status='failed'`
2. Verify Lambda function has correct Gmail credentials
3. Check GitHub Actions logs for cron job execution
4. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in GitHub Secrets

### File upload failing?
1. Verify Cloudinary credentials in Supabase Secrets
2. Check SHA-1 signature calculation in the register function
3. Ensure file MIME type is `image/jpeg`, `image/png`, or `application/pdf`

### Admin dashboard not loading?
1. Verify Supabase Auth session is valid
2. Check browser console for CORS errors
3. Ensure admin user exists in Supabase Auth

---

## Roadmap

### Event Management (Planned)

A lightweight event system for organizing SBG meetups, workshops, and community events.

**How it works:**
1. Admin creates an event (title, date, venue, description, capacity)
2. Approved members can RSVP / register for the event
3. Upon registration approval, member receives a unique **QR code** via email
4. At the event, admin scans QR codes for check-in
5. Admin can view and export the **attendee list** (CSV with name, student number, check-in time)

**Planned features:**
- Event creation and management in the admin dashboard
- Member-facing event list with RSVP button
- QR code generation per attendee (unique, scannable)
- QR-based check-in (admin scans via camera or manual code entry)
- Attendee list with real-time check-in status
- CSV export of attendees (name, student number, course, check-in timestamp)
- Event capacity tracking and waitlist

### Official Club Website (Planned)

Expand the portal into the official SBG website — single domain, one cohesive experience.

**Planned pages:**
- `/` — Home (hero, mission, vision, what we do)
- `/about` — About page (team, advisors, history, departments)
- `/events` — Public event listing
- `/register` — Membership registration (existing)
- `/id-finder` — Digital ID lookup (existing)

**Approach:** No separate website — just add public-facing pages to the existing app with a proper navbar (Home, About, Events, Register, Find ID). Static content (mission, vision, team photos) lives directly in the components.

---

## License

This project is part of the Student Builder Group initiative at PUP Biñan Campus.
