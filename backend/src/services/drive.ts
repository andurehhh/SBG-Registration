// backend/src/services/drive.ts
// Using Cloudinary for file storage instead of Google Drive
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

export interface DriveUploadParams {
  fileBuffer: Buffer;
  mimeType: string;
  studentNumber: string;
  documentType: "cor" | "proof_of_share";
}

export interface DriveUploadResult {
  fileId: string;
  shareableUrl: string;
}

export class DriveService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(params: DriveUploadParams): Promise<DriveUploadResult> {
    const timestamp = Date.now();
    // Sanitize student number for use as a public_id (replace special chars)
    const safeStudentNumber = params.studentNumber.replace(/[^a-zA-Z0-9]/g, "_");
    const publicId = `sbg_uploads/${safeStudentNumber}_${params.documentType}_${timestamp}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: "auto", // handles images and PDFs
          access_mode: "public",
          folder: "sbg_uploads",
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }
          resolve({
            fileId: result.public_id,
            shareableUrl: result.secure_url,
          });
        }
      );

      // Pipe the buffer into the upload stream
      Readable.from(params.fileBuffer).pipe(uploadStream);
    });
  }
}

export const driveService = new DriveService();
