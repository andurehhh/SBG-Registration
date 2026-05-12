// frontend/src/lib/validations.ts
import { z } from "zod";

// Student number format: 20XX-XXXXX-BN-X
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

export type AwsInterest = (typeof AWS_INTERESTS)[number];

export const registrationStep1Schema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  student_number: z
    .string()
    .regex(studentNumberRegex, "Student number must be in format 20XX-XXXXX-BN-X"),
  course: z.string().min(1, "Course is required"),
  year_level: z
    .number({ invalid_type_error: "Year level is required" })
    .int()
    .min(1, "Year level must be at least 1")
    .max(6, "Year level must be at most 6"),
  section: z
    .string()
    .min(1, "Section is required")
    .max(20, "Section must be at most 20 characters"),
  email: z.string().email("Please enter a valid personal email address"),
  scholar_email: z.string().email("Please enter a valid scholar email address"),
  gender: z.enum(["Male", "Female", "NonBinary", "PreferNotToSay"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  skills: z
    .array(z.string())
    .min(1, "Please select at least one AWS interest"),
});

export const registrationStep2Schema = z.object({
  why_join: z
    .string()
    .min(25, "Please write at least 25 characters about why you want to join"),
  expectations: z
    .string()
    .min(25, "Please write at least 25 characters about your expectations"),
});

export const registrationStep3Schema = z.object({
  cor_file: z
    .instanceof(File, { message: "COR file is required" })
    .refine((f) => f.size <= 1_048_576, "COR file must be 1 MB or less")
    .refine(
      (f) => ["image/jpeg", "image/png", "application/pdf"].includes(f.type),
      "COR file must be JPEG, PNG, or PDF"
    ),
  proof_of_share_file: z
    .instanceof(File, { message: "Proof of Share file is required" })
    .refine((f) => f.size <= 1_048_576, "Proof of Share file must be 1 MB or less")
    .refine(
      (f) => ["image/jpeg", "image/png", "application/pdf"].includes(f.type),
      "Proof of Share file must be JPEG, PNG, or PDF"
    ),
});

export const loginSchema = z.object({
  secret: z.string().min(1, "Secret is required"),
});

export type RegistrationStep1Data = z.infer<typeof registrationStep1Schema>;
export type RegistrationStep2Data = z.infer<typeof registrationStep2Schema>;
export type RegistrationStep3Data = z.infer<typeof registrationStep3Schema>;
export type LoginData = z.infer<typeof loginSchema>;
