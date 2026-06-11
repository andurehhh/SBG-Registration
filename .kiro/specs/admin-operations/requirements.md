# Requirements Document

## Introduction

This feature adds three operational admin capabilities to the SBG Registration Portal: bulk approve/reject for pending applicants, CSV export of the filtered member list, and a persistent audit log tracking all admin actions. These features reduce repetitive manual work during high-volume recruitment periods, enable offline data analysis, and provide accountability and traceability for administrative decisions.

## Glossary

- **Admin_Portal**: The authenticated admin dashboard of the SBG Registration Portal, accessible via protected routes with Supabase Auth.
- **Pending_Applicant_Table**: The table component (`PendingApplicantList`) displaying members with status `pending`, rendered in the Dashboard tab.
- **Bulk_Action_Toolbar**: A contextual toolbar that appears when one or more applicants are selected via checkboxes, offering batch approve or reject actions.
- **Confirmation_Modal**: A dialog overlay requiring explicit admin confirmation before executing a destructive or batch operation.
- **CSV_Exporter**: A client-side module that converts the current filtered member list into a downloadable CSV file.
- **Audit_Log**: A PostgreSQL table (`AuditLog`) recording timestamped entries of admin actions with actor, target, and action metadata.
- **Audit_Log_Tab**: A new admin tab displaying the audit log timeline with filtering capabilities.
- **Toast_System**: The existing `useToastStore` notification system used to display success, error, and informational messages to the admin.
- **Edge_Function**: A Supabase Deno-based serverless function invoked via the `edgeFn` API helper with JWT authentication.
- **Member**: A record in the `Member` PostgreSQL table representing a student applicant or approved member.

## Requirements

### Requirement 1: Bulk Selection of Pending Applicants

**User Story:** As an admin, I want to select multiple pending applicants using checkboxes, so that I can perform batch actions on them without clicking individually.

#### Acceptance Criteria

1. THE Pending_Applicant_Table SHALL render a checkbox in each row alongside the existing columns.
2. THE Pending_Applicant_Table SHALL render a header checkbox that toggles selection of all visible applicants on the current page.
3. WHEN an admin checks or unchecks a row checkbox, THE Pending_Applicant_Table SHALL update the selection state to include or exclude that applicant.
4. WHEN an admin checks the header checkbox, THE Pending_Applicant_Table SHALL select all visible applicants on the current page.
5. WHEN an admin unchecks the header checkbox, THE Pending_Applicant_Table SHALL deselect all selected applicants.
6. WHILE one or more applicants are selected, THE Bulk_Action_Toolbar SHALL be visible displaying the count of selected applicants and bulk action buttons.
7. WHEN zero applicants are selected, THE Bulk_Action_Toolbar SHALL be hidden.

### Requirement 2: Bulk Approve Action

**User Story:** As an admin, I want to approve multiple pending applicants at once, so that I can process large batches of applications efficiently during recruitment.

#### Acceptance Criteria

1. WHILE one or more applicants are selected, THE Bulk_Action_Toolbar SHALL display an "Approve Selected" button.
2. WHEN the admin clicks "Approve Selected", THE Confirmation_Modal SHALL appear displaying the message "Approve {N} applicant(s)?" where {N} is the count of selected applicants.
3. WHEN the admin confirms the bulk approve action, THE Admin_Portal SHALL invoke the approve Edge_Function for each selected applicant.
4. WHILE the bulk approve operation is in progress, THE Admin_Portal SHALL display a progress indicator showing the number of completed operations out of the total.
5. WHEN all bulk approve operations complete successfully, THE Toast_System SHALL display a success message indicating the number of approved applicants.
6. IF one or more individual approve operations fail during bulk processing, THEN THE Toast_System SHALL display an error message indicating the count of failed operations.
7. WHEN the bulk approve operation completes, THE Pending_Applicant_Table SHALL refresh to reflect the updated statuses.
8. WHEN the admin clicks "Cancel" in the Confirmation_Modal, THE Admin_Portal SHALL close the modal and take no action.

### Requirement 3: Bulk Reject Action

**User Story:** As an admin, I want to reject multiple pending applicants at once, so that I can efficiently clear unqualified applications in batch.

#### Acceptance Criteria

