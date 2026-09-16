// Renders sample previews of every email type using the REAL shared template
// (emailTemplate.ts), so the previews always match what recipients receive.
//
// Usage (from repo root):
//   node supabase/functions/_shared/preview-emails.mjs
//
// Output: docs/email-previews/*.html  (+ index.html). Open index.html in a browser.
//
// No network or Supabase needed — it stubs Deno.env and transpiles the .ts
// template with esbuild (already installed in frontend/node_modules).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { transformSync } from '../../../frontend/node_modules/esbuild/lib/main.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '../../..')
const OUT_DIR = resolve(REPO_ROOT, 'docs/email-previews')

// Preview-only value; the real logo URL comes from the APP_URL secret at runtime.
const APP = 'https://master.d2wu91yk4gkty0.amplifyapp.com'

// Stub Deno.env so the Deno template module runs under Node.
globalThis.Deno = { env: { get: (k) => ({ APP_URL: APP }[k]) } }

const templateTs = readFileSync(resolve(HERE, 'emailTemplate.ts'), 'utf8')
const { code } = transformSync(templateTs, { loader: 'ts', format: 'esm' })
const { generateEmailHTML, SOCIAL_LINKS } = await import('data:text/javascript,' + encodeURIComponent(code))

// Each entry mirrors the body/heading/signature used by its Edge Function.
const samples = [
  {
    id: 'registration-received-with-cor',
    label: 'Registration received (COR attached)',
    fn: 'register()',
    subject: 'Application Received – SBG PUP Biñan',
    opts: {
      recipientName: 'Juan dela Cruz',
      heading: 'Application Received',
      body: `Thank you for submitting your membership application to the <b>AWS Student Builder Group – PUP Biñan</b>.\n\nWe have received your application and attached copy of your Certificate of Registration (COR). Our team will review your application and contact you regarding the next steps.\n\nPlease make sure that the information you submitted is accurate and that your email remains accessible for future updates.\n\nThank you for your interest in joining our community.`,
      signature: 'Best regards,\nAWS Student Builder Group – PUP Biñan',
    },
  },
  {
    id: 'registration-received-no-cor',
    label: 'Registration received (COR missing — reminder)',
    fn: 'register()',
    subject: 'Application Received – SBG PUP Biñan',
    opts: {
      recipientName: 'Juan dela Cruz',
      heading: 'Application Received',
      body: `Thank you for submitting your membership application to the <b>AWS Student Builder Group – PUP Biñan</b>.\n\nWe received your application, but we noticed that your Certificate of Registration (COR) was not included.\n\nPlease reply to this email with a clear copy of your COR or upload it through the membership website:\n\n<a href="${APP}/submit-cor" style="display:inline-block;padding:10px 20px;background:#2f6fd6;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;margin:12px 0;">Upload COR</a>\n\nYou'll need your student number (<strong>2026-12345-BN-0</strong>) to submit. Your application may not be processed until the required document is submitted.\n\nThank you for your cooperation.`,
      signature: 'Best regards,\nAWS Student Builder Group – PUP Biñan',
    },
  },
  {
    id: 'registration-confirmation',
    label: 'Registration confirmation',
    fn: 'registration-confirmation()',
    subject: 'Application Received — AWS SBG PUP Biñan',
    opts: {
      recipientName: 'Andrea Reyes',
      heading: 'Application Received',
      body: `Your membership application to the <b>AWS Student Builder Group – PUP Biñan</b> has been successfully received.\n\nOur team will review the information and documents you submitted. You will receive another email once a decision has been made regarding your application.\n\nPlease keep your email accessible and check your inbox regularly for updates.\n\nThank you for your interest in becoming part of our community.`,
      signature: 'Best regards,\nAWS Student Builder Group – PUP Biñan',
    },
  },
  {
    id: 'approved',
    label: 'Approved (with SBG ID)',
    fn: 'approve()',
    subject: "You're In! Welcome to AWS SBG PUP Biñan",
    opts: {
      recipientName: 'Maria Santos',
      heading: "You're In! Welcome to AWS SBG PUP Biñan",
      body: `Congratulations! Your membership application has been approved, and you are now officially part of the <b>AWS Student Builder Group – PUP Biñan</b> community.\n\nYour official SBG Member ID is:\n<b>SBG-PUPBC-2026-0042</b>\n\nYou can view and download your digital membership ID here:\n<a href="${APP}/id-finder">${APP}/id-finder</a>\n\nAs the Lead and Founder, I'm excited to welcome you to a community where students learn, build, collaborate, and grow through cloud technology and hands-on experiences.\n\nHere at AWS, "It's Always Day One!" This reminds us to stay curious, keep learning, and approach every challenge with the excitement of a new beginning.\n\n<b>Stay connected through our official channels:</b>\n• Facebook Page: <a href="${SOCIAL_LINKS.facebook}">${SOCIAL_LINKS.facebook}</a>\n• Messenger Community: <a href="${SOCIAL_LINKS.messenger}">${SOCIAL_LINKS.messenger}</a>\n• Instagram: <a href="${SOCIAL_LINKS.instagram}">${SOCIAL_LINKS.instagram}</a>\n• Official Website: Coming soon — stay tuned!\n\nPlease join our <b>Messenger community first</b>, as it will be our primary channel for announcements, activities, and member coordination.\n\nWelcome to AWS SBG PUP Biñan. We're looking forward to learning and building with you!`,
      signature: "Best regards,\nJohn Lexter Reyes\nLead and Founder\nAWS Student Builder Group – PUP Biñan",
    },
  },
  {
    id: 'approval-resend',
    label: 'Approval (resend — no ID)',
    fn: 'send-approval-email()',
    subject: "You're In! Welcome to AWS SBG PUP Biñan",
    opts: {
      recipientName: 'Miguel Torres',
      heading: "You're In! Welcome to AWS SBG PUP Biñan",
      body: `Congratulations! Your membership application has been approved, and you are now officially part of the <b>AWS Student Builder Group – PUP Biñan</b> community.\n\nYou can view and download your official digital membership ID here:\n<a href="${APP}/id-finder">${APP}/id-finder</a>\n\nAs the Lead and Founder, I'm excited to welcome you to a community where students learn, build, collaborate, and grow through cloud technology and hands-on experiences.\n\nHere at AWS, "It's Always Day One!" This reminds us to stay curious, keep learning, and approach every challenge with the excitement of a new beginning.\n\n<b>Stay connected through our official channels:</b>\n• Facebook Page: <a href="${SOCIAL_LINKS.facebook}">${SOCIAL_LINKS.facebook}</a>\n• Messenger Community: <a href="${SOCIAL_LINKS.messenger}">${SOCIAL_LINKS.messenger}</a>\n• Instagram: <a href="${SOCIAL_LINKS.instagram}">${SOCIAL_LINKS.instagram}</a>\n• Official Website: Coming soon — stay tuned!\n\nPlease join our <b>Messenger community first</b>, as it will be our primary channel for announcements, activities, and member coordination.\n\nWelcome to AWS SBG PUP Biñan. We're looking forward to learning and building with you!`,
      signature: "Best regards,\nJohn Lexter Reyes\nLead and Founder\nAWS Student Builder Group – PUP Biñan",
    },
  },
  {
    id: 'rejected',
    label: 'Application not approved',
    fn: 'reject()',
    subject: 'SBG Application Status Update',
    opts: {
      recipientName: 'Paolo Cruz',
      heading: 'Application Status Update',
      body: `Thank you for your interest in joining the <b>AWS Student Builder Group – PUP Biñan</b> and for taking the time to submit your application.\n\nAfter reviewing your application, we regret to inform you that it was not approved for the current membership intake.\n\nThis decision does not define your potential as a student or builder. We encourage you to continue learning, developing your skills, and watching our official channels for future opportunities, events, and application periods.\n\n• Facebook Page: <a href="${SOCIAL_LINKS.facebook}">${SOCIAL_LINKS.facebook}</a>\n• Instagram: <a href="${SOCIAL_LINKS.instagram}">${SOCIAL_LINKS.instagram}</a>\n• Official Website: Coming soon — stay tuned!\n\nThank you again for your interest in AWS SBG PUP Biñan.`,
      signature: 'Best regards,\nAWS Student Builder Group – PUP Biñan',
    },
  },
  {
    id: 'announcement',
    label: 'Announcement (admin broadcast — no heading)',
    fn: 'send-announcement()',
    subject: 'New Workshop: Serverless on AWS 🚀',
    opts: {
      recipientName: 'Bea Villanueva',
      body: `We're excited to announce our upcoming workshop on <b>Serverless on AWS</b>.\n\nIn this session, you'll learn how serverless technologies can help you build and deploy applications without managing traditional servers. This workshop is designed to be practical, beginner-friendly, and focused on helping you understand how cloud services work together.\n\n<b>Event details:</b>\n• Date: [Event date]\n• Time: [Event time]\n• Location/Platform: [Venue or meeting link]\n• Registration link: [Registration link]\n\nWhether you are new to AWS or already exploring cloud development, this is a great opportunity to learn, ask questions, and build alongside fellow student developers.\n\nWe hope to see you there!`,
      signature: 'AWS Student Builder Group – PUP Biñan',
    },
  },
]

