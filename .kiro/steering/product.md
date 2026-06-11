# Product

## SBG Membership & ID Management Portal

A serverless, cloud-native membership portal for the **Student Builder Group (SBG) — PUP Biñan Campus**.

## Purpose

Streamline student membership registration, approval, and digital ID issuance for SBG recruitment events and ongoing member management.

## Target Users

- **Students**: Register for SBG membership via mobile-friendly form; retrieve their digital membership ID.
- **Admins**: Review, approve, or reject applications via a protected dashboard with data visualizations.

## Core Features

1. **Multi-step Registration Portal** — Student form with validation, file uploads (COR + proof of share), and submission confirmation email.
2. **ID Finder & Visual Membership Card** — Search by student number; display a downloadable digital ID card for approved members.
3. **Admin Dashboard** — Protected route (Supabase Auth) with member stats, charts, approval workflow, term reset, and announcement broadcasting.
4. **Email System** — Queue-based email delivery with retry logic (Gmail SMTP via AWS Lambda).
5. **Registration Window Control** — Database-backed feature flag to open/close registration globally.

## Brand Guidelines

Refer to `ui.md` for the full design system. Key points:
- **Primary accent**: `#7C3AED` (Purple) — buttons, active states, focus rings
- **Dark-first UI**: `#0f1117` page backgrounds, `#1a1f2e` card surfaces
- **Monospace headings**: Space Mono for the "builder" aesthetic
- **Grid motif**: Subtle SVG grid pattern on hero sections
