# Requirements Document

## Introduction

This document defines the requirements for the major redesign and rebuild of the SBG (Student Builder Group) Membership Portal for PUP Biñan Campus. The rebuild migrates the platform from Next.js to a React.js (Vite) + Node.js (Express) architecture, introduces a redesigned multi-step registration flow with file uploads to Google Drive, a flippable digital membership ID card with randomized stickers, a permanent dark-mode UI aligned with the AWS Builder branding, an expanded admin panel with four tabs (Dashboard, Members, Data Visualization, Announcements), and a switch from AWS SES to MailSend for transactional email delivery.

---

## Glossary

- **Portal**: The SBG Membership Portal web application.
- **Registration_Form**: The multi-step student-facing form used to apply for SBG membership.
- **Applicant**: A student who has submitted a registration form and whose status is `pending`.
- **Member**: A student whose application has been approved and who holds an active SBG membership.
- **Admin**: An authenticated administrator who manages applications and members via the Admin Panel.
- **Admin_Panel**: The protected administrative interface containing the Dashboard, Members, Data Visualization, and Announcements tabs.
- **SBG_ID**: The unique membership identifier assigned to an approved member, formatted as `SBG-(year)-(sequence)-PUPBC`.
- **ID_Card**: The digital membership card displayed to approved members, featuring a front and back face with flip animation.
- **Sticker**: A PNG image randomly assigned to a member's ID_Card upon registration or revalidation.
- **COR**: Certificate of Registration — a document uploaded by the Applicant during registration.
- **Proof_of_Share**: A screenshot proving the Applicant shared the application post on social media.
- **Google_Drive_Uploader**: The server-side service responsible for uploading COR and Proof_of_Share files to a designated Google Drive folder.
- **MailSend_Service**: The email delivery service (MailSend API) used for all transactional and announcement emails.
- **Announcement**: An email broadcast sent by an Admin to a selected group of recipients.
- **Revalidation**: The process by which an existing Member re-confirms their membership for a new school year.
- **School_Year**: An academic year label (e.g., "2025-2026") used to track membership cycles.
- **Scholar_Email**: A student's institution-issued email address (e.g., `@iskolarngbayan.pup.edu.ph`).
- **Personal_Email**: A student's personal email address used for communications.
- **AWS_Interests**: A set of predefined AWS service/technology categories a student selects to indicate their technical interests.
- **Progress_Bar**: The visual indicator at the bottom of the Registration_Form showing the current step out of the total steps.
- **Flip_Animation**: A CSS 3D card-flip transition used on the Registration_Form between steps and on the ID_Card between front and back faces.

---

## Requirements

### Requirement 1: Tech Stack Migration

**User Story:** As a developer, I want the portal rebuilt on React.js + Node.js, so that the codebase is decoupled into a dedicated frontend and backend and is no longer tied to the Next.js framework.

#### Acceptance Criteria

1. THE Portal SHALL be implemented as a React.js single-page application (using Vite as the build tool) for the frontend and a Node.js + Express application for the backend API.
2. THE Portal SHALL retain Prisma ORM with Neon Postgres as the database layer.
3. THE Portal SHALL retain Tailwind CSS for styling.
4. THE Portal SHALL retain React Hook Form and Zod for form state management and schema validation.
5. THE Portal SHALL retain Zustand for global client-side state management.
6. THE Portal SHALL retain Lucide React for iconography.
7. WHEN the frontend communicates with the backend, THE Portal SHALL use REST API endpoints served by the Express application.
8. THE Portal SHALL retain the existing `SBG_ID` generation logic: `SBG-(year of first registration)-(4-digit zero-padded sequence)-PUPBC`.

---

### Requirement 2: Permanent Dark Mode

**User Story:** As a user, I want the portal to always display in dark mode, so that the visual experience is consistent with the SBG Builder brand and I am never shown an unintended light theme.

#### Acceptance Criteria

