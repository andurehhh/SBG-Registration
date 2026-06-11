# Requirements Document

## Introduction

This specification covers three feature additions to the SBG Registration Portal: tightened Row-Level Security (RLS) policies on the Member table, a reusable toast/notification system for the admin dashboard, and a dark/light mode toggle with ThemeProvider. Together these features improve data security, admin UX feedback, and visual customization.

## Glossary

- **Portal**: The SBG Registration Portal frontend (React + Vite SPA)
- **Member_Table**: The PostgreSQL "Member" table in Supabase storing all registration data
- **RLS**: Row-Level Security — PostgreSQL feature that restricts which rows a given role can access
- **Anon_Role**: The anonymous/public Supabase role used by unauthenticated frontend requests
- **Authenticated_Role**: The Supabase role assigned to sessions authenticated via Supabase Auth (admin users)
- **Service_Role**: The elevated Supabase role used by Edge Functions that bypasses RLS entirely
- **Toast_System**: A lightweight notification component that displays transient messages to the user
- **Toast_Store**: A Zustand store managing the queue of active toast notifications
- **ThemeProvider**: A React context provider that manages and persists the current color mode (dark or light)
- **Theme_Toggle**: A UI component (sun/moon icon button) that switches between dark and light mode
- **CSS_Variables**: Custom CSS properties defined on `:root` / `.light` that control color tokens for both modes
- **ID_Lookup_Fields**: The subset of Member columns safe for public display: full_name, sbg_id, course, year_level, section, school_year, skills, sticker_id, status, created_at
- **Admin_Actions**: Operations in the admin dashboard: approve, reject, send announcement, toggle registration, term reset

## Requirements

### Requirement 1: Public Read Access Restriction

**User Story:** As a portal visitor, I want to look up approved members by student number or browse approved member data, so that I can find my ID card information without exposing sensitive member data.

#### Acceptance Criteria

1. WHEN an anonymous user queries the Member_Table, THE RLS_Policy SHALL restrict returned columns to only ID_Lookup_Fields
2. WHEN an anonymous user queries the Member_Table, THE RLS_Policy SHALL return rows only WHERE status equals 'approved'
3. WHEN an anonymous user queries by student_number, THE RLS_Policy SHALL allow the query to match against student_number but still restrict returned columns to ID_Lookup_Fields and only return approved records
4. IF an anonymous user attempts to read sensitive fields (email, scholar_email, cor_url, proof_of_share_url), THEN THE RLS_Policy SHALL exclude those fields from the query result

### Requirement 2: Admin Full Read Access

**User Story:** As an admin, I want full unrestricted read access to all member data when authenticated, so that I can review applications and manage members effectively.

#### Acceptance Criteria

1. WHILE an authenticated session is active, THE RLS_Policy SHALL allow SELECT on all columns of the Member_Table without row-level restrictions
2. WHILE an authenticated session is active, THE RLS_Policy SHALL return members of any status (pending, approved, rejected, inactive, removed)

### Requirement 3: Write Access Control

**User Story:** As a system architect, I want write operations on the Member_Table restricted to authorized actors only, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN an anonymous user attempts an INSERT on the Member_Table, THE RLS_Policy SHALL permit the insert (registration flow)
2. WHEN an anonymous user attempts an UPDATE on the Member_Table, THE RLS_Policy SHALL deny the operation
3. WHEN an anonymous user attempts a DELETE on the Member_Table, THE RLS_Policy SHALL deny the operation
4. WHILE the Service_Role is used by Edge Functions, THE RLS_Policy SHALL be bypassed entirely for all operations

### Requirement 4: Toast Notification Display

**User Story:** As an admin, I want to see success/error/warning/info notifications after performing actions, so that I receive immediate feedback on operation outcomes.

#### Acceptance Criteria

