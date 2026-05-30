# Lambda Email Sender Deployment Guide

This Lambda function sends emails via Gmail using nodemailer.

## Prerequisites

- AWS Account
- AWS CLI configured
- Node.js 18+
- npm

## Step 1: Build the Lambda Function

```bash
cd lambda/email-sender
npm install
npm run build
npm run package
```

This creates `function.zip` with compiled TypeScript and node_modules.

## Step 2: Create IAM Role

1. Go to AWS IAM Console
2. Create a new role: `sbg-lambda-email-role`
3. Add policy: `AWSLambdaBasicExecutionRole` (for CloudWatch logs)
4. Copy the ARN

## Step 3: Deploy to Lambda

```bash
aws lambda create-function \
  --function-name sbg-email-sender \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/sbg-lambda-email-role \
  --handler dist/index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --environment "Variables={GMAIL_ADDRESS=sbg.pupbinan@gmail.com,GMAIL_APP_PASSWORD=qixk_kmwx_ejcs_tqkn}" \
  --region ap-southeast-1
```

Or update existing function:

```bash
aws lambda update-function-code \
  --function-name sbg-email-sender \
  --zip-file fileb://function.zip \
  --region ap-southeast-1
```

## Step 4: Create API Gateway

1. Go to AWS API Gateway Console
2. Create new REST API: `sbg-email-api`
3. Create resource `/send-email`
4. Create POST method → Lambda Integration → `sbg-email-sender`
5. Deploy to stage: `prod`
6. Copy the invoke URL: `https://xxx.execute-api.region.amazonaws.com/prod/send-email`

## Step 5: Add API Key (Optional but recommended)

1. API Gateway → API Keys → Create key
2. Add to Usage Plan
3. Enable API Key requirement on POST method

## Step 6: Update Supabase Secrets

```bash
# In set-secrets.sh, update these values:
LAMBDA_EMAIL_ENDPOINT="https://xxx.execute-api.ap-southeast-1.amazonaws.com/prod/send-email"
LAMBDA_API_KEY="your-api-key"

# Then run:
bash supabase/set-secrets.sh
```

## Step 7: Test

```bash
curl -X POST https://xxx.execute-api.ap-southeast-1.amazonaws.com/prod/send-email \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "html": "<h1>Hello</h1>",
    "from": "sbg.pupbinan@gmail.com"
  }'
```

## Environment Variables

The Lambda function expects these environment variables:
- `GMAIL_ADDRESS` — Your Gmail email address
- `GMAIL_APP_PASSWORD` — 16-character Gmail app password