1. THE Portal SHALL render exclusively in dark mode using the `sbg-black` (`#0f1117`) page background and `sbg-navy` (`#1a1f2e`) surface colors at all times.
2. THE Portal SHALL NOT include a light mode toggle, light mode CSS variables, or any mechanism to switch to a light theme.
3. THE Portal SHALL remove the `ThemeToggle` component and `ThemeProvider` component from all pages and layouts.
4. THE Portal SHALL apply the AWS Builder color palette: `sbg-purple` (`#7C3AED`) as the primary action color, `sbg-orange` (`#FF9900`) reserved exclusively for the AWS logo mark.
5. THE Portal SHALL use the SVG grid background motif (white lines at low opacity) on hero sections and key dark panels.

---

### Requirement 3: Multi-Step Registration Form

**User Story:** As a student, I want to complete my membership application through a clearly structured multi-step form, so that I can provide all required information in an organized and guided way.

#### Acceptance Criteria

1. THE Registration_Form SHALL be divided into exactly three steps: Step 1 (Personal Info), Step 2 (Application Questions), and Step 3 (Attachments).
2. THE Registration_Form SHALL display a Progress_Bar at the bottom of the form card indicating the current step number and total steps.
3. WHEN the user navigates between steps, THE Registration_Form SHALL animate the transition using a horizontal card Flip_Animation.
4. THE Registration_Form SHALL validate each step's fields before allowing the user to advance to the next step; IF validation fails, THEN THE Registration_Form SHALL display inline error messages for each invalid field without advancing.
5. WHEN the user is on Step 1, THE Registration_Form SHALL collect: Full Name, Student Number, Course, Year and Section, Personal Email, Scholar Email, Gender, and AWS Interests (multi-select).
6. WHEN the user is on Step 2, THE Registration_Form SHALL collect: "Why do you wish to join the AWS Student Builder Group?" (long text) and "What are you expecting from AWS Student Builder Group?" (long text).
7. WHEN the user is on Step 3, THE Registration_Form SHALL allow the user to upload a COR file and a Proof_of_Share file.
8. THE Registration_Form SHALL enforce a maximum file size of 1 MB per uploaded file; IF a file exceeds 1 MB, THEN THE Registration_Form SHALL display an error message and reject the file.
9. THE Registration_Form SHALL accept only image files (JPEG, PNG) and PDF files for COR and Proof_of_Share uploads.
10. WHEN the user submits the completed form on Step 3, THE Registration_Form SHALL submit all collected data and files to the backend.
11. WHEN submission succeeds, THE Registration_Form SHALL display a success confirmation state to the user.
12. IF submission fails due to a server error, THEN THE Registration_Form SHALL display a descriptive error message and allow the user to retry without losing their entered data.
13. THE Registration_Form SHALL prevent duplicate submissions by checking if the Student Number already exists; IF a duplicate is detected, THEN THE Registration_Form SHALL display an error message on Step 1 before the user can advance.

---

### Requirement 4: Registration Form — Personal Info Fields

**User Story:** As a student, I want Step 1 of the registration form to capture all my personal and academic details, so that the SBG team has the information needed to verify my eligibility.

#### Acceptance Criteria

1. THE Registration_Form SHALL include a "Full Name" text input on Step 1, requiring a minimum of 2 characters and a maximum of 100 characters.
2. THE Registration_Form SHALL include a "Student Number" text input on Step 1, validated against the format `20XX-XXXXX-BN-X`.
3. THE Registration_Form SHALL include a "Course" text input or select field on Step 1, requiring a non-empty value.
4. THE Registration_Form SHALL include a "Year and Section" input on Step 1 (e.g., "BSIT-3A"), requiring a non-empty value of at most 20 characters.
5. THE Registration_Form SHALL include a "Personal Email" email input on Step 1, validated as a properly formatted email address.
6. THE Registration_Form SHALL include a "Scholar Email" email input on Step 1, validated as a properly formatted email address.
7. THE Registration_Form SHALL include a "Gender" select field on Step 1 with options: Male, Female, Non-binary, Prefer not to say.
8. THE Registration_Form SHALL include an "AWS Interests" multi-select field on Step 1 using the existing predefined interest categories; the user SHALL be required to select at least one interest.

---

### Requirement 5: File Upload to Google Drive

**User Story:** As a student, I want my uploaded COR and Proof_of_Share files to be securely stored, so that the SBG admin team can access and verify them during the application review.

