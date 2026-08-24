// frontend/src/types/index.ts

export type MemberStatus = "pending" | "approved" | "rejected" | "inactive" | "removed";
export type Gender = "Male" | "Female" | "NonBinary" | "PreferNotToSay";

export interface Member {
  id: string;
  student_number: string;
  full_name: string;
  email: string;
  scholar_email: string | null;
  year_level: number;
  section: string;
  course: string;
  gender: Gender | null;
  skills: string[];
  why_join: string | null;
  expectations: string | null;
  cor_url: string | null;
  proof_of_share_url: string | null;
  sticker_id: string | null;
  status: MemberStatus;
  sbg_id: string | null;
  school_year: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Subset of Member fields exposed by `member_public_view`.
 * Used by the IdFinderPage and IdCard components for anonymous access.
 * Excludes sensitive fields: email, scholar_email, gender, why_join,
 * expectations, cor_url, proof_of_share_url, updated_at.
 */
export type PublicMember = Pick<
  Member,
  | 'id'
  | 'student_number'
  | 'full_name'
  | 'sbg_id'
  | 'course'
  | 'year_level'
  | 'section'
  | 'school_year'
  | 'skills'
  | 'sticker_id'
  | 'status'
  | 'created_at'
>;

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  inactive: number;
  removed: number;
  byCourse: { course: string; count: number }[];
  byYearLevel: { year: number; count: number }[];
  byGender: { gender: string; count: number }[];
  bySkill: { skill: string; count: number }[];
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnnouncementRecipients {
  type: "all" | "group" | "individual" | "non-renewed";
  filters?: {
    course?: string;
    year_level?: number;
    status?: MemberStatus;
  };
  memberIds?: string[];
}

export interface AnnouncementPayload {
  subject: string;
  body: string;
  signature: string;
  headerImageUrl?: string;
  footerImageUrl?: string;
  recipients: AnnouncementRecipients;
}

export interface AppSettings {
  id: string;
  cor_required: boolean;
  updated_at: string;
}

export type AuditActionType =
  | 'approve'
  | 'reject'
  | 'bulk_approve'
  | 'bulk_reject'
  | 'announcement_sent'
  | 'registration_toggled'
  | 'term_reset';

export interface AuditLogEntry {
  id: string;
  action_type: AuditActionType;
  actor_email: string;
  actor_id: string;
  target_member_id: string | null;
  target_member_name: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface BulkOperationResult {
  total: number;
  succeeded: number;
  failed: number;
  errors: { memberId: string; memberName: string; error: string }[];
}
