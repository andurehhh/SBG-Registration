# Tech Stack

## Core Framework

- **Next.js 14/15** (App Router) with **TypeScript**
- Server Actions for backend logic (approval flow, DB mutations)
- Mobile-first, responsive design

## Styling

- **Tailwind CSS** — utility-first styling
- 8px border radius convention throughout
- High-contrast typography, heavy white space

## Database

- **Neon** (Serverless Postgres)
- Use Neon branching for staging/testing the approval flow before pushing to production

## ORM

- **Prisma** or **Drizzle ORM** (project choice — pick one and stay consistent)

## Email

- **AWS SDK for JavaScript (SES)** — automated transactional emails (welcome email on approval)

## Forms & Validation

- **React Hook Form** — form state management
- **Zod** — schema validation (student number format, email, etc.)

## State Management

- **Zustand** — lightweight global state if registration form complexity grows

## Charts & Data Visualization

- **Recharts** or **Chart.js** — admin dashboard charts (bar charts, pie charts)

## Image Export

- **html-to-image** — "Download as Image" for the Visual ID card

## Icons

- **Lucide React** — thin-line icons consistent with AWS/Builder aesthetic

## Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Push schema changes (Drizzle)
npx drizzle-kit push

# Generate Drizzle migrations
npx drizzle-kit generate
```

## Environment Variables

Required in `.env.local`:

```
DATABASE_URL=          # Neon Postgres connection string
AWS_REGION=            # e.g. ap-southeast-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SES_FROM_EMAIL=        # Verified SES sender address
ADMIN_SECRET=          # Secret for protecting the admin route
```
