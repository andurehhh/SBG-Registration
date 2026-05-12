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
  type: "all" | "group" | "individual";
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
  recipients: AnnouncementRecipients;
}
