// Email Template with Header and Footer
// Update the image URLs below to use your actual Cloudinary images

const HEADER_IMAGE_URL = "https://res.cloudinary.com/dkue2jyea/image/upload/v1234567890/sbg_header.png";
const FOOTER_IMAGE_URL = "https://res.cloudinary.com/dkue2jyea/image/upload/v1234567890/sbg_footer.png";

interface EmailTemplateOptions {
  recipientName: string;
  body: string;
  signature?: string;
}

export function generateEmailHTML(options: EmailTemplateOptions): string {
  const { recipientName, body, signature } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #0f1117;
      color: #E2E8F0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #1a1f2e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      width: 100%;
      display: block;
      max-width: 600px;
      height: auto;
    }
    .content {
      padding: 32px;
    }
    .footer {
      width: 100%;
      display: block;
      max-width: 600px;
      height: auto;
      margin-top: 20px;
    }
    p {
      margin: 0 0 16px 0;
      line-height: 1.6;
    }
    .body-text {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    hr {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      margin: 24px 0;
    }
    .signature {
      font-size: 14px;
      color: #a0aec0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER IMAGE -->
    <img src="${HEADER_IMAGE_URL}" alt="SBG Header" class="header">
    
    <!-- CONTENT -->
    <div class="content">
      <p>Hi <strong>${recipientName}</strong>,</p>
      <div class="body-text">${body}</div>
      ${signature ? `<hr><p class="signature">${signature}</p>` : ""}
    </div>
    
    <!-- FOOTER IMAGE -->
    <img src="${FOOTER_IMAGE_URL}" alt="SBG Footer" class="footer">
  </div>
</body>
</html>`;
}

export function updateHeaderImage(newUrl: string): void {
  // This is a placeholder - in production, store image URLs in Supabase config
  console.log(`Header image URL updated to: ${newUrl}`);
}

export function updateFooterImage(newUrl: string): void {
  // This is a placeholder - in production, store image URLs in Supabase config
  console.log(`Footer image URL updated to: ${newUrl}`);
}
