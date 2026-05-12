// backend/src/lib/validations.ts
import { z } from "zod";

const studentNumberRegex = /^\d{4}-\d{5}-BN-\d$/;

export const AWS_INTERESTS = [
  "Cloud Computing",
  "Machine Learning / AI",
  "Serverless",
  "Containers & Kubernetes",
  "DevOps & CI/CD",
  "Security",
  "Databases",
  "Networking",
  "IoT",
  "Web Development",
  "Mobile Development",
  "Data Analytics",
] as const;

export const registrationStep1Schema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  student_number: z
    .string()
    .regex(studentNumberRegex, "Student number must be in format 20XX-XXXXX-BN-X"),
  course: z.string().min(1, "Course is required"),
  year_level: z.coerce
    .number()
    .int()
    .min(1, "Year level must be at least 1")
    .max(6, "Year level must be at most 6"),
  section: z
    .string()
    .min(1, "Section is required")
    .max(20, "Section must be at most 20 characters"),
  email: z.string().email("Please enter a valid personal email address"),
  scholar_email: z.string().email("Please enter a valid scholar email address"),
  gender: z.enum(["Male", "Female", "NonBinary", "PreferNotToSay"]),
  skills: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .pipe(z.array(z.string()).min(1, "Please select at least one AWS interest")),
});

export const registrationStep2Schema = z.object({
  why_join: z
    .string()
    .min(25, "Please write at least 25 characters about why you want to join"),
  expectations: z
    .string()
    .min(25, "Please write at least 25 characters about your expectations"),
});

export const registrationBodySchema = registrationStep1Schema.merge(registrationStep2Schema);

export const loginSchema = z.object({
  secret: z.string().min(1, "Secret is required"),
});

export const announcementSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  signature: z.string().optional().default(""),
  recipients: z.object({
    type: z.enum(["all", "group", "individual"]),
    filters: z
      .object({
        course: z.string().optional(),
        year_level: z.coerce.number().int().optional(),
        status: z
          .enum(["pending", "approved", "rejected", "inactive", "removed"])
          .optional(),
      })
      .optional(),
    memberIds: z.array(z.string()).optional(),
  }),
});

export type RegistrationBodyData = z.infer<typeof registrationBodySchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type AnnouncementData = z.infer<typeof announcementSchema>;
