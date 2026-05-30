# Email Queue System Setup

## Step 1: Create the EmailQueue Table

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Paste the SQL from `prisma/migrations/email_queue_setup.sql`
4. Click **Run**

This creates the `EmailQueue` table where announcements will be queued.

---

## Step 2: Set Up Cron Job to Process Queue

The `process-email-queue` function needs to run periodically to send queued emails.

### Option A: Using Supabase Cron (Easiest)

1. Go to Supabase Dashboard → **Functions**
2. Click on **process-email-queue**
3. Go to the **Overview** tab
4. Look for **Cron** section
5. Set up a cron job:
   - **Cron Expression**: `*/10 * * * *` (every 10 seconds)
   - **Timeout**: 60 seconds

This will process up to 5 emails every 10 seconds.

### Option B: Using External Service (Alternative)

If Supabase cron isn't available, you can call the function from:
- Vercel Cron Functions
- GitHub Actions
- AWS EventBridge
- Or any external cron service

Use this URL:
```
https://[your-project-id].supabase.co/functions/v1/process-email-queue
```

With POST body:
```json
{}
```

---

## How It Works

1. **User sends announcement** → Emails inserted into `EmailQueue` with status `pending`
2. **Cron job runs** → `process-email-queue` function processes up to 5 emails
3. **Email sent** → Status updated to `sent`
4. **If fails** → `retry_count` incremented, retried up to 3 times
5. **100ms delay** between emails → Avoids Gmail rate limits

---

## Testing

After setup, send an announcement and:
1. Check Supabase **Table Editor** → `EmailQueue` table
2. You should see pending emails
3. After 10 seconds, `process-email-queue` runs
4. Emails move from `pending` → `sent`
5. Check your inbox!

---

## Monitoring

View email queue status:
- **Pending**: Not yet sent
- **Sent**: Successfully delivered
- **Failed**: Error occurred after 3 retries

Check logs:
- Supabase Dashboard → **Functions** → **process-email-queue** → **Logs**
