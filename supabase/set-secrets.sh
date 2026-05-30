#!/bin/bash
# Run this after `supabase link --project-ref <your-project-ref>`
# Fill in your actual values before running

supabase secrets set \
  CLOUDINARY_CLOUD_NAME=your_cloud_name \
  CLOUDINARY_API_KEY=your_api_key \
  CLOUDINARY_API_SECRET=your_api_secret \
  RESEND_API_KEY=re_xxxxxxxxxxxx \
  RESEND_FROM_EMAIL="SBG Portal <noreply@yourdomain.com>" \
  APP_URL=https://master.d2wu91yk4gkty0.amplifyapp.com
