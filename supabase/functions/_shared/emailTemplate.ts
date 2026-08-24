// Email Template — plain and simple, no fancy CSS

interface EmailTemplateOptions {
  recipientName: string;
  body: string;
  signature?: string;
}

export function generateEmailHTML(options: EmailTemplateOptions): string {
  const { recipientName, body, signature } = options;

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #222;">
  <p>Hi <b>${recipientName}</b>,</p>
  <div style="white-space: pre-wrap;">${body}</div>
  ${signature ? `<br><p style="color: #555; font-size: 13px;">${signature}</p>` : ""}
  <br>
  <p style="color: #555; font-size: 12px; font-style: italic;">"It's Always Day One!"</p>
</body>
</html>`;
}
