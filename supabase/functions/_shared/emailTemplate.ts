// Branded email template for the AWS Student Builder Group – PUP Biñan.
//
// Table-based, inline-styled HTML for maximum email-client compatibility
// (Gmail, Outlook, Apple Mail). Every email that goes through this template
// gets a branded header and a footer that ALWAYS links our Meetup, Facebook,
// and Instagram, so recipients can always find our community channels.

// ── Brand constants ─────────────────────────────────────────────────────────
// The frontend deployment hosts our image assets; APP_URL points at it.
const APP_URL = (Deno.env.get("APP_URL") || "https://sbg-registration.vercel.app").replace(/\/$/, "");

// Branded header banner (contains the group name + campus text baked in).
// Served from the frontend's public/ folder. Override with EMAIL_HEADER_URL.
const HEADER_IMAGE_URL = Deno.env.get("EMAIL_HEADER_URL") || `${APP_URL}/emailHeader.png`;

// Branded footer banner. Served from the frontend's public/ folder.
// Override with EMAIL_FOOTER_URL.
const FOOTER_IMAGE_URL = Deno.env.get("EMAIL_FOOTER_URL") || `${APP_URL}/emailFooter.png`;

// Official community channels — surfaced in every email footer.
export const SOCIAL_LINKS = {
  messenger: "https://m.me/ch/AbYQQFhNkbLp9Fg-/",
  facebook: "https://www.facebook.com/profile.php?id=61584279257151",
  instagram: "https://www.instagram.com/_awsccfrizz/",
  meetup:
    "https://www.meetup.com/aws-sbg-at-polytechnic-univ-of-the-philippines-binan-campus/?eventOrigin=home_groups_you_organize",
} as const;

const BRAND = {
  blue: "#2f6fd6",
  blueDark: "#052575",
  blueBright: "#4f8ff7",
  ink: "#0a1526",
  muted: "#5f6d7e",
  pageBg: "#eef3fb",
  cardBg: "#ffffff",
  footerBg: "#052575",
  footerText: "#c9d8f5",
  border: "#dbe4f3",
} as const;

interface EmailTemplateOptions {
  recipientName: string;
  /** Body content. May contain simple HTML (links, <b>) and newlines. */
  body: string;
  /** Optional closing/signature block. Newlines are preserved. */
  signature?: string;
  /** Optional H1 shown above the greeting (e.g. "Welcome aboard!"). */
  heading?: string;
}

/** Escape a value for safe use inside an HTML attribute. */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Convert bare newlines to <br> so plain-text bodies keep their line breaks. */
function nl2br(value: string): string {
  return value.replace(/\r?\n/g, "<br>");
}

export function generateEmailHTML(options: EmailTemplateOptions): string {
  const { recipientName, body, signature, heading } = options;

  const headingHtml = heading
    ? `<tr><td style="padding:0 0 12px 0;">
          <h1 style="margin:0;font-size:24px;line-height:1.25;color:${BRAND.blueDark};font-family:Arial,Helvetica,sans-serif;font-weight:800;">${nl2br(heading)}</h1>
        </td></tr>`
    : "";

  const signatureHtml = signature
    ? `<tr><td style="padding:20px 0 0 0;">
          <p style="margin:0;color:${BRAND.muted};font-size:14px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">${nl2br(signature)}</p>
        </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>AWS Student Builder Group – PUP Biñan</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.pageBg};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!-- Preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    A message from the AWS Student Builder Group – PUP Biñan.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.pageBg};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:${BRAND.cardBg};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">

          <!-- Header: branded banner image (group name + campus baked in) -->
          <tr>
            <td align="center" style="padding:0;background-color:${BRAND.footerBg};font-size:0;line-height:0;">
              <img src="${escapeAttr(HEADER_IMAGE_URL)}" alt="AWS Student Builder Group – Polytechnic University of the Philippines"
                   width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${headingHtml}
                <tr>
                  <td style="padding:0 0 14px 0;">
                    <p style="margin:0;color:${BRAND.ink};font-size:16px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
                      Hi <b>${escapeAttr(recipientName)}</b>,
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style="color:${BRAND.ink};font-size:15px;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">${nl2br(body)}</div>
                  </td>
                </tr>
                ${signatureHtml}
              </table>
            </td>
          </tr>

          <!-- Footer: branded footer banner (socials + info baked into the image) -->
          <tr>
            <td align="center" style="padding:0;background-color:${BRAND.footerBg};font-size:0;line-height:0;">
              <img src="${escapeAttr(FOOTER_IMAGE_URL)}" alt="AWS Student Builder Group – PUP Biñan · It's Always Day One"
                   width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
