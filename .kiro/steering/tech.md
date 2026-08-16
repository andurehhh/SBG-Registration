# Tech Stack

## Core Framework

- **React 18** + **TypeScript** + **Vite** — Single-page application with HMR
- **React Router v6** — Client-side routing
- Mobile-first, responsive design

## Backend

- **Supabase** (Backend-as-a-Service)
  - PostgreSQL database (hosted)
  - Edge Functions (Deno/TypeScript) — serverless backend logic
  - Auth (JWT) — admin authentication
  - Supabase JS client — direct DB queries from frontend (with RLS)

## Styling

- **Tailwind CSS** — utility-first styling
- 8px border radius convention throughout
- High-contrast typography, heavy white space

## Email

- **AWS Lambda** (Python) + **Gmail SMTP** (App Password) — transactional emails
- **Email Queue** table with retry logic — batch processing via GitHub Actions cron
- Lambda invoked from Edge Functions via API Gateway

## File Uploads

- **Cloudinary** — signed uploads (SHA-1) for COR documents and proof-of-share files
- Handled server-side in the `register` Edge Function

## Forms & Validation

- **React Hook Form** — form state management
- **Zod** — schema validation (student number format, email, etc.)

## State Management

- **Zustand** — lightweight global state for registration form and admin session

## Charts & Data Visualization

- **Recharts** — admin dashboard charts (bar charts, pie charts)

## Image Export

- **html-to-image** — "Download as Image" for the Visual ID card

## Icons

- **Lucide React** — thin-line icons consistent with the builder aesthetic

## Common Commands

```bash
# Install frontend dependencies
cd frontend && npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Deploy Supabase Edge Functions
supabase functions deploy <function-name>

# Link Supabase project
supabase link --project-id <project-id>
```

## Environment Variables

### Frontend (`frontend/.env.local`)

```
VITE_SUPABASE_URL=           # Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Supabase anon/public key
VITE_APP_URL=                # Deployed frontend URL
```

### Supabase Secrets (via `supabase/set-secrets.sh`)

```
CLOUDINARY_CLOUD_NAME=       # Cloudinary account
CLOUDINARY_API_KEY=          # Cloudinary API key
CLOUDINARY_API_SECRET=       # Cloudinary API secret
GMAIL_ADDRESS=               # Gmail sender address
GMAIL_APP_PASSWORD=          # Gmail app password (16-char token)
LAMBDA_EMAIL_ENDPOINT=       # AWS API Gateway endpoint for email Lambda
LAMBDA_API_KEY=              # API key for Lambda endpoint
APP_URL=                     # Frontend URL (used in email templates)
```

### GitHub Actions Secrets

```
SUPABASE_SERVICE_ROLE_KEY=   # Service role key for email queue processing
```
