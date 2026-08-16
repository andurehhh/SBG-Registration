# SBG Club Website — Content & Feature Specification

What the official AWS Student Builder Group (PUP Biñan) website should contain to function as a proper tech club presence online.

---

## Site Structure

```
/                → Home (hero, mission, CTA)
/about           → About the club (vision, mission, history, officers, departments)
/learn           → AWS learning resources (curated links by level)
/events          → Event listing (upcoming + past)
/register        → Membership registration
/id-finder       → Digital ID lookup
/[admin-path]/*  → Admin dashboard (hidden)
```

---

## Page Breakdown

### Home (`/`)

**Purpose:** First impression. Tell visitors what SBG is and what to do next.

| Section | Content |
|---|---|
| Hero | Club name, one-line tagline, "Join Us" CTA button |
| What We Do | 3-4 cards (Build, Learn, Certify, Connect) |
| Mission & Vision | Short paragraphs (2-3 sentences each) |
| Upcoming Events | Preview of next 2-3 events with links |
| Stats | Member count, events held, certifications earned |
| CTA | "Ready to build?" → Register button |

---

### About (`/about`)

**Purpose:** Who we are, who runs it, and why we exist.

| Section | Content |
|---|---|
| Mission | Why the club exists (1 paragraph) |
| Vision | What we aspire to be (1 paragraph) |
| History | Brief timeline — "Founded in [year] by [name]..." (keep to 3-5 sentences) |
| Officers | Grid of cards: photo, name, role, socials (LinkedIn/GitHub) |
| Departments | List of teams: DevTeam, Cloud, Marketing, etc. with brief description |
| Advisor | Faculty advisor name + department |

**Note:** Don't add mascot lore unless it's actually a thing students care about. If the mascot is just a logo, it's branding — not a page.

---

### Learn (`/learn`)

**Purpose:** Curated AWS learning path for members at every level.

| Section | What it covers |
|---|---|
| **Getting Started with AWS** | What is cloud computing, AWS overview, free-tier setup, first console walkthrough |
| **AWS Skill Builder** | Links to free AWS Skill Builder courses, learning plans, digital badges |
| **Hands-on Workshops** | Lab exercises, guided projects, AWS Workshop Studio links, SBG's own workshop materials |
| **Getting to the Next Level** | AWS Certifications — study paths, practice exams, exam registration, tips from certified members |

**Format:** Simple sections with curated link cards. Admin-editable via S3-hosted resources in the future.

---

### Events (`/events`)

**Purpose:** Show the club is active. Let members RSVP.

| Section | Content |
|---|---|
| Upcoming Events | Card list: title, date, venue, description, RSVP button |
| Past Events | Archive with photos, attendee count, recap |

**Future:** QR code attendance, check-in system, attendee export.

---

### Register (`/register`)

Two modes via a toggle at the top of the page:

**[ New Member ] [ Returning Member ]**

#### New Member (existing flow)
Full multi-step form: personal info, application questions, COR + proof of share upload, confirmation email.

#### Returning Member (renewal flow)
Minimal form — 3 fields, done in 30 seconds:

1. **SBG ID** — input their existing club ID (e.g., `SBG-PUPBC-2026-0042`)
   - System verifies the ID exists and member status is `inactive`
   - If not found or not inactive → show error: "ID not found or membership is already active"
2. **Upload new COR** — updated Certificate of Registration for the current semester
3. **Upload proof of share** — screenshot proving they shared the recruitment post

On submit:
- Updates the existing member record with new COR/proof URLs
- Sets status back to `pending`
- Tags with the current active school year + semester
- Sends confirmation email
- Admin reviews and approves (same flow as new members)

---

### ID Finder (`/id-finder`)

Already built — search by student number, display digital membership card.

---

## Global Elements

### Navbar

```
[SBG Logo] Home | About | Learn | Events | Register | Find ID    [Theme Toggle]
```

Mobile: hamburger menu.

### Footer

```
© 2026 AWS Student Builder Group — PUP Biñan
[Facebook] [Discord] [GitHub] [Email]
```

---

## Content Priorities

**Essential (launch with these):**
- [ ] Home page with hero, mission, CTA
- [ ] About page with officers and departments
- [ ] Events page (even if empty initially)
- [ ] Learn page with 10-15 curated links
- [ ] Global navbar + footer

**Nice-to-have (add later):**
- [ ] Blog/News section
- [ ] Member spotlight / project showcase
- [ ] Photo gallery from events
- [ ] FAQ page
- [ ] Founder's message (short)

