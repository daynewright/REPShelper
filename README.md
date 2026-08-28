# REPS Helper

Log real estate hours during the year. At tax time, print a CPA packet (PDF via the browser) and download a CSV of the same log.

This is substantiation, not tax-prep software.

## Setup

1. Copy `.env.example` to `.env.local` and add your Supabase URL and publishable key.
2. Apply the schema in `supabase/migrations/20260828000000_init_reps.sql` to the project (`supabase db push` locally, or run the SQL in the Supabase SQL editor).
3. In the Supabase dashboard, add `http://localhost:3000/auth/callback` to Auth URL configuration (Redirect URLs).
4. `npm run dev`

## What it tracks

- **750-hour test** — taxpayer hours in real-property trades (if eligible) plus taxpayer rental hours
- **More than 50%** — those hours vs all of the taxpayer’s logged work
- **Rental material participation** — taxpayer + spouse rental hours, per property or grouped
