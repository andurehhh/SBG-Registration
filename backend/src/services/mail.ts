// backend/src/services/mail.ts
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

interface WelcomeEmailParams {
  toEmail: string;
  fullName: string;
  sbgId: string;
  studentNumber: string;
}

interface RejectionEmailParams {
  toEmail: string;
  fullName: string;
}

interface AnnouncementEmailParams {
  toEmail: string;
  fullName: string;
  subject: string;
  body: string;
  signature: string;
}

class MailService {
  private client: MailerSend;
  private from: Sender;

  constructor() {
    this.client = new MailerSend({
      apiKey: process.env.MAILSEND_API_KEY ?? "",
    });
    this.from = new Sender(
      process.env.MAILSEND_FROM_EMAIL ?? "noreply@sbg.example.com",
      process.env.MAILSEND_FROM_NAME ?? "SBG Portal"
    );
  }

  async sendWelcome(params: WelcomeEmailParams): Promise<void> {
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const idFinderUrl = `${appUrl}/id-finder`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="background:#0f1117;color:#E2E8F0;font-family:Inter,sans-serif;padding:32px;">
          <div style="max-width:600px;margin:0 auto;background:#1a1f2e;border-radius:8px;padding:32px;border:1px solid rgba(255,255,255,0.08);">
            <h1 style="font-family:'Space Mono',monospace;color:#ffffff;margin-bottom:8px;">Welcome to SBG! 🎉</h1>
            <p style="color:#94A3B8;margin-bottom:24px;">AWS Student Builder Group — PUP Biñan Campus</p>
            <p>Hi <strong>${params.fullName}</strong>,</p>
            <p>Congratulations! Your application to the AWS Student Builder Group has been <strong style="color:#7C3AED;">approved</strong>.</p>
            <div style="background:#252b3b;border-radius:8px;padding:16px;margin:24px 0;">
              <p style="margin:0;font-family:'Space Mono',monospace;font-size:12px;color:#94A3B8;">YOUR SBG ID</p>
              <p style="margin:8px 0 0;font-family:'Space Mono',monospace;font-size:20px;color:#7C3AED;font-weight:bold;">${params.sbgId}</p>
            </div>
            <p>You can view and download your digital membership ID card at:</p>
            <a href="${idFinderUrl}" style="display:inline-block;background:#7C3AED;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View My ID Card</a>
            <p style="margin-top:24px;color:#94A3B8;font-size:14px;">Enter your student number <strong>${params.studentNumber}</strong> on the ID Finder page.</p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;">
            <p style="color:#94A3B8;font-size:12px;">AWS Student Builder Group — PUP Biñan Campus</p>
          </div>
        </body>
      </html>
    `;

    const emailParams = new EmailParams()
      .setFrom(this.from)
      .setTo([new Recipient(params.toEmail, params.fullName)])
      .setSubject("Welcome to SBG — Your Application Has Been Approved!")
      .setHtml(html)
      .setText(
        `Welcome to SBG, ${params.fullName}! Your SBG ID is: ${params.sbgId}. View your ID card at: ${idFinderUrl}`
      );

    try {
      await this.client.email.send(emailParams);
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "mail_send_failed",
          type: "welcome",
          recipient: params.toEmail,
          error: String(error),
        })
      );
      throw error;
    }
  }

  async sendRejection(params: RejectionEmailParams): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="background:#0f1117;color:#E2E8F0;font-family:Inter,sans-serif;padding:32px;">
          <div style="max-width:600px;margin:0 auto;background:#1a1f2e;border-radius:8px;padding:32px;border:1px solid rgba(255,255,255,0.08);">
            <h1 style="font-family:'Space Mono',monospace;color:#ffffff;">Application Update</h1>
            <p style="color:#94A3B8;">AWS Student Builder Group — PUP Biñan Campus</p>
            <p>Hi <strong>${params.fullName}</strong>,</p>
            <p>Thank you for your interest in joining the AWS Student Builder Group. After careful review, we regret to inform you that your application was not approved at this time.</p>
            <p>We encourage you to apply again in the future. Keep building!</p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;">
            <p style="color:#94A3B8;font-size:12px;">AWS Student Builder Group — PUP Biñan Campus</p>
          </div>
        </body>
      </html>
    `;

    const emailParams = new EmailParams()
      .setFrom(this.from)
      .setTo([new Recipient(params.toEmail, params.fullName)])
      .setSubject("SBG Application Status Update")
      .setHtml(html)
      .setText(
        `Hi ${params.fullName}, thank you for applying to SBG. Unfortunately, your application was not approved at this time. We encourage you to apply again in the future.`
      );

    try {
      await this.client.email.send(emailParams);
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "mail_send_failed",
          type: "rejection",
          recipient: params.toEmail,
          error: String(error),
        })
      );
      throw error;
    }
  }

  async sendAnnouncement(params: AnnouncementEmailParams): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="background:#0f1117;color:#E2E8F0;font-family:Inter,sans-serif;padding:32px;">
          <div style="max-width:600px;margin:0 auto;background:#1a1f2e;border-radius:8px;padding:32px;border:1px solid rgba(255,255,255,0.08);">
            <p style="color:#94A3B8;font-size:12px;margin-bottom:24px;">AWS Student Builder Group — PUP Biñan Campus</p>
            <p>Hi <strong>${params.fullName}</strong>,</p>
            <div style="white-space:pre-wrap;">${params.body}</div>
            ${
              params.signature
                ? `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;"><p>${params.signature}</p>`
                : ""
            }
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;">
            <p style="color:#94A3B8;font-size:12px;">AWS Student Builder Group — PUP Biñan Campus</p>
          </div>
        </body>
      </html>
    `;

    const emailParams = new EmailParams()
      .setFrom(this.from)
      .setTo([new Recipient(params.toEmail, params.fullName)])
      .setSubject(params.subject)
      .setHtml(html)
      .setText(`${params.body}\n\n${params.signature}`);

    try {
      await this.client.email.send(emailParams);
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "mail_send_failed",
          type: "announcement",
          recipient: params.toEmail,
          error: String(error),
        })
      );
      throw error;
    }
  }
}

export const mailService = new MailService();
export type { WelcomeEmailParams, RejectionEmailParams, AnnouncementEmailParams };
