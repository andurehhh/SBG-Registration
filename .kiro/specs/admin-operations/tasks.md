# Implementation Plan: Admin Operations

## Overview

Implements three admin capabilities — bulk approve/reject, CSV export, and audit log — in dependency order: types & data layer first, then pure utilities, then hooks, then UI components, then wiring into existing pages.

## Tasks

- [x] 1. Types and data layer
  - [x] 1.1 Add audit log types to `frontend/src/types/index.ts`
    - Add `AuditActionType` union type
    - Add `AuditLogEntry` interface
    - Add `BulkOperationResult` interface
    - _Requirements: 5.1, 5.2_

  - [x] 1.2 Create SQL migration `database/003_audit_log.sql`
    - Create `AuditLog` table with all columns (id, action_type, actor_email, actor_id, target_member_id, target_member_name, details, created_at)
    - Add indexes on action_type, created_at DESC, actor_id
    - Enable RLS with INSERT and SELECT policies for authenticated role
    - _Requirements: 5.1, 5.2_

- [x] 2. Pure utilities
  - [x] 2.1 Create CSV exporter module `frontend/src/lib/csvExporter.ts`
    - Implement `escapeCsvField(value: string): string` — RFC 4180 escaping (wrap in quotes if field contains comma, double-quote, or newline; double any internal quotes)
    - Implement `generateCsv(members: Member[]): string` — produce header row + data rows with exactly 10 columns: full_name, student_number, email, course, year_level, section, status, sbg_id, school_year, created_at
    - Implement `triggerDownload(csvContent: string, filename: string): void` — create Blob, generate object URL, programmatic anchor click, revoke URL
    - _Requirements: 4.3, 4.4, 4.5, 4.6_

  - [ ]* 2.2 Write property tests for CSV exporter
    - **Property 6: CSV column format and header correctness**
    - **Property 7: CSV field escaping round-trip (RFC 4180)**
    - **Validates: Requirements 4.3, 4.4, 4.5**
    - Create test file `frontend/src/lib/__tests__/csvExporter.property.test.ts`
    - Use fast-check with minimum 100 iterations
    - Tag: `Feature: admin-operations, Property 6` and `Property 7`

  - [x] 2.3 Create audit log helper `frontend/src/lib/auditLog.ts`
    - Implement `insertAuditLog(entry: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<void>` — insert via Supabase client, swallow errors (console.error only, never block the primary action)
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ]* 2.4 Write property tests for audit log entry correctness
    - **Property 8: Audit log entry correctness**
    - **Validates: Requirements 5.3, 5.4, 5.5, 5.6, 5.7**
    - Create test file `frontend/src/lib/__tests__/auditLog.property.test.ts`
    - Use fast-check to generate random action types and parameters, verify the constructed entry shape matches the expected structure
    - Tag: `Feature: admin-operations, Property 8`

- [x] 3. Checkpoint
  - Ensure all tests pass (`npm run test`), ask the user if questions arise.

- [x] 4. Hooks and state logic
  - [x] 4.1 Create `useBulkAction` hook `frontend/src/lib/useBulkAction.ts`
    - Accept `action` (approve | reject), `memberIds`, `memberNames` map, `onComplete` callback
    - Use `Promise.allSettled` to call existing `edgeFn.post` for each member ID
    - Track progress (completed/total), aggregate results into `BulkOperationResult`
    - Insert audit log entry (bulk_approve or bulk_reject) on completion
    - Return `{ execute, isRunning, progress }`
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 4.2 Write property tests for bulk operation logic
    - **Property 4: Bulk operation invokes Edge Function for each selected member**
    - **Property 5: Bulk operation result toast reports correct counts**
    - **Validates: Requirements 2.3, 2.5, 2.6, 3.3, 3.5, 3.6**
    - Create test file `frontend/src/lib/__tests__/useBulkAction.property.test.ts`
    - Mock `edgeFn.post` to randomly succeed/fail, verify call count equals selection size and reported S + F = N
    - Tag: `Feature: admin-operations, Property 4` and `Property 5`

