# Implementation Tasks — SBG Portal Redesign

## Task List

- [x] 1. Project Scaffolding
  - [x] 1.1 Initialize `frontend/` directory with Vite + React 18 + TypeScript (`npm create vite@latest frontend -- --template react-ts`)
  - [x] 1.2 Install frontend dependencies: `tailwindcss`, `postcss`, `autoprefixer`, `react-router-dom`, `react-hook-form`, `zod`, `zustand`, `lucide-react`, `recharts`, `html-to-image`, `@hookform/resolvers`
  - [x] 1.3 Configure Tailwind CSS in `frontend/` with the SBG dark color palette tokens (`sbg-black`, `sbg-navy`, `sbg-navy-light`, `sbg-purple`, `sbg-purple-light`, `sbg-purple-muted`, `sbg-orange`, `sbg-text`, `sbg-text-muted`) and Space Mono + Inter font imports
  - [x] 1.4 Initialize `backend/` directory with `npm init` + TypeScript config; install: `express`, `cors`, `cookie-parser`, `jsonwebtoken`, `multer`, `express-rate-limit`, `@prisma/client`, `prisma`, `googleapis`, `mailersend`, `zod`, `dotenv`
  - [x] 1.5 Configure `tsconfig.json` for both `frontend/` and `backend/` with strict mode enabled
  - [x] 1.6 Create `backend/src/index.ts` Express app entry point with CORS (configured from `CORS_ORIGIN` env var), `cookie-parser`, JSON body parser, and router mounts
  - [x] 1.7 Create root `frontend/src/App.tsx` with React Router v6 routes: `/` (RegisterPage), `/id-finder` (IdFinderPage), `/admin/login` (AdminLoginPage), `/admin/*` (AdminPage with nested tab routes)
  - [x] 1.8 Create `frontend/src/index.css` with Tailwind directives, Space Mono + Inter Google Fonts import, dark-only CSS variables (no light mode branch), and SVG grid background pattern utility class

- [x] 2. Shared Types and Zod Schemas
  - [x] 2.1 Create `frontend/src/types/index.ts` with TypeScript interfaces: `Member`, `MemberStatus`, `Gender`, `DashboardStats`, `ActionResult<T>`
  - [x] 2.2 Create `frontend/src/lib/validations.ts` with Zod schemas: `registrationStep1Schema` (all personal info fields with correct constraints), `registrationStep2Schema` (why_join min 50 chars, expectations min 50 chars), `registrationStep3Schema` (file presence validation), `loginSchema`
  - [x] 2.3 Copy/mirror the same Zod schemas to `backend/src/lib/validations.ts` so client and server validate identically
  - [x] 2.4 Create `frontend/src/lib/api.ts` typed fetch wrapper with base URL from `VITE_API_URL`, `credentials: "include"` for cookie forwarding, and typed response helpers

- [x] 3. Database Schema Migration
  - [x] 3.1 Update `prisma/schema.prisma`: add `Gender` enum (`Male`, `Female`, `NonBinary`, `PreferNotToSay`), add `MemberStatus` enum if not present, add new nullable fields to `Member` model (`course`, `scholar_email`, `gender`, `why_join`, `expectations`, `cor_url`, `proof_of_share_url`, `sticker_id`), add `@unique` to `sbg_id`, add `SchoolYear` model
  - [x] 3.2 Run `npx prisma migrate dev --name add_redesign_fields` to apply schema changes to the Neon database
  - [x] 3.3 Run `npx prisma generate` to regenerate the Prisma client
  - [x] 3.4 Create `backend/src/lib/db.ts` Prisma client singleton