1. WHILE one or more applicants are selected, THE Bulk_Action_Toolbar SHALL display a "Reject Selected" button.
2. WHEN the admin clicks "Reject Selected", THE Confirmation_Modal SHALL appear displaying the message "Reject {N} applicant(s)?" where {N} is the count of selected applicants.
3. WHEN the admin confirms the bulk reject action, THE Admin_Portal SHALL invoke the reject Edge_Function for each selected applicant.
4. WHILE the bulk reject operation is in progress, THE Admin_Portal SHALL display a progress indicator showing the number of completed operations out of the total.
5. WHEN all bulk reject operations complete successfully, THE Toast_System SHALL display a success message indicating the number of rejected applicants.
6. IF one or more individual reject operations fail during bulk processing, THEN THE Toast_System SHALL display an error message indicating the count of failed operations.
7. WHEN the bulk reject operation completes, THE Pending_Applicant_Table SHALL refresh to reflect the updated statuses.
8. WHILE a bulk operation is in progress, THE Bulk_Action_Toolbar SHALL disable both bulk action buttons to prevent concurrent operations.

### Requirement 4: CSV Export of Filtered Members

**User Story:** As an admin, I want to export the currently filtered member list as a CSV file, so that I can analyze member data offline in a spreadsheet application.

#### Acceptance Criteria

1. THE Members_Tab SHALL display an "Export CSV" button in the header area alongside the existing Refresh button.
2. WHEN the admin clicks "Export CSV", THE CSV_Exporter SHALL generate a CSV file containing all members matching the current active filters (status, course, search).
3. THE CSV_Exporter SHALL include the following columns in the exported file: full_name, student_number, email, course, year_level, section, status, sbg_id, school_year, created_at.
4. THE CSV_Exporter SHALL use the first row of the CSV file as a header row with column names matching the field names.
5. THE CSV_Exporter SHALL properly escape field values containing commas, double quotes, or newline characters according to RFC 4180.
6. WHEN the CSV file is generated, THE CSV_Exporter SHALL trigger a browser download with the filename format "sbg-members-{YYYY-MM-DD}.csv".
7. THE CSV_Exporter SHALL fetch all members matching the active filters regardless of the current page pagination to include the complete dataset.
8. WHILE the CSV export is in progress, THE Export button SHALL display a loading state and be disabled to prevent duplicate exports.
9. IF the filtered member list is empty, THEN THE Toast_System SHALL display an informational message "No members to export" and the CSV_Exporter SHALL not generate a file.

### Requirement 5: Audit Log Data Model

**User Story:** As an admin, I want all admin actions recorded in a persistent audit log, so that there is a traceable history of decisions for accountability.

#### Acceptance Criteria

1. THE Audit_Log table SHALL store the following fields for each entry: id (UUID primary key), action_type (text), actor_email (text), actor_id (UUID), target_member_id (UUID, nullable), target_member_name (text, nullable), details (JSONB, nullable), created_at (timestamptz).
2. THE Audit_Log table SHALL record entries for the following action types: "approve", "reject", "bulk_approve", "bulk_reject", "announcement_sent", "registration_toggled", "term_reset".
3. WHEN an admin approves a member, THE Admin_Portal SHALL insert an audit log entry with action_type "approve" and the target member information.
4. WHEN an admin rejects a member, THE Admin_Portal SHALL insert an audit log entry with action_type "reject" and the target member information.
5. WHEN an admin performs a bulk approve, THE Admin_Portal SHALL insert a single audit log entry with action_type "bulk_approve" and the count and list of target member IDs in the details field.
6. WHEN an admin performs a bulk reject, THE Admin_Portal SHALL insert a single audit log entry with action_type "bulk_reject" and the count and list of target member IDs in the details field.
7. WHEN an admin sends an announcement, THE Admin_Portal SHALL insert an audit log entry with action_type "announcement_sent" and the subject and recipient count in the details field.
8. WHEN an admin toggles the registration window, THE Admin_Portal SHALL insert an audit log entry with action_type "registration_toggled" and the new state (open/closed) in the details field.
9. WHEN an admin resets the school term, THE Admin_Portal SHALL insert an audit log entry with action_type "term_reset".

### Requirement 6: Audit Log Admin Tab

**User Story:** As an admin, I want to view and filter the audit log in a dedicated tab, so that I can review the history of admin actions and investigate specific events.

#### Acceptance Criteria

1. THE Admin_Portal sidebar SHALL include a new "Audit Log" navigation item with a corresponding route and tab component.
2. THE Audit_Log_Tab SHALL display entries in reverse chronological order (newest first) as a timeline list.
3. THE Audit_Log_Tab SHALL display for each entry: action type badge, actor email, target member name (when applicable), timestamp, and details summary.
4. THE Audit_Log_Tab SHALL provide a filter dropdown to filter entries by action_type.
5. THE Audit_Log_Tab SHALL provide date range inputs (start date and end date) to filter entries within a specific time period.
6. WHEN the admin applies filters, THE Audit_Log_Tab SHALL query the Audit_Log table with the selected action_type and date range constraints.
7. THE Audit_Log_Tab SHALL paginate results with a maximum of 25 entries per page.
8. WHILE audit log data is loading, THE Audit_Log_Tab SHALL display a loading spinner consistent with other admin tabs.