#### Acceptance Criteria

1. WHEN the user uploads a COR file on Step 3, THE Google_Drive_Uploader SHALL upload the file to a designated Google Drive folder configured via an environment variable.
2. WHEN the user uploads a Proof_of_Share file on Step 3, THE Google_Drive_Uploader SHALL upload the file to the same designated Google Drive folder.
3. THE Google_Drive_Uploader SHALL name uploaded files using the pattern `{student_number}_{document_type}_{timestamp}` to ensure uniqueness.
4. WHEN a file upload to Google Drive succeeds, THE Google_Drive_Uploader SHALL return a shareable Google Drive file URL that is stored in the database alongside the member record.
5. IF a Google Drive upload fails, THEN THE Google_Drive_Uploader SHALL return a descriptive error and THE Registration_Form SHALL display the error to the user without saving an incomplete record.
6. THE Google_Drive_Uploader SHALL authenticate with Google Drive using a service account configured via environment variables (never hardcoded credentials).

---

### Requirement 6: Membership ID Format and ID Card

**User Story:** As an approved member, I want a unique membership ID and a digital ID card, so that I have official proof of my SBG membership.

#### Acceptance Criteria

1. WHEN an Admin approves an Applicant, THE Portal SHALL generate an SBG_ID in the format `SBG-(year of first registration)-(4-digit zero-padded sequence)-PUPBC` (e.g., `SBG-2026-0001-PUPBC`).
2. THE Portal SHALL guarantee SBG_ID uniqueness within the database; IF a collision is detected, THEN THE Portal SHALL increment the sequence until a unique value is found.
3. THE ID_Card SHALL display a front face showing: SBG logo, member's full name, SBG_ID, course, year and section, and school year.
4. THE ID_Card SHALL display a back face showing: member's student number, AWS interests, and a QR code or decorative element.
5. WHEN the user clicks or taps the ID_Card, THE ID_Card SHALL animate a 3D Flip_Animation to reveal the opposite face.
6. WHEN a Member's ID_Card is rendered, THE Portal SHALL assign a random Sticker PNG from the available sticker assets and display it on the card.
7. THE Portal SHALL assign the same Sticker to a Member consistently within a session; a new random Sticker MAY be assigned on revalidation.
8. THE ID_Card SHALL provide a "Download as Image" action that exports the currently visible card face as a PNG file using html-to-image.
9. THE ID_Card SHALL be styled using the SBG dark Builder aesthetic: `sbg-navy` background, Space Mono typography, purple accents, and the grid motif.

---

### Requirement 7: Admin Panel — General Structure

**User Story:** As an Admin, I want a protected admin panel with clearly separated tabs, so that I can efficiently manage applications, members, data, and communications from a single interface.

#### Acceptance Criteria

1. THE Admin_Panel SHALL be accessible only to authenticated Admins; WHEN an unauthenticated user attempts to access the Admin_Panel, THE Admin_Panel SHALL redirect them to the admin login page.
2. THE Admin_Panel SHALL contain exactly four tabs: Dashboard, Members, Data Visualization, and Announcements.
3. THE Admin_Panel SHALL display the tab navigation using a panel with a lighter shade than the main page background to visually distinguish the tab bar; the tab panel background SHALL use `sbg-navy-light` (`#252b3b`).
4. WHEN an Admin clicks a tab, THE Admin_Panel SHALL display the corresponding tab content without a full page reload.
5. THE Admin_Panel SHALL display the SBG logo and the authenticated admin's identifier in the sidebar or header.
6. THE Admin_Panel SHALL provide a logout action that clears the admin session and redirects to the login page.

---

### Requirement 8: Admin Panel — Dashboard Tab

**User Story:** As an Admin, I want to review pending applications and take approve/reject actions, so that I can manage the membership pipeline efficiently.

#### Acceptance Criteria