**Skip:**
- Mascot origin story page
- Detailed constitution/bylaws (link to PDF instead)
- Individual officer biography pages (a card with photo + role is enough)

---

## Design Notes

- Keep the existing SBG dark-first design system
- Static pages (About, Learn) are just hardcoded React components — no backend needed
- Events will eventually be database-driven (Supabase table)
- Learn resources can start hardcoded, migrate to DB when you want admin-editable content
- All pages should be mobile-first — most students will visit from their phones

---

## Implementation Order

1. **Navbar + Footer** — shared layout for all pages
2. **Home page** — expand current landing with sections
3. **About page** — officers, mission/vision, departments
4. **Learn page** — curated AWS resource cards
5. **Events page** — static initially, DB-driven later

---

## Admin Dashboard — Planned Features

The admin panel will expand to support full club operations management.

### Current (Built)

| Tab | Features |
|---|---|
| **Dashboard** | Pending applicants, bulk approve/reject, registration toggle, term reset |
| **Members** | Full member list, filters, CSV export |
| **Data Viz** | Charts and stats (by course, year, gender, skills) |
| **Announcements** | Gmail-style composer, recipient groups, email templates |
| **Audit Log** | Timeline of all admin actions with filters |

### Planned — Event Management

| Feature | Description |
|---|---|
| Create Event | Title, date/time, venue, description, capacity, poster image |
| Edit/Cancel Event | Modify details or cancel with notification to RSVPs |
| RSVP Approvals | View member RSVPs, approve/reject attendance |
| QR Code Generation | Auto-generate unique QR per approved attendee |
| Check-in Scanner | Scan QR codes at the event (camera-based or manual entry) |
| Attendee List | Real-time list with check-in status, search, filters |
| Attendance Export | CSV export: name, student number, course, check-in timestamp |
| Event Analytics | Attendance rate, no-show rate, popular event types |

### Planned — Department Management

SBG has three departments: **Core Team Officers**, **Dev Team**, and **Skill Builder Department**.

| Feature | Description |
|---|---|
| Manage Departments | Pre-defined departments (Core Team, Dev Team, Skill Builder) — admin can edit name, description, and head |
| Assign Members | Place approved members into a department after onboarding |
| Department Roster | View all members in a department, filter by role, export |
| Department Announcements | Send emails scoped to a specific department only |
| Roles per Department | Assign roles: Head, Lead, Member — displayed on the About page |
| Department Display | Feeds the public About page automatically (officers, team members per department) |

### Planned — Content Management

| Feature | Description |
|---|---|
| Officers Management | Add/edit/remove officers (name, role, photo, socials) — feeds the About page |
| Learning Resources | CRUD for resource cards (title, URL, category, description) — feeds the Learn page |
| Site Settings | Edit mission, vision, tagline, social links — feeds public pages |

### Planned — Swag Inventory

Track club merchandise (shirts, stickers, lanyards, etc.) and distribution.

| Feature | Description |
|---|---|
| Add Swag Items | Name, description, image, quantity in stock, cost per unit |
| Stock Tracking | Current quantity, low-stock alerts (configurable threshold) |
| Distribution Log | Record who received what (member name, item, quantity, date) |
| Claim / Request | Members can request swag (admin approves and marks as distributed) |
| Restock History | Log when items are restocked (quantity added, date, notes) |
| Export | CSV export of inventory status or distribution history |

### Planned — Finance Tracker

Simple income/expense tracking for club funds (event budgets, sponsorships, swag sales).

| Feature | Description |
|---|---|
| Record Transaction | Type (income/expense), amount, category, description, date, receipt image (optional) |
| Categories | Event expenses, swag purchases, sponsorship income, donations, miscellaneous |
| Balance Dashboard | Current balance, income vs. expenses chart, monthly breakdown |
| Per-Event Budget | Assign expenses to specific events — track event cost vs. attendance |
| Reports | Monthly/semester financial summary, exportable as CSV or PDF |
| Access Control | Finance data visible only to Core Team (role-based within admin) |

### Planned — Member Portal (Self-Service)

_Removed — keeping the member experience simple. Members use the public ID Finder page to view their card. No login required for members._

---

## Admin Sidebar (Future State)

```
[Logo]
──────────────────
Dashboard
Members
Events            ← new
Departments       ← new
Announcements
Audit Log
──────────────────
Content           ← new (Officers, Resources, Settings)
──────────────────
Logout
```
