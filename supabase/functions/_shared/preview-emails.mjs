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
const { generateEmailHTML } = await import('data:text/javascript,' + encodeURIComponent(code))

// Each entry mirrors the body/heading/signature used by its Edge Function.
const samples = [
  {
    id: 'registration-received-with-cor',
    label: 'Registration received (COR attached)',
    fn: 'register()',
    subject: 'Application Received – SBG PUP Biñan',
    opts: {
      recipientName: 'Juan dela Cruz',
      heading: 'Application received!',
      body: `Thank you for your application to the Student Builder Group (SBG)!\n\nWe have received your registration and are currently reviewing your application. You will be notified as soon as we complete our review process.\n\nIn the meantime, if you have any questions, feel free to reach out to us.`,
      signature: 'Best regards,\nThe Core Team\nAWS Student Builder Group – PUP Biñan',
    },
  },
  {
    id: 'registration-received-no-cor',
    label: 'Registration received (COR missing — reminder)',
    fn: 'register()',
    subject: 'Application Received – SBG PUP Biñan',
    opts: {
      recipientName: 'Juan dela Cruz',
      heading: 'Application received!',
      body: `Thank you for your application to the Student Builder Group (SBG)!\n\nWe have received your registration and are currently reviewing your application. You will be notified as soon as we complete our review process.\n\n<strong>Important: Submit your COR</strong>\n\nWe noticed you registered without uploading your Certificate of Registration (COR). Once you have your COR available, please submit it using the link below:\n\n<a href="${APP}/submit-cor" style="display:inline-block;padding:10px 20px;background:#2f6fd6;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;margin:12px 0;">Submit Your COR</a>\n\nYou will need your student number (<strong>2026-12345-BN-0</strong>) to submit.\n\nIn the meantime, if you have any questions, feel free to reach out to us.`,
      signature: 'Best regards,\nThe Core Team\nAWS Student Builder Group – PUP Biñan',
    },
  },
  {
    id: 'registration-confirmation',
    label: 'Registration confirmation',
    fn: 'registration-confirmation()',
    subject: 'Application received — AWS SBG PUP Biñan',
    opts: {
      recipientName: 'Andrea Reyes',
      heading: 'Application received!',
      body: `Thank you for applying to the <b>AWS Student Builder Group</b> at PUP Biñan!\n\nWe've received your registration and our team is currently reviewing your application. You'll receive another email once we're done.\n\nIf you haven't submitted your COR yet, you can upload it here: <a href="${APP}/submit-cor">${APP}/submit-cor</a>\n\nWhile you wait, join our community using the links below, or reach us anytime at <a href="mailto:sbg.pupbinan@gmail.com">sbg.pupbinan@gmail.com</a>. You'll be the first to know when events and onboarding go live.`,
      signature: 'See you in our next build,\nThe Core Team\nAWS Student Builder Group – PUP Biñan',
    },
  },
  {
    id: 'approved',
    label: 'Approved (with SBG ID)',
    fn: 'approve()',
    subject: "You're in! — AWS SBG PUP Biñan",
    opts: {
      recipientName: 'Maria Santos',
      heading: 'Welcome to the team!',
      body: `Congratulations! Your application to the <b>AWS Student Builder Group</b> has been <b>approved</b>!\n\nYour SBG ID: <b>SBG-PUPBC-2026-0042</b>\n\nYou are now an official member of AWS SBG – PUP Biñan. Visit the portal to view and download your digital membership ID, and join our community using the links below to get event updates.`,
      signature: 'Welcome aboard,\nThe Core Team\nAWS Student Builder Group – PUP Biñan',
    },
  },
  {
    id: 'approval-resend',
    label: 'Approval (resend — no ID)',
    fn: 'send-approval-email()',
    subject: 'Membership approved — AWS SBG PUP Biñan',
    opts: {
      recipientName: 'Miguel Torres',
      heading: 'Welcome to the team!',
      body: `Congratulations! Your application to the <b>AWS Student Builder Group</b> has been <b>approved</b>!\n\nYou are now an official member. You can view and download your digital membership ID here:\n<a href="${APP}/id-finder">${APP}/id-finder</a>\n\nJoin our community using the links below to stay connected with fellow builders and get event updates.`,
      signature: 'Welcome aboard,\nThe Core Team\nAWS Student Builder Group – PUP Biñan',
    },
  },
  {
    id: 'rejected',
    label: 'Application not approved',
    fn: 'reject()',
    subject: 'SBG Application Status Update',
    opts: {
      recipientName: 'Paolo Cruz',
      heading: 'Application update',
      body: `Thank you for your interest in joining the <b>AWS Student Builder Group</b> – PUP Biñan.\n\nAfter careful review, your application was not approved at this time. This isn't the end of the road — we run recruitment every term, and we'd genuinely love to see you apply again.\n\nIn the meantime, join our community using the links below to keep learning and building with us.`,
      signature: 'Keep building,\nThe Core Team\nAWS Student Builder Group – PUP Biñan',
    },
  },
  {
    id: 'announcement',
    label: 'Announcement (admin broadcast — no heading)',
    fn: 'send-announcement()',
    subject: 'New workshop: Serverless on AWS 🚀',
    opts: {
      recipientName: 'Bea Villanueva',
      body: `We're kicking off our next hands-on session and you're invited!\n\n<b>Serverless on AWS</b> — build and deploy a real Lambda + API Gateway app in one sitting.\n\n<b>When:</b> Saturday, 2:00 PM\n<b>Where:</b> Google Meet (link sent to registrants)\n\nReserve your slot through our Meetup page below. Bring a laptop and your curiosity!`,
      signature: 'See you there,\nThe Core Team\nAWS Student Builder Group – PUP Biñan',
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