mkdirSync(OUT_DIR, { recursive: true })

for (const s of samples) {
  writeFileSync(resolve(OUT_DIR, `${s.id}.html`), generateEmailHTML(s.opts))
}

const rows = samples
  .map(
    (s) =>
      `<li><a href="./${s.id}.html">${s.label}</a> <span class="meta">— <code>${s.fn}</code> · subject: “${s.subject}”</span></li>`
  )
  .join('\n      ')

const index = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>AWS SBG — Email Previews</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;background:#eef3fb;margin:0;padding:40px;color:#0a1526;}
  .card{max-width:760px;margin:0 auto;background:#fff;border:1px solid #dbe4f3;border-radius:12px;padding:32px;}
  h1{color:#052575;margin:0 0 4px;}
  p.lead{color:#5f6d7e;margin:0 0 24px;}
  ul{line-height:2.1;font-size:16px;padding-left:20px;}
  a{color:#2f6fd6;font-weight:600;text-decoration:none;}
  a:hover{text-decoration:underline;}
  .meta{color:#5f6d7e;font-size:13px;font-weight:400;}
  code{background:#eef3fb;padding:1px 6px;border-radius:4px;font-size:12px;}
  .note{margin-top:24px;font-size:13px;color:#5f6d7e;border-top:1px solid #dbe4f3;padding-top:16px;}
</style></head>
<body>
  <div class="card">
    <h1>AWS SBG — Email Previews</h1>
    <p class="lead">Rendered from the live template (<code>emailTemplate.ts</code>) with sample data. Every email shares the branded header and the footer that links our Meetup, Facebook, and Instagram.</p>
    <ul>
      ${rows}
    </ul>
    <p class="note">Regenerate anytime: <code>node supabase/functions/_shared/preview-emails.mjs</code></p>
  </div>
</body></html>`

writeFileSync(resolve(OUT_DIR, 'index.html'), index)

console.log(`Rendered ${samples.length} previews + index.html into docs/email-previews/`)