1. THE Admin_Panel Dashboard tab SHALL display a list of all Applicants with `pending` status.
2. WHEN an Admin clicks on a pending Applicant in the list, THE Admin_Panel SHALL display the Applicant's full registration details including all personal info fields, application question responses, and links to their uploaded COR and Proof_of_Share files.
3. THE Admin_Panel Dashboard tab SHALL provide an "Approve" action and a "Reject" action for each pending Applicant.
4. WHEN an Admin approves an Applicant, THE Portal SHALL update the Applicant's status to `approved`, generate and assign an SBG_ID, and trigger a welcome email via the MailSend_Service.
5. WHEN an Admin rejects an Applicant, THE Portal SHALL update the Applicant's status to `rejected` and trigger a rejection notification email via the MailSend_Service.
6. THE Admin_Panel Dashboard tab SHALL provide filter and sort controls allowing the Admin to filter the pending list by course, year level, gender, and AWS interests, and to sort by submission date.
7. WHEN there are no pending Applicants, THE Admin_Panel Dashboard tab SHALL display a confirmation message indicating the queue is empty.

---

### Requirement 9: Admin Panel — Members Tab

**User Story:** As an Admin, I want to browse and inspect all members, so that I can monitor membership status and access individual member details.

#### Acceptance Criteria

1. THE Admin_Panel Members tab SHALL display a list of all Members regardless of status (approved, inactive, rejected, removed).
2. THE Admin_Panel Members tab SHALL provide sort controls allowing the Admin to sort members by status, course, year level, and registration date.
3. THE Admin_Panel Members tab SHALL provide filter controls allowing the Admin to filter members by status, course, year level, and gender.
4. WHEN an Admin clicks on a Member in the list, THE Admin_Panel SHALL display the Member's full details including all registration fields, SBG_ID, school year, and a rendered ID_Card.
5. THE Admin_Panel Members tab SHALL display the Member's ID_Card in the detail view with the same Flip_Animation and sticker as the member-facing view.

---

### Requirement 10: Admin Panel — Data Visualization Tab

**User Story:** As an Admin, I want to see visual breakdowns of membership data, so that I can understand the composition and growth of the SBG membership.

#### Acceptance Criteria

1. THE Admin_Panel Data Visualization tab SHALL display the total count of current approved Members.
2. THE Admin_Panel Data Visualization tab SHALL display a chart showing the count of Accepted (approved) vs Rejected applications.
3. THE Admin_Panel Data Visualization tab SHALL display a chart showing the breakdown of Members by Course.
4. THE Admin_Panel Data Visualization tab SHALL display a chart showing the breakdown of Members by Year Level.
5. THE Admin_Panel Data Visualization tab SHALL display a chart showing the breakdown of Members by Gender.
6. THE Admin_Panel Data Visualization tab SHALL use Recharts for all chart components, styled with the SBG dark color palette (purple, navy, muted text).
7. WHEN the underlying member data changes (e.g., after an approval), THE Admin_Panel Data Visualization tab SHALL reflect the updated counts on the next page load or tab switch.

---

### Requirement 11: Admin Panel — Announcements Tab

**User Story:** As an Admin, I want to compose and send email announcements to selected groups of members or applicants, so that I can communicate important information efficiently.

#### Acceptance Criteria

1. THE Admin_Panel Announcements tab SHALL provide a compose form with the following fields: Subject (text input), Body (rich text or multi-line text area), and Signature (text input).
2. THE Admin_Panel Announcements tab SHALL auto-generate a standard email Header and Footer; the Admin SHALL NOT be required to manually compose the header or footer.
3. THE Admin_Panel Announcements tab SHALL provide a "Recipients" dropdown with the following options: All Members, Specific Groups (by course, year level, or status), and Individual Applicants (searchable by name or student number).
4. WHEN the Admin selects "Specific Groups", THE Admin_Panel Announcements tab SHALL display additional filter controls to define the group criteria.
5. WHEN the Admin selects "Individual Applicants", THE Admin_Panel Announcements tab SHALL display a searchable list allowing the Admin to select one or more specific recipients.
6. WHEN the Admin submits the announcement form, THE MailSend_Service SHALL send the composed email to all selected recipients.
7. IF the MailSend_Service returns an error for one or more recipients, THEN THE Admin_Panel Announcements tab SHALL display a summary of failed deliveries without blocking successful deliveries to other recipients.
8. THE Admin_Panel Announcements tab SHALL display a confirmation message after a successful send, including the recipient count.

