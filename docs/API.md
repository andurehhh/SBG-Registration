# API Reference

## Supabase Edge Functions

All Edge Functions are accessible at:

```
https://<project-ref>.supabase.co/functions/v1/<function-name>
```

Authentication is via `Authorization: Bearer <token>` header. Use the anon key for public endpoints or an authenticated JWT for admin operations.

---

### POST /register

Creates a new member registration or processes a renewal.

**Auth**: Anon key (public)

**Content-Type**: `multipart/form-data`

**Request Body (FormData)**:

| Field | Type | Required | Description |
|---|---|---|---|
| `student_number` | string | yes | PUP student number |
| `full_name` | string | yes | Full name |
| `email` | string | yes | Personal email |
| `scholar_email` | string | no | Institutional email |
| `year_level` | number | yes | Year level (1-4) |
| `section` | string | yes | Class section |
| `course` | string | no | Degree program |
| `gender` | string | no | `Male`, `Female`, `NonBinary`, `PreferNotToSay` |
| `skills` | string (JSON array) | yes | Self-reported skills |
| `why_join` | string | no | Motivation text |
| `expectations` | string | no | Expectations text |
| `cor_file` | File | yes | Certificate of Registration (image/PDF) |
| `proof_file` | File | yes | Proof of share screenshot |
| `renewal` | boolean | no | If `true`, updates existing inactive member |
| `member_id` | string | no | Required if `renewal=true` — existing member UUID |

**Response** (200):

```json
{
  "success": true,
  "data": {
    "memberId": "uuid",
    "message": "Registration submitted successfully"
  }
}
```

**Error Responses**:

| Status | Meaning |
|---|---|
| 400 | Validation error (missing fields, invalid format) |
| 409 | Duplicate student number (already registered) |
| 429 | Rate limited (too many submissions from same IP) |
| 500 | Server error (upload failure, DB error) |

---

### POST /approve

Approves a pending member, assigns an SBG ID, and queues an approval email.

**Auth**: Authenticated JWT (admin only)

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "memberId": "uuid"
}
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "sbgId": "SBG-PUPBC-2026-0042",
    "message": "Member approved"
  }
}
```

**Side Effects**:
- Generates SBG ID: `SBG-PUPBC-{YEAR}-{4-digit-sequence}`
- Updates member status to `approved`
- Inserts approval email into EmailQueue
- Inserts AuditLog entry

---

### POST /reject

Rejects a pending member application.

**Auth**: Authenticated JWT (admin only)

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "memberId": "uuid",
  "reason": "Optional rejection reason"
}
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "message": "Member rejected"
  }
}
```

**Side Effects**:
- Updates member status to `rejected`
- Optionally queues rejection notification email
- Inserts AuditLog entry

---

### POST /send-announcement

Queues announcement emails to a group of members.

**Auth**: Authenticated JWT (admin only)

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "subject": "Workshop This Saturday!",
  "body": "<p>HTML email body content</p>",
  "signature": "— SBG Core Team",
  "headerImageUrl": "https://example.com/banner.png",
  "footerImageUrl": "https://example.com/footer.png",
  "recipients": {
    "type": "all | group | individual",
    "filters": {
      "course": "BSIT",
      "year_level": 2,
      "status": "approved"
    },
    "memberIds": ["uuid1", "uuid2"]
  }
}
```

**Recipient Types**:

| Type | Behavior |
|---|---|
| `all` | All approved members |
| `group` | Members matching the `filters` criteria |
| `individual` | Specific members by `memberIds` |

**Response** (200):

```json
{
  "success": true,
  "data": {
    "queued": 47,
    "message": "47 emails queued for delivery"
  }
}
```

**Side Effects**:
- Inserts one EmailQueue row per recipient
- Inserts AuditLog entry with subject and recipient count

---

### POST /process-email-queue

Batch processes pending emails from the queue. Called by GitHub Actions cron.

**Auth**: Service role key (Bearer token)

**Request Body**: Empty `{}`

**Response** (200):

```json
{
  "success": true,
  "data": {
    "processed": 5,
    "sent": 4,
    "failed": 1
  }
}
```

**Behavior**:
1. Selects pending emails from EmailQueue (batch limit)
2. For each email, calls AWS Lambda email sender endpoint
3. On success: updates status to `sent`, sets `sent_at`
4. On failure: increments `retry_count`, sets `error_message`
5. Emails with `retry_count >= 3` are marked as permanently `failed`

---

### POST /term-reset

End-of-semester reset: marks all approved members as inactive and creates a new school year term.

**Auth**: Authenticated JWT (admin only)

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "school_year": "2026-2027",
  "semester": "1st"
}
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "deactivated": 128,
    "newTerm": "2026-2027 1st Semester",
    "message": "Term reset complete"
  }
}
```

**Side Effects**:
- Sets all `approved` members to `inactive`
- Deactivates the current SchoolYear record
- Creates and activates the new SchoolYear record
- Inserts AuditLog entry with count of affected members

---

## Frontend Direct Queries (Supabase Client)

The frontend uses the Supabase JS client for read operations that respect RLS.

### member_public_view (ID Finder)

**Access**: Anonymous (anon key)

```typescript
const { data } = await supabase
  .from('member_public_view')
  .select('*')
  .eq('student_number', studentNumber)
  .single();
```

**Returns**: `id`, `student_number`, `full_name`, `sbg_id`, `course`, `year_level`, `section`, `school_year`, `skills`, `sticker_id`, `status`, `created_at`

---

### member_renewal_view (Renewal Verification)

**Access**: Anonymous (anon key)

```typescript
const { data } = await supabase
  .from('member_renewal_view')
  .select('*')
  .eq('sbg_id', sbgId)
  .single();
```

**Returns**: `id`, `full_name`, `student_number`, `email`, `scholar_email`, `course`, `year_level`, `section`, `gender`, `skills`, `why_join`, `expectations`, `sbg_id`, `status`

**Note**: Only returns members with `status = 'inactive'` and a non-null `sbg_id`.

---

### Member Table (Admin Dashboard)

**Access**: Authenticated (JWT required)

```typescript
const { data, count } = await supabase
  .from('Member')
  .select('*', { count: 'exact' })
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

Supports filtering by `status`, `course`, `year_level`, `gender`, and text search on `full_name` / `student_number`.

---

### AppConfig (Registration Toggle)

**Access**: Anonymous for read, Authenticated for update

```typescript
// Read (public)
const { data } = await supabase
  .from('AppConfig')
  .select('value')
  .eq('key', 'registration_open')
  .single();

// Update (admin)
await supabase
  .from('AppConfig')
  .update({ value: false })
  .eq('key', 'registration_open');
```

---

### AuditLog (Admin Audit Tab)

**Access**: Authenticated only

```typescript
const { data } = await supabase
  .from('AuditLog')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50);
```

Supports filtering by `action_type` and date range.

---

### SchoolYear (Semester Management)

**Access**: Public read, Authenticated write

```typescript
// Get active term
const { data } = await supabase
  .from('SchoolYear')
  .select('*')
  .eq('is_active', true)
  .single();

// Get all terms
const { data } = await supabase
  .from('SchoolYear')
  .select('*')
  .order('created_at', { ascending: false });
```