1. WHEN a toast is triggered, THE Toast_System SHALL display a notification with the appropriate variant styling (success, error, warning, info)
2. WHEN a toast is displayed, THE Toast_System SHALL auto-dismiss the toast after a configurable timeout defaulting to 5000 milliseconds
3. WHEN the dismiss button is clicked, THE Toast_System SHALL immediately remove that toast from the display
4. WHEN multiple toasts are active, THE Toast_System SHALL stack them vertically with a maximum of 5 visible toasts
5. IF more than 5 toasts are queued, THEN THE Toast_System SHALL display only the 5 most recent and discard the oldest

### Requirement 5: Toast Accessibility and Styling

**User Story:** As an admin using assistive technology, I want toast notifications to be announced by screen readers, so that I receive the same feedback as sighted users.

#### Acceptance Criteria

1. THE Toast_System SHALL render toasts inside an ARIA live region with role="status" and aria-live="polite"
2. WHEN a toast of variant error is displayed, THE Toast_System SHALL use aria-live="assertive" for that toast
3. THE Toast_System SHALL use sbg-navy background color for toast containers, sbg-purple accent for success variant, and red-600 for error variant
4. THE Toast_System SHALL render a visible dismiss button with accessible label "Dismiss notification"

### Requirement 6: Toast Integration with Admin Actions

**User Story:** As an admin, I want automatic toast notifications after I approve, reject, send announcements, toggle registration, or perform term resets, so that I always know the result of my actions.

#### Acceptance Criteria

1. WHEN an admin action (approve, reject, send announcement, toggle registration, term reset) succeeds, THE Portal SHALL display a success toast with a descriptive message
2. WHEN an admin action fails, THE Portal SHALL display an error toast containing the error description
3. WHEN an admin action is in a warning state (e.g., partial success), THE Portal SHALL display a warning toast

### Requirement 7: Theme Provider and Persistence

**User Story:** As a user, I want my theme preference (dark or light) to persist across sessions, so that I do not have to re-select my preferred mode each time I visit.

#### Acceptance Criteria

1. THE ThemeProvider SHALL store the current theme value in localStorage under the key "sbg-theme"
2. WHEN the Portal loads and no localStorage value exists, THE ThemeProvider SHALL check the system preference via prefers-color-scheme media query
3. WHEN the Portal loads and no localStorage value exists and no system preference is detected, THE ThemeProvider SHALL default to dark mode
4. WHEN the theme changes, THE ThemeProvider SHALL add or remove the "light" class on the document root element

### Requirement 8: Theme Toggle Component

**User Story:** As a user, I want a clearly visible toggle button to switch between dark and light modes, so that I can choose the visual style I prefer.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL render a sun icon in dark mode and a moon icon in light mode
2. WHEN the Theme_Toggle is clicked, THE ThemeProvider SHALL switch from the current mode to the opposite mode
3. THE Theme_Toggle SHALL be placed in the landing page navbar and the admin sidebar
4. THE Theme_Toggle SHALL include an accessible label "Switch to light mode" or "Switch to dark mode" based on current state

### Requirement 9: CSS Variable Theme Switching

**User Story:** As a developer, I want all UI surfaces and text colors to switch automatically via CSS variables, so that adding light mode does not require per-component overrides.

#### Acceptance Criteria

1. WHEN the "light" class is present on the document root, THE CSS_Variables SHALL switch to light mode values (--color-bg: #f8f9fc, --color-surface: #ffffff, --color-surface-raised: #f0f2f8, --color-border: rgba(0,0,0,0.08), --color-text-primary: #0f1117, --color-text-secondary: #4b5563)
2. WHEN the "light" class is present, THE grid pattern SHALL use dark stroke lines instead of white (--grid-stroke variable)
3. WHEN the theme transitions between modes, THE Portal SHALL apply a 150ms CSS transition on background-color and color properties
4. THE CSS_Variables SHALL define a --grid-stroke variable that is "white" in dark mode and "#1a1f2e" in light mode
