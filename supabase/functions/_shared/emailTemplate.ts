// Branded email template for the AWS Student Builder Group – PUP Biñan.
//
// Table-based, inline-styled HTML for maximum email-client compatibility
// (Gmail, Outlook, Apple Mail). Every email that goes through this template
// gets a branded header and a footer that ALWAYS links our Meetup, Facebook,
// and Instagram, so recipients can always find our community channels.

// ── Brand constants ─────────────────────────────────────────────────────────
// The frontend deployment hosts our image assets; APP_URL points at it.
const APP_URL = (Deno.env.get("APP_URL") || "https://sbg-registration.app").replace(/\/$/, "");

// Full horizontal logo lockup (blue mark + wordmark on transparent bg).
// Override with EMAIL_LOGO_URL if the asset ever moves.
const LOGO_URL = Deno.env.get("EMAIL_LOGO_URL") || `${APP_URL}/blue-logo.png`;

// Official community channels — surfaced in every email footer.
export const SOCIAL_LINKS = {
  meetup:
    "https://www.meetup.com/aws-sbg-at-polytechnic-univ-of-the-philippines-binan-campus/?eventOrigin=home_groups_you_organize",
  facebook: "https://www.facebook.com/profile.php?id=61584279257151",
  instagram: "https://www.instagram.com/_awsccfrizz/",
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

const ADDRESS = "Barangay Zapote, Biñan, Laguna, Philippines";
const TAGLINE = "It's Always Day One!";

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

function socialCell(label: string, href: string): string {
  return `<td style="padding:0 10px;">
        <a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer"
           style="color:${BRAND.footerText};text-decoration:none;font-size:13px;font-weight:600;font-family:Arial,Helvetica,sans-serif;">${label}</a>
      </td>`;
}

export function generateEmailHTML(options: EmailTemplateOptions): string {
  const { recipientName, body, signature, heading } = options;
  const year = new Date().getFullYear();

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

          <!-- Header -->
          <tr>
            <td align="center" style="padding:28px 32px 20px 32px;background-color:${BRAND.cardBg};border-bottom:1px solid ${BRAND.border};">
              <img src="${escapeAttr(LOGO_URL)}" alt="AWS Student Builder Group – PUP Biñan"
                   width="300" style="display:block;width:300px;max-width:80%;height:auto;border:0;outline:none;text-decoration:none;">
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

          <!-- Community channels callout -->
          <tr>
            <td style="padding:0 32px 8px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.pageBg};border-radius:10px;">
                <tr>
                  <td align="center" style="padding:18px 16px;">
                    <p style="margin:0 0 12px 0;color:${BRAND.blueDark};font-size:13px;font-weight:700;letter-spacing:0.4px;font-family:Arial,Helvetica,sans-serif;text-transform:uppercase;">
                      Stay connected with the community
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="padding:0 8px;">
                          <a href="${escapeAttr(SOCIAL_LINKS.meetup)}" target="_blank" rel="noopener noreferrer"
                             style="display:inline-block;background-color:${BRAND.blueBright};color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;font-family:Arial,Helvetica,sans-serif;padding:9px 16px;border-radius:8px;">Meetup</a>
                        </td>
                        <td style="padding:0 8px;">
                          <a href="${escapeAttr(SOCIAL_LINKS.facebook)}" target="_blank" rel="noopener noreferrer"
                             style="display:inline-block;background-color:${BRAND.blue};color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;font-family:Arial,Helvetica,sans-serif;padding:9px 16px;border-radius:8px;">Facebook</a>
                        </td>
                        <td style="padding:0 8px;">
                          <a href="${escapeAttr(SOCIAL_LINKS.instagram)}" target="_blank" rel="noopener noreferrer"
                             style="display:inline-block;background-color:${BRAND.blueDark};color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;font-family:Arial,Helvetica,sans-serif;padding:9px 16px;border-radius:8px;">Instagram</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 28px 32px;background-color:${BRAND.footerBg};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:0 0 10px 0;">
                    <p style="margin:0;color:#ffffff;font-size:15px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">
                      AWS Student Builder Group – PUP Biñan
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 12px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        ${socialCell("Meetup", SOCIAL_LINKS.meetup)}
                        <td style="color:${BRAND.footerText};font-size:13px;">·</td>
                        ${socialCell("Facebook", SOCIAL_LINKS.facebook)}
                        <td style="color:${BRAND.footerText};font-size:13px;">·</td>
                        ${socialCell("Instagram", SOCIAL_LINKS.instagram)}
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 6px 0;">
                    <p style="margin:0;color:${BRAND.footerText};font-size:12px;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">
                      ${ADDRESS}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 4px 0;">
                    <p style="margin:0;color:#ffffff;font-size:12px;font-style:italic;font-family:Arial,Helvetica,sans-serif;">
                      &ldquo;${TAGLINE}&rdquo;
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;color:${BRAND.footerText};font-size:11px;font-family:Arial,Helvetica,sans-serif;">
                      &copy; ${year} AWS Student Builder Group – PUP Biñan Campus
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
