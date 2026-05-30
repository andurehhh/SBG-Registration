import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function handler(event: any) {
  try {
    const { to, subject, html, from } = JSON.parse(event.body) as EmailPayload;

    if (!to || !subject || !html || !from) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: to, subject, html, from',
        }),
      };
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: {
          messageId: info.messageId,
        },
      }),
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      }),
    };
  }
}