- [x] 5. UI components — selection and toolbar
  - [x] 5.1 Create `ConfirmationModal` component `frontend/src/components/ui/ConfirmationModal.tsx`
    - Accept props: `isOpen`, `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `variant` (danger | default)
    - Render overlay backdrop + centered card with message, Cancel + Confirm buttons
    - Use existing Card/Button primitives, follow dark UI design system
    - _Requirements: 2.2, 2.8, 3.2_

  - [x] 5.2 Create `BulkActionToolbar` component `frontend/src/components/admin/BulkActionToolbar.tsx`
    - Accept props: `selectedCount`, `onApprove`, `onReject`, `disabled`
    - Render selected count label, "Approve Selected" button, "Reject Selected" button
    - Hidden when `selectedCount === 0`
    - Buttons disabled when `disabled` is true (during operation)
    - _Requirements: 1.6, 1.7, 2.1, 3.1, 3.8_

  - [ ]* 5.3 Write property tests for selection/toolbar display logic
    - **Property 1: Selection state consistency**
    - **Property 2: Toolbar count matches selection size**
    - **Property 3: Confirmation modal displays correct count**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6, 1.7, 2.2, 3.2**
    - Create test file `frontend/src/components/admin/__tests__/BulkSelection.property.test.ts`
    - Use fast-check to generate random member ID sets, toggle sequences, verify invariants
    - Tag: `Feature: admin-operations, Property 1`, `Property 2`, `Property 3`

- [x] 6. UI components — audit log display
  - [x] 6.1 Create `AuditLogEntry` component `frontend/src/components/admin/AuditLogEntry.tsx`
    - Render action_type as a colored badge, actor_email, target_member_name (when present), formatted relative timestamp, details summary
    - Use Lucide icons for action type indicators
    - _Requirements: 6.3_

  - [x] 6.2 Create `AuditLogTab` component `frontend/src/components/admin/tabs/AuditLogTab.tsx`
    - Query `AuditLog` table from Supabase ordered by `created_at DESC`
    - Render list of `AuditLogEntry` components
    - Include filter dropdown for action_type and date range inputs (start/end)
    - Paginate with 25 entries per page, include prev/next controls
    - Show loading spinner during fetch, error state with retry
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ]* 6.3 Write property tests for audit log display
    - **Property 9: Audit log display order**
    - **Property 10: Audit log entry renders all required fields**
    - **Validates: Requirements 6.2, 6.3**
    - Create test file `frontend/src/components/admin/__tests__/AuditLog.property.test.ts`
    - Generate random audit entries, verify rendered order is descending by created_at and all required fields present
    - Tag: `Feature: admin-operations, Property 9`, `Property 10`

- [x] 7. Checkpoint
  - Ensure all tests pass (`npm run test`), ask the user if questions arise.

- [x] 8. Integration — wire into existing pages
  - [x] 8.1 Modify `PendingApplicantList.tsx` to add selection checkboxes
    - Add checkbox column to table header and each row
    - Add header checkbox for select-all/deselect-all on current page
    - Expose selection state via callback prop `onSelectionChange(selectedIds: string[])`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 8.2 Modify `DashboardTab.tsx` to integrate bulk actions
    - Manage `selectedIds` state from `PendingApplicantList` callback
    - Render `BulkActionToolbar` passing selection count and handlers
    - On approve/reject click: show `ConfirmationModal` with correct message
    - On confirm: call `useBulkAction.execute()`, show progress, display toast on completion
    - Insert audit log entries for single approve/reject actions (existing buttons)
    - Clear selection and refresh data on operation complete
    - _Requirements: 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 8.3 Modify `MembersTab.tsx` to add CSV export button
    - Add "Export CSV" button in header area next to existing Refresh button
    - On click: fetch all members matching active filters (bypass pagination), call `generateCsv`, call `triggerDownload` with filename `sbg-members-{YYYY-MM-DD}.csv`
    - Show loading state on button during export, disable to prevent duplicates
    - If no members match filters, show info toast "No members to export" and skip file generation
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7, 4.8, 4.9_

  - [x] 8.4 Modify `AdminSidebar.tsx` to add Audit Log navigation item
    - Add "Audit Log" nav item with `ClipboardList` Lucide icon
    - Link to `/admin/audit-log` route
    - _Requirements: 6.1_

  - [x] 8.5 Add audit log route in `App.tsx`
    - Add route `/admin/audit-log` rendering `AuditLogTab` within the admin layout
    - _Requirements: 6.1_

- [x] 9. Audit log inserts for existing admin actions
  - [x] 9.1 Add audit log insert to announcement sending flow
    - After successful announcement send, insert audit log entry with action_type "announcement_sent", subject, and recipient_count in details
    - _Requirements: 5.7_

  - [x] 9.2 Add audit log insert to registration toggle flow
    - After toggling registration window, insert audit log entry with action_type "registration_toggled" and new_state in details
    - _Requirements: 5.8_

  - [x] 9.3 Add audit log insert to term reset flow
    - After term reset, insert audit log entry with action_type "term_reset"
    - _Requirements: 5.9_

- [x] 10. Final checkpoint
  - Ensure all tests pass (`npm run test`), ask the user if questions arise.
  - Verify build succeeds (`npm run build`)

## Task Dependency Graph

```json
{
  "waves": [
    {
      "name": "Wave 1: Types & Data Layer",
      "tasks": ["1.1", "1.2"]
    },
    {
      "name": "Wave 2: Pure Utilities",
      "tasks": ["2.1", "2.2", "2.3", "2.4"],
      "dependsOn": ["1.1", "1.2"]
    },
    {
      "name": "Wave 3: Checkpoint — Utilities",
      "tasks": ["3"],
      "dependsOn": ["2.1", "2.3"]
    },
    {
      "name": "Wave 4: Hooks & UI Components",
      "tasks": ["4.1", "4.2", "5.1", "5.2", "5.3", "6.1"],
      "dependsOn": ["3"]
    },
    {
      "name": "Wave 5: Audit Log Tab & Remaining UI",
      "tasks": ["6.2", "6.3"],
      "dependsOn": ["6.1"]
    },
    {
      "name": "Wave 6: Checkpoint — Components",
      "tasks": ["7"],
      "dependsOn": ["4.1", "5.1", "5.2", "6.2"]
    },
    {
      "name": "Wave 7: Integration Wiring",
      "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5"],
      "dependsOn": ["7"]
    },
    {
      "name": "Wave 8: Audit Log Inserts for Existing Actions",
      "tasks": ["9.1", "9.2", "9.3"],
      "dependsOn": ["7"]
    },
    {
      "name": "Wave 9: Final Checkpoint",
      "tasks": ["10"],
      "dependsOn": ["8.1", "8.2", "8.3", "8.4", "8.5", "9.1", "9.2", "9.3"]
    }
  ]
}
```

## Notes

- Tasks marked with `*` are optional property-based test tasks and can be skipped for faster MVP
- Each task references specific acceptance criteria from the requirements document
- The dependency chain is: types → utilities → hooks → UI components → wiring
- Checkpoints at tasks 3 and 7 ensure incremental validation before integration
- Property tests use `fast-check` (already installed) with minimum 100 iterations each
- All UI follows the dark-first SBG design system (sbg-navy cards, purple accents, Space Mono headings)