- [x] 4. Backend Services
  - [x] 4.1 Create `backend/src/services/sbgId.ts` — `generateUniqueSbgId(db, year)` function that finds the highest existing sequence for the given year, increments it, and retries up to 10 times on collision; format: `SBG-{year}-{4-digit-zero-padded-seq}-PUPBC`
  - [x] 4.2 Create `backend/src/services/drive.ts` — `DriveService` class using `googleapis` with service account auth (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` env vars); `upload(params)` method that uploads a file buffer to the folder at `GOOGLE_DRIVE_FOLDER_ID`, names it `{student_number}_{document_type}_{timestamp}`, sets `reader` permission for anyone, and returns `{ fileId, shareableUrl }`
  - [x] 4.3 Create `backend/src/services/mail.ts` — `MailService` class using `mailersend` npm package; implement `sendWelcome(params)`, `sendRejection(params)`, `sendAnnouncement(params)` methods; all use `MAILSEND_API_KEY`, `MAILSEND_FROM_EMAIL`, `MAILSEND_FROM_NAME` env vars; failures are logged with `console.error` and re-thrown

- [x] 5. Backend Middleware
  - [x] 5.1 Create `backend/src/middleware/auth.ts` — `requireAuth` middleware that reads `admin_token` from `req.cookies`, verifies the JWT with `JWT_SECRET`, attaches `req.adminId`, and returns 401 on failure
  - [x] 5.2 Create `backend/src/middleware/validate.ts` — factory function `validateBody(schema: ZodSchema)` that validates `req.body` and returns 400 with Zod error details on failure
  - [x] 5.3 Create `backend/src/middleware/rateLimiter.ts` — `idFinderLimiter` using `express-rate-limit` (20 req/min per IP, 429 response with retry-after header)
  - [x] 5.4 Create `backend/src/lib/utils.ts` — `sanitize(str)` function that escapes HTML special characters (`<`, `>`, `&`, `"`, `'`) to their entity equivalents; `generateSbgId(year, seq)` pure function

- [x] 6. Backend API Routes
  - [x] 6.1 Create `backend/src/routes/auth.ts` — `POST /api/auth/login` (compare secret with `crypto.timingSafeEqual`, sign JWT, set `httpOnly` cookie), `POST /api/auth/logout` (clear cookie), `GET /api/auth/me` (verify token, return adminId)
  - [x] 6.2 Create `backend/src/routes/members.ts` — `POST /api/members/register`: validate body with Zod, check duplicate student number (409 if exists), use `multer` to handle `cor_file` and `proof_of_share_file` (max 1 MB each, MIME type check), upload both to Drive via `DriveService`, sanitize text fields, create `Member` record; return 201 with `{ success: true, data: { id } }`
  - [x] 6.3 Add `GET /api/members/lookup?student_number=` to members route — apply `idFinderLimiter`, query DB, return public member fields if `approved`, return status-specific error message for other statuses, return 404 if not found
  - [x] 6.4 Create `backend/src/routes/admin/members.ts` — all behind `requireAuth`: `GET /api/admin/members` (filter by status/course/year_level/gender/skills, sort, paginate), `GET /api/admin/members/:id` (full detail), `POST /api/admin/members/:id/approve` (generate SBG ID, update status, send welcome email), `POST /api/admin/members/:id/reject` (update status, send rejection email)
  - [x] 6.5 Create `backend/src/routes/admin/stats.ts` — `GET /api/admin/stats` behind `requireAuth`; return `DashboardStats` with total, pending, approved, rejected, inactive counts, plus `byCourse`, `byYearLevel`, `byGender` breakdowns using Prisma `groupBy`
  - [x] 6.6 Create `backend/src/routes/admin/announcements.ts` — `POST /api/admin/announcements/send` behind `requireAuth`; resolve recipient list from DB based on `recipients.type` (all/group/individual) and filters; call `MailService.sendAnnouncement` for each; collect failures; return `{ sent: N, failed: [...] }` with 207 if any failures

- [x] 7. Frontend: Global Styles and Layout
  - [x] 7.1 Remove `ThemeProvider` and `ThemeToggle` components entirely from the codebase; remove all light-mode CSS variables and class-based theme switching
  - [x] 7.2 Update `frontend/src/index.css` to hardcode all CSS variables to dark values only; add `.grid-bg` utility class with the SVG grid pattern (white lines, 0.15 opacity); add `font-mono` utility mapped to Space Mono
  - [x] 7.3 Create `frontend/src/pages/RegisterPage.tsx` — page shell with `sbg-black` background, SVG grid hero section, centered form card, SBG logo header

- [x] 8. Frontend: UI Primitive Components
  - [x] 8.1 Create `frontend/src/components/ui/Button.tsx` — variants: `primary` (sbg-purple bg), `outline` (purple border), `ghost` (transparent), `danger` (red-600); 8px border radius; Lucide icon support
  - [x] 8.2 Create `frontend/src/components/ui/Input.tsx` — sbg-navy-light background, white text, purple focus ring, muted placeholder; error state with red border and inline error message
  - [x] 8.3 Create `frontend/src/components/ui/Select.tsx` — same dark styling as Input; accepts `options` array prop
  - [x] 8.4 Create `frontend/src/components/ui/Textarea.tsx` — same dark styling as Input; resizable; min-height prop
  - [x] 8.5 Create `frontend/src/components/ui/Badge.tsx` — variants: `pending` (purple-muted bg), `approved` (dark green), `rejected` (dark red), `inactive` (dark gray); Space Mono font
  - [x] 8.6 Create `frontend/src/components/ui/Card.tsx` — sbg-navy background, subtle white border (`rgba(255,255,255,0.08)`), 8px radius
  - [x] 8.7 Create `frontend/src/components/ui/FileUpload.tsx` — drag-and-drop + click-to-browse; validates file size ≤ 1 MB and MIME type (JPEG/PNG/PDF) before accepting; shows file name and size on selection; shows error message on rejection

- [x] 9. Frontend: Zustand Stores
  - [x] 9.1 Create `frontend/src/store/registration.ts` — `useRegistrationStore` with all Step 1/2/3 field state, `currentStep`, `isFlipping`, `submissionStatus`, `serverError`, and actions: `setField`, `goToStep`, `setFlipping`, `setSubmissionStatus`, `setServerError`, `reset`
  - [x] 9.2 Create `frontend/src/store/admin.ts` — `useAdminStore` with `isAuthenticated`, `adminId`, `setAuth`, `clearAuth`; `isAuthenticated` is derived from presence of a valid session (checked via `GET /api/auth/me` on mount)

- [x] 10. Frontend: Multi-Step Registration Form
  - [x] 10.1 Create `frontend/src/components/registration/FlipCard.tsx` — CSS 3D flip wrapper with `perspective: 1200px`, `transform-style: preserve-3d`, `rotateY(180deg)` transition (0.5s cubic-bezier); `front` and `back` slots with `backface-visibility: hidden`; fires `onFlipEnd` on `transitionend`
  - [x] 10.2 Create `frontend/src/components/registration/ProgressBar.tsx` — renders `total` equal-width segments; segments ≤ `current` filled with `bg-sbg-purple`; unfilled use `bg-sbg-navy-light`; shows "Step {current} of {total}" label in Space Mono
  - [x] 10.3 Create `frontend/src/components/registration/StepPersonalInfo.tsx` — React Hook Form fields: Full Name, Student Number, Course, Year and Section, Personal Email, Scholar Email, Gender (select), AWS Interests (multi-select toggle buttons); validates with `registrationStep1Schema` on Next click; checks duplicate student number via `GET /api/members/lookup` before advancing
  - [x] 10.4 Create `frontend/src/components/registration/StepApplicationQuestions.tsx` — two Textarea fields: "Why do you wish to join the AWS Student Builder Group?" and "What are you expecting from AWS Student Builder Group?"; validates with `registrationStep2Schema`; Back and Next buttons
  - [x] 10.5 Create `frontend/src/components/registration/StepAttachments.tsx` — two `FileUpload` components: COR and Proof of Share; validates with `registrationStep3Schema`; Back and Submit buttons; on submit, builds `FormData` with all Zustand store fields + files and calls `POST /api/members/register`
  - [x] 10.6 Create `frontend/src/components/registration/SuccessState.tsx` — confirmation screen shown after successful submission; displays student's name and email; "We'll notify you at {email} once your application is reviewed" message; SBG branding
  - [x] 10.7 Create `frontend/src/components/registration/RegistrationForm.tsx` — orchestrator component; reads/writes `useRegistrationStore`; renders `FlipCard` with current step content as front/back; manages flip animation timing with `onFlipEnd`; renders `ProgressBar` at bottom; shows `SuccessState` on success

- [x] 11. Frontend: ID Card Component
  - [x] 11.1 Create `frontend/src/components/id-card/IdCardFront.tsx` — 340px card face: SBG logo top-left, purple top bar (4px), member name (Space Mono bold large), SBG ID (purple badge), course + year/section (two-column), school year, sticker PNG (bottom-right 48×48px), SVG grid background, purple accent squares; accepts `cardRef` for html-to-image capture
  - [x] 11.2 Create `frontend/src/components/id-card/IdCardBack.tsx` — back face: student number (Space Mono monospace), AWS interests (pill badges), QR code placeholder (decorative grid square), "AWS Student Builder" label, purple bottom bar (4px)
  - [x] 11.3 Create `frontend/src/components/id-card/StickerLayer.tsx` — renders a sticker PNG from `public/stickers/{stickerId}.png` as an absolutely positioned overlay; `object-contain`; 48×48px
  - [x] 11.4 Create `frontend/src/components/id-card/IdCard.tsx` — wraps `IdCardFront` and `IdCardBack` in `FlipCard`; manages `isFlipped` state internally; provides "Download as Image" button that calls `html-to-image`'s `toPng` on the currently visible face ref with `pixelRatio: 3`; file name: `SBG-ID-{student_number}.png`
  - [x] 11.5 Create `frontend/src/lib/utils.ts` — `assignSticker(memberId)` function: deterministic hash of member ID modulo sticker count, returns `sticker-{zero-padded-index}`; `cn()` class name helper; `formatSchoolYear()` helper

- [x] 12. Frontend: ID Finder Page
  - [x] 12.1 Create `frontend/src/pages/IdFinderPage.tsx` — search input for student number; calls `GET /api/members/lookup?student_number=`; on approved result renders `IdCard` with sticker; on non-approved result shows status-appropriate message; on 429 shows rate limit message with retry-after; on 404 shows "not found" message; SBG dark page layout with grid hero

- [x] 13. Frontend: Admin Login Page
  - [x] 13.1 Create `frontend/src/pages/AdminLoginPage.tsx` — centered login card on sbg-black background; secret input field; calls `POST /api/auth/login`; on success sets `useAdminStore.isAuthenticated` and redirects to `/admin/dashboard`; on 401 shows inline error; SBG logo + grid background

- [x] 14. Frontend: Admin Panel
  - [x] 14.1 Create `frontend/src/components/admin/AdminSidebar.tsx` — sbg-black sidebar (240px); SBG logo + "Admin Panel" heading; nav links for Dashboard, Members, Data Visualization, Announcements (active link highlighted with sbg-purple block); Logout button at bottom (calls `POST /api/auth/logout`, clears store, redirects to login)
  - [x] 14.2 Create `frontend/src/components/admin/AdminLayout.tsx` — route guard (redirects to `/admin/login` if not authenticated, checked via `GET /api/auth/me`); renders `AdminSidebar` + tab bar panel (sbg-navy-light background) + `<Outlet />`
  - [x] 14.3 Create `frontend/src/components/admin/tabs/DashboardTab.tsx` — fetches pending members from `GET /api/admin/members?status=pending`; renders `PendingApplicantList`; filter/sort controls (course, year level, gender, AWS interests, submission date); empty state message when queue is empty
  - [x] 14.4 Create `frontend/src/components/admin/PendingApplicantList.tsx` — table/list of pending applicants; each row shows name, student number, course, year, submission date, Approve and Reject action buttons; clicking a row opens `ApplicantDetailModal`
  - [x] 14.5 Create `frontend/src/components/admin/ApplicantDetailModal.tsx` — modal/drawer showing full applicant details: all personal info fields, why_join, expectations, links to COR and Proof of Share Google Drive files; Approve and Reject buttons; calls `POST /api/admin/members/:id/approve` or `/reject`; closes and refreshes list on success
  - [x] 14.6 Create `frontend/src/components/admin/tabs/MembersTab.tsx` — fetches all members from `GET /api/admin/members`; renders `MembersTable`; filter controls (status, course, year level, gender); sort controls (status, course, year level, registration date)
  - [x] 14.7 Create `frontend/src/components/admin/MembersTable.tsx` — table of all members with columns: name, student number, course, year/section, status (Badge), SBG ID, registration date; clicking a row opens `MemberDetailModal`
  - [x] 14.8 Create `frontend/src/components/admin/MemberDetailModal.tsx` — modal showing full member details including all registration fields, SBG ID, school year, and rendered `IdCard` component with flip animation and sticker
  - [x] 14.9 Create `frontend/src/components/admin/tabs/DataVizTab.tsx` — fetches `GET /api/admin/stats`; displays: total approved members count card, Accepted vs Rejected bar/pie chart, Members by Course bar chart, Members by Year Level bar chart, Members by Gender pie chart; all charts use Recharts styled with sbg-purple palette
  - [x] 14.10 Create `frontend/src/components/admin/Charts.tsx` — reusable Recharts wrapper components: `BarChartCard`, `PieChartCard`; dark theme (sbg-navy background, sbg-purple fills, sbg-text-muted axis labels, no grid lines on dark surfaces)
  - [x] 14.11 Create `frontend/src/components/admin/tabs/AnnouncementsTab.tsx` — renders `AnnouncementComposer`
  - [x] 14.12 Create `frontend/src/components/admin/AnnouncementComposer.tsx` — form with Subject (Input), Body (Textarea, multi-line), Signature (Input); Recipients dropdown (All Members / Specific Groups / Individual); when Specific Groups selected show Course/Year Level/Status filter selects; when Individual selected show searchable member list; Preview Email button (shows rendered email preview); Send Announcement button calls `POST /api/admin/announcements/send`; shows success confirmation with recipient count; shows failed delivery summary on partial failure
  - [x] 14.13 Create `frontend/src/pages/AdminPage.tsx` — shell page that renders `AdminLayout` with nested React Router routes for each tab

- [x] 15. Property-Based Tests
  - [x] 15.1 Install test dependencies in `backend/`: `vitest`, `@vitest/coverage-v8`, `fast-check`; install in `frontend/`: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`, `jsdom`
  - [x] 15.2 Write PBT for **Property 1 — SBG ID Format**: `fc.integer({ min: 2020, max: 2099 })` × `fc.integer({ min: 1, max: 9999 })` → assert output matches `/^SBG-\d{4}-\d{4}-PUPBC$/` and year/sequence appear verbatim (`backend/src/services/__tests__/sbgId.test.ts`)
  - [x] 15.3 Write PBT for **Property 2 — SBG ID Uniqueness**: given an array of existing IDs, `generateUniqueSbgId` returns a value not in that array (`backend/src/services/__tests__/sbgId.test.ts`)
  - [x] 15.4 Write PBT for **Property 3 — Registration Schema Validation**: generate valid and invalid registration objects; assert schema accepts all valid and rejects all invalid; client and server schemas produce identical results (`backend/src/lib/__tests__/validations.test.ts`)
  - [x] 15.5 Write PBT for **Property 4 — File Upload Validation**: `fc.integer()` for file size, `fc.string()` for MIME type → assert files accepted iff size ≤ 1,048,576 AND MIME is one of `{image/jpeg, image/png, application/pdf}` (`frontend/src/components/__tests__/FileUpload.test.tsx`)
  - [x] 15.6 Write PBT for **Property 5 — Duplicate Student Number Rejection**: given a student number already in DB, registration endpoint returns 409 and no new record is created (`backend/src/routes/__tests__/members.test.ts`)
  - [x] 15.7 Write PBT for **Property 6 — Drive File Naming Pattern**: `fc.string()` × `fc.constantFrom("cor", "proof_of_share")` × `fc.integer()` → assert filename matches `/{studentNumber}_(cor|proof_of_share)_\d+/` (`backend/src/services/__tests__/drive.test.ts`)
  - [x] 15.8 Write PBT for **Property 7 — Upload Failure Leaves No Partial Record**: mock `DriveService` to throw; assert no `Member` record created in DB (`backend/src/routes/__tests__/members.test.ts`)
  - [x] 15.9 Write PBT for **Property 8 — Form Step Validation Gate**: generate invalid field combinations for each step; assert form does not advance and inline errors are shown (`frontend/src/components/__tests__/RegistrationForm.test.tsx`)
  - [x] 15.10 Write PBT for **Property 9 — Progress Bar Segment Count**: `fc.integer({ min: 1, max: 3 })` → assert exactly `current` filled segments and `3 - current` unfilled segments rendered (`frontend/src/components/__tests__/ProgressBar.test.tsx`)
  - [x] 15.11 Write PBT for **Property 10 — Sticker Assignment Determinism**: `fc.string()` for member IDs → assert `assignSticker(id)` returns same value on repeated calls and matches `/^sticker-\d{2}$/` (`frontend/src/lib/__tests__/utils.test.ts`)
  - [x] 15.12 Write PBT for **Property 11 — Admin Endpoint Authentication**: `fc.string()` for invalid tokens, `fc.constantFrom(...)` for admin paths → assert all `/api/admin/*` requests without valid JWT return 401 (`backend/src/middleware/__tests__/auth.test.ts`)
  - [x] 15.13 Write PBT for **Property 12 — Approval Action Correctness**: given a pending member, approve action sets `status = approved`, assigns valid SBG ID matching format, sets `school_year`; SBG ID is unique in DB (`backend/src/routes/__tests__/members.test.ts`)
  - [x] 15.14 Write PBT for **Property 13 — Rejection Action Correctness**: given a pending member, reject action sets `status = rejected` and does not assign `sbg_id` (`backend/src/routes/__tests__/members.test.ts`)
  - [x] 15.15 Write PBT for **Property 14 — Stats Totals Consistency**: `fc.array(fc.record(...))` for member sets → assert `total === approved + pending + rejected + inactive + removed` and each breakdown sums correctly (`backend/src/routes/__tests__/stats.test.ts`)
  - [x] 15.16 Write PBT for **Property 15 — Announcement Recipient Filter Correctness**: given filter criteria and a member array, resolved recipient list contains only members matching all criteria (`backend/src/routes/__tests__/announcements.test.ts`)
  - [x] 15.17 Write PBT for **Property 16 — ID Finder Response by Status**: `fc.constantFrom("pending", "approved", "rejected", "inactive", "removed")` → assert lookup returns public data only for `approved`, status message for others, 404 for missing (`backend/src/routes/__tests__/members.test.ts`)
  - [x] 15.18 Write PBT for **Property 17 — Input Sanitization**: `fc.string()` including HTML special chars → assert `sanitize()` replaces `<`, `>`, `&`, `"`, `'` with entities and output contains no raw HTML tags (`backend/src/lib/__tests__/utils.test.ts`)
