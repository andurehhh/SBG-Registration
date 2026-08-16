# Security Documentation

## Authentication

### Supabase Auth (JWT)

- Admin users authenticate via Supabase Auth (email + password)
- Authentication produces a JWT token stored in the browser session
- The Supabase JS client automatically attaches the JWT to all requests
- Tokens are short-lived and refreshed automatically by the Supabase client
- No member/student authentication exists — public features use the anonymous key

### Token Flow

```
Admin login → Supabase Auth → JWT issued → Stored in memory
                                         → Attached to all API calls
                                         → RLS evaluates role from token
```

---

## Authorization (Row Level Security)

Every table has RLS enabled. The permission matrix:

### Member Table

| Role | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `anon` | ❌ (revoked; use views) | ✅ (registration) | ❌ | ❌ |
| `authenticated` | ✅ (all rows) | ✅ | Via Edge Functions only | ❌ |
| `service_role` | ✅ (bypasses RLS) | ✅ | ✅ | ✅ |

### AppConfig Table

| Role | SELECT | UPDATE |
|---|---|---|
| `anon` | ✅ | ❌ |
| `authenticated` | ✅ | ✅ |

### AuditLog Table

| Role | SELECT | INSERT |
|---|---|---|
| `anon` | ❌ | ❌ |
| `authenticated` | ✅ | ✅ |

### SchoolYear Table

| Role | SELECT | INSERT | UPDATE |
|---|---|---|---|
| `anon` | ✅ | ❌ | ❌ |
| `authenticated` | ✅ | ✅ | ✅ |

---

## Admin Access Control

Three layers protect the admin dashboard:

### 1. Build-Time Gating

```env
VITE_ADMIN_ENABLED=true   # Set to false to exclude admin code entirely
```

When disabled, admin components are not included in the production JavaScript bundle. An attacker cannot even find the admin code in the browser.

### 2. Obscured URL Path

```env
VITE_ADMIN_PATH=portal-ctrl   # Change this to any secret slug
```

The admin panel is not mounted at `/admin` — it uses a custom path known only to the team. This path is compiled into the build as a constant and never appears in navigation or links.

### 3. Authentication Gate

Even if both above are bypassed (e.g., someone guesses the path in a build with admin enabled), they must still authenticate with valid Supabase Auth credentials. The `AdminPage` component checks for an active session and redirects to login if none exists.

---

## Data Exposure

### What Anonymous Users Can See

| Source | Accessible Data | Use Case |
|---|---|---|
| `member_public_view` | id, student_number, full_name, sbg_id, course, year_level, section, school_year, skills, sticker_id, status, created_at | ID Finder page |
| `member_renewal_view` | id, full_name, student_number, email, scholar_email, course, year_level, section, gender, skills, why_join, expectations, sbg_id, status | Renewal form pre-fill |
| `AppConfig` | registration_open flag | Registration toggle check |
| `SchoolYear` | All school year records | Display current term |

### What Anonymous Users CANNOT See

- Full Member table (direct SELECT revoked)
- Private fields: `cor_url`, `proof_of_share_url`, `updated_at` (via views)
- AuditLog (no policy for anon)
- Email addresses (only exposed in renewal view for verified inactive members)

### What Authenticated Users Can See

- Full Member table (all columns, all statuses)
- AuditLog (all entries)
- AppConfig (read + write)
- SchoolYear (read + write)

---

## Input Validation

### Frontend (Zod schemas in `lib/validations.ts`)

- Student number format validation (regex)
- Email format validation
- Required field enforcement
- Year level range (1-4)
- Skills array validation

### Edge Functions (Server-side)

- **File type validation**: Only `image/jpeg`, `image/png`, `application/pdf` accepted
- **File size limits**: Enforced before Cloudinary upload
- **Student number uniqueness**: Checked against DB before insert
- **Status transitions**: Only valid transitions allowed (e.g., can't approve a non-pending member)
- **Input sanitization**: All text inputs are trimmed; HTML is not executed in stored text fields

### Cloudinary Upload Security

- Uploads use **signed requests** (SHA-1 signature computed server-side)
- The API secret never leaves the Edge Function environment
- Upload preset restricts allowed file types and sizes

---

## Rate Limiting

### Registration Endpoint

The `/register` Edge Function implements IP-based rate limiting via `supabase/functions/_shared/rateLimiter.ts`:

- Tracks submission count per IP address
- Returns HTTP 429 if threshold is exceeded
- Window-based reset (submissions within a time window)
- Prevents spam registrations and form abuse

### Other Endpoints

- Admin endpoints (`/approve`, `/reject`, `/send-announcement`, `/term-reset`) are protected by authentication — rate limiting is less critical since only authenticated admins can call them
- The `process-email-queue` endpoint is called by GitHub Actions with the service role key — a single cron trigger per minute

---

## Email Security

### Credentials

- **Gmail App Password**: A 16-character token (not the actual Gmail password)
- Stored as a Supabase Secret — never in client-side code
- Only accessible by Edge Functions at runtime

### AWS Lambda

- Lambda endpoint protected by an API key (`LAMBDA_API_KEY`)
- Key passed via `x-api-key` header from Edge Functions
- API Gateway enforces the key before invoking Lambda

### Client-Side Safety

- No email credentials exist in the frontend bundle
- Email sending is always server-side (Edge Function → Lambda → Gmail)
- Email addresses in the EmailQueue table are not exposed to anonymous users

---

## Known Limitations & Accepted Risks

| Risk | Severity | Mitigation | Status |
|---|---|---|---|
| Admin path can be discovered via JS bundle inspection | Low | Build gating removes admin code when disabled; auth still required | Accepted |
| GitHub Actions cron may be delayed 1-5 minutes | Low | Non-critical for transactional emails; queue ensures no loss | Accepted |
| No email verification for registrants | Medium | COR document serves as identity proof; admin reviews manually | Accepted |
| Single admin auth method (email/password) | Low | Supabase Auth handles session management; MFA can be enabled | Accepted |
| Renewal view exposes email to anonymous queries | Medium | Only for inactive members with SBG IDs; needed for form pre-fill | Accepted |
| No server-side session invalidation | Low | JWTs expire naturally; Supabase handles refresh rotation | Accepted |

---

## Recommendations for Hardening

### High Priority

| Recommendation | Effort | Impact |
|---|---|---|
| **Enable MFA** for admin accounts in Supabase Auth settings | Low | Prevents credential theft attacks |
| **Add CSP headers** via Vite config or hosting platform (Vercel/Netlify) | Medium | Prevents XSS and injection attacks |
| **Session timeout**: Force re-login after 8 hours of inactivity | Low | Limits stolen session window |

### Medium Priority

| Recommendation | Effort | Impact |
|---|---|---|
| **Audit log for failed login attempts** | Medium | Detect brute-force attacks |
| **IP allowlisting** for admin login (via Supabase Auth hooks) | Medium | Restrict admin access to known networks |
| **Rate limiting on admin login** | Low | Prevent credential stuffing |
| **CORS configuration** in Supabase to restrict origins | Low | Prevent unauthorized API calls from other domains |

### Lower Priority

| Recommendation | Effort | Impact |
|---|---|---|
| **Remove email from renewal view** — use a server-side lookup instead | Medium | Reduces data exposure to anonymous users |
| **Signed URLs for uploaded documents** (time-limited access) | Medium | Prevents permanent public links to COR files |
| **Subresource Integrity (SRI)** for CDN-loaded scripts | Low | Prevents CDN compromise attacks |
| **Database connection pooling limits** | Low | Prevents connection exhaustion under load |
