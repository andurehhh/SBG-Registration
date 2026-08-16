# Admin Operations Guide

A practical guide for SBG club officers on using the admin dashboard.

---

## Accessing the Admin Panel

The admin panel is accessed via a **secret URL** that is not linked anywhere on the public site.

1. Navigate to: `https://your-domain.com/<secret-path>/login`
   - The `<secret-path>` is set by your team (e.g., `portal-ctrl`). Ask your tech lead if you don't know it.
2. Sign in with your admin email and password (Supabase Auth credentials)
3. You'll be redirected to the dashboard

> **Tip**: Bookmark the admin login URL for quick access. Never share it publicly.

---

## Dashboard Overview

After logging in, you'll see the admin dashboard with a sidebar navigation:

| Tab | What it does |
|---|---|
| **Dashboard** | View pending applications, quick stats, approve/reject |
| **Members** | Full member list with search, filters, and CSV export |
| **Data Viz** | Charts showing membership stats (by course, year, gender, skills) |
| **Announcements** | Compose and send emails to members |
| **Audit Log** | View history of all admin actions |

---

## Viewing Pending Applications

1. Go to the **Dashboard** tab
2. The "Pending Applicants" section shows all new registrations awaiting review
3. Each card shows: name, student number, course, year level, and submission date
4. Click on an applicant to view their full details (including uploaded documents)

---

## Approving Members

### Individual Approval

1. Click on a pending applicant to open their detail modal
2. Review their information: personal details, COR document, proof of share
3. Click the **Approve** button
4. The system will:
   - Generate a unique SBG ID (format: `SBG-PUPBC-YEAR-NNNN`)
   - Send an approval email with their SBG ID
   - Log the action in the audit trail

### Bulk Approval

1. On the Dashboard tab, select multiple applicants using the checkboxes
2. A **Bulk Actions** toolbar appears at the top
3. Click **Approve Selected**
4. Confirm the action in the dialog
5. All selected members are approved simultaneously

---

## Rejecting Members

### Individual Rejection

1. Open the applicant's detail modal
2. Click the **Reject** button
3. Optionally provide a reason (included in the notification email)
4. Confirm the action

### Bulk Rejection

1. Select multiple applicants via checkboxes
2. Click **Reject Selected** in the bulk actions toolbar
3. Confirm

> **Note**: Rejected members can re-register in the future. Their previous data is kept but marked as rejected.

---

## Starting a New Semester (Term Reset)

This is done at the **beginning of each semester** to reset membership for the new term.

1. Go to the **Dashboard** tab
2. Find the **Term Reset** section
3. Enter the new school year (e.g., `2026-2027`) and select the semester (`1st` or `2nd`)
4. Click **Start New Term**
5. Confirm the action

**What happens when you click it:**
- All currently `approved` members are set to `inactive`
- A new SchoolYear record is created and marked as active
- The previous term is deactivated
- Members must re-register (renewal) to become active again for the new term
- An audit log entry is created

> **Warning**: This action affects ALL approved members. Make sure you're ready to start the new term before clicking.

---

## Sending Announcements

The announcements feature works like a Gmail-style email composer.

### Composing an Email

1. Go to the **Announcements** tab
2. Click **New Announcement**
3. Fill in:
   - **Subject**: Email subject line
   - **Body**: Rich text content (supports HTML formatting)
   - **Signature**: Your sign-off (e.g., "— SBG Core Team")
   - **Header/Footer Images**: Optional banner images (paste URLs)

### Choosing Recipients

| Option | Who receives it |
|---|---|
| **All Members** | Every approved member in the database |
| **By Group** | Filter by course, year level, or status |
| **Individual** | Select specific members from a list |

### Sending

1. Review your message in the preview
2. Click **Send Announcement**
3. Emails are queued and sent automatically within 1-5 minutes
4. The action is logged in the audit trail with the subject and recipient count

---

## Viewing the Audit Log

The audit log shows a chronological history of all admin actions.

1. Go to the **Audit Log** tab
2. Each entry shows:
   - **Action**: What was done (approve, reject, announcement, term reset, etc.)
   - **Actor**: Which admin performed it
   - **Target**: Affected member (if applicable)
   - **Timestamp**: When it happened
   - **Details**: Additional context (email subject, bulk count, etc.)

### Filtering

- Filter by action type (approvals only, announcements only, etc.)
- Filter by date range
- Search by member name

---

## Exporting Member Data (CSV)

1. Go to the **Members** tab
2. Apply any desired filters (by status, course, year level, etc.)
3. Click the **Export CSV** button
4. A CSV file downloads containing all visible member data

The export includes: student number, full name, email, course, year level, section, status, SBG ID, school year, and registration date.

---

## Registration Window Toggle

Control whether new registrations are accepted.

1. Go to the **Dashboard** tab
2. Find the **Registration Control** toggle
3. Switch it ON to open registration, OFF to close it

**When closed:**
- The public registration form shows a message that registration is currently closed
- Existing members can still use the ID Finder
- Renewal is also disabled when registration is closed

**When open:**
- Students can submit new registrations
- Returning members can submit renewal applications

---

## Quick Reference

| Action | Where | Effect |
|---|---|---|
| Approve member | Dashboard → Applicant → Approve | Assigns SBG ID, sends email |
| Reject member | Dashboard → Applicant → Reject | Marks as rejected |
| Bulk approve | Dashboard → Select → Approve Selected | Approves all selected |
| Open/close registration | Dashboard → Toggle | Enables/disables public form |
| New semester | Dashboard → Term Reset | Resets all members to inactive |
| Send email | Announcements → Compose | Queues emails to recipients |
| Export data | Members → Export CSV | Downloads filtered member data |
| View history | Audit Log | See all past admin actions |
