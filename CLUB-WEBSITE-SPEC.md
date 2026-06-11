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

| Category | Resources |
|---|---|
| **Getting Started** | What is Cloud Computing?, AWS overview video, free-tier setup guide |
| **Beginner** | AWS Cloud Practitioner learning path, AWS Skill Builder free courses, intro labs |
| **Builder** | Hands-on workshops, project ideas, AWS Well-Architected labs |
| **Certification** | Study guides (CCP, SAA, DVA), practice exams, exam registration links |
| **Community** | AWS Community Builder program, re:Post, Student Hub, re:Invent recordings |
| **SBG Materials** | Club workshop recordings, slide decks, project repos (if any) |

**Format:** Grid of cards — title, short description, category badge, external link. Admin-editable in the future (store in DB).

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

Already built — multi-step form with validation, file uploads, and confirmation email.

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
© 2025 AWS Student Builder Group — PUP Biñan
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

### Planned — Member Portal (Self-Service)

| Feature | Description |
|---|---|
| Magic Link Login | Members log in via email link (no password) |
| My Profile | View/edit personal info, see department assignment |
| My ID | View and download digital membership ID |
| My Events | See registered events, QR codes, attendance history |

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
[Theme Toggle]
Logout
```