---

### Requirement 12: Email Service — MailSend Integration

**User Story:** As a developer, I want all transactional and announcement emails sent via MailSend, so that the portal is no longer dependent on AWS SES and email delivery is managed through a single, dedicated service.

#### Acceptance Criteria

1. THE Portal SHALL remove all AWS SES SDK dependencies and replace them with the MailSend API client.
2. THE MailSend_Service SHALL send a welcome email to a newly approved Member containing their full name, SBG_ID, and a link to the ID Finder page.
3. THE MailSend_Service SHALL send a rejection notification email to a rejected Applicant containing their full name and a polite rejection message.
4. THE MailSend_Service SHALL send announcement emails composed in the Admin_Panel Announcements tab to the selected recipients.
5. THE MailSend_Service SHALL authenticate using a MailSend API key stored in an environment variable; the key SHALL NOT be hardcoded.
6. IF the MailSend_Service fails to deliver an email, THEN THE Portal SHALL log the failure with the recipient address and error details, and SHALL NOT silently discard the failure.
7. THE MailSend_Service SHALL use a consistent sender address and display name configured via environment variables.

---

### Requirement 13: ID Finder (Public)

**User Story:** As an approved member, I want to look up my membership record by student number, so that I can view and download my digital ID card.

#### Acceptance Criteria

1. THE Portal SHALL provide a public ID Finder page where any user can enter a Student Number to search for a membership record.
2. WHEN a valid Student Number is entered and the corresponding Member has `approved` status, THE Portal SHALL display the Member's ID_Card with the Flip_Animation and sticker.
3. IF the Student Number does not match any record, THEN THE Portal SHALL display a "not found" message.
4. IF the Student Number matches a record with `pending`, `rejected`, `inactive`, or `removed` status, THEN THE Portal SHALL display an appropriate status message without revealing sensitive personal details.
5. THE Portal SHALL apply rate limiting to the ID Finder endpoint to prevent enumeration attacks; IF a client exceeds the rate limit, THEN THE Portal SHALL return a 429 response with a retry-after indicator.

---

### Requirement 14: Data Persistence and Schema

**User Story:** As a developer, I want the database schema to capture all new registration fields and file upload references, so that all member data is stored reliably and queryable.

#### Acceptance Criteria

1. THE Portal SHALL extend the Member database model to include: `course` (string), `scholar_email` (string), `gender` (enum: Male, Female, Non-binary, PreferNotToSay), `why_join` (text), `expectations` (text), `cor_url` (string, nullable), `proof_of_share_url` (string, nullable), and `sticker_id` (string, nullable).
2. THE Portal SHALL retain the existing fields: `id`, `student_number`, `full_name`, `email` (personal email), `year_level`, `section`, `skills` (AWS interests), `status`, `sbg_id`, `school_year`, `created_at`, `updated_at`.
3. THE Portal SHALL enforce a unique constraint on `student_number` in the database.
4. THE Portal SHALL enforce a unique constraint on `sbg_id` in the database.
5. WHEN a Prisma migration is run, THE Portal SHALL apply all schema changes without data loss to existing records.

---

### Requirement 15: Security and Input Validation

**User Story:** As a developer, I want all user inputs validated and all API endpoints protected, so that the portal is resistant to common web vulnerabilities.

#### Acceptance Criteria

1. THE Portal SHALL validate all registration form inputs on both the client (Zod + React Hook Form) and the server (Zod in the Express route handler) before persisting any data.
2. THE Portal SHALL use parameterized queries via Prisma for all database operations to prevent SQL injection.
3. THE Portal SHALL sanitize all user-supplied text inputs before storing them to prevent stored XSS.
4. THE Admin_Panel SHALL be protected by session-based or JWT-based authentication; WHEN a request to an admin API endpoint is made without a valid token, THE Portal SHALL return a 401 response.
5. THE Portal SHALL enforce CORS on the Express API, allowing requests only from the configured frontend origin.
6. THE Portal SHALL store all secrets (database URL, MailSend API key, Google Drive service account credentials, admin secret) exclusively in environment variables.
