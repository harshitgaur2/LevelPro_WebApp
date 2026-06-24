# Cloud Deployment Guide

The LevelPro architecture is designed to be easily migrated from local Docker containers to cloud infrastructure with **zero code changes**—only environment variable updates are required.

## Target Architecture

- **Next.js App**: Vercel
- **PostgreSQL Database**: Railway or Supabase
- **Drupal CMS**: DigitalOcean Droplet, Render, or Pantheon

---

## Step 1: Deploy PostgreSQL (Railway / Supabase)

1. Create a new PostgreSQL database on [Railway](https://railway.app) or [Supabase](https://supabase.com).
2. Obtain the connection string (e.g., `postgresql://postgres:password@db.supabase.co:5432/postgres`).
3. On your local machine, temporarily update your `.env` file:
   ```env
   DATABASE_URL="your-production-db-url"
   ```
4. Run Prisma migrations against the production database:
   ```bash
   npx prisma migrate deploy
   ```
   *(Optional)* If you want test accounts in production, run `npx prisma db seed`.

---

## Step 2: Deploy Drupal CMS

1. **Option A (VPS - DigitalOcean/Linode)**:
   - Provision a standard LAMP/LEMP stack droplet.
   - Install Drupal 10 via Composer.
   - Configure a managed MySQL/PostgreSQL instance for Drupal.
   - Export your local Drupal configuration and import it to production using `drush cex` and `drush cim`.

2. **Option B (Platform as a Service - Pantheon)**:
   - Create a free Pantheon account.
   - Provision a new Drupal 10 site.
   - Recreate the content types manually (as done in `DRUPAL_SETUP.md`) or import your configuration.

3. Obtain the public URL of your Drupal installation (e.g., `https://cms.levelpro.in`).

---

## Step 3: Deploy Next.js to Vercel

1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your GitHub repository.
4. Open the **Environment Variables** section and add all required variables:
   - `DATABASE_URL` (From Step 1)
   - `AUTH_SECRET` (Generate a new one: `openssl rand -base64 32`)
   - `AUTH_URL` (Your production domain: e.g., `https://levelpro.in`)
   - `NEXT_PUBLIC_APP_URL` (Same as AUTH_URL)
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (Ensure you add your production domain to the authorized redirect URIs in Google Cloud Console: `https://levelpro.in/api/auth/callback/google`)
   - `DRUPAL_BASE_URL` (From Step 2)
   - `EMAIL_SERVER_*` and `EMAIL_FROM` (Configure SMTP like Resend/SendGrid for verification emails to work)
5. Click **Deploy**.

---

## Post-Deployment Checklist

- [ ] Ensure Google OAuth redirect URIs are updated to include your production domain.
- [ ] Verify that SMTP environment variables are correct (otherwise email signup will fail).
- [ ] In Drupal, ensure the JSON:API endpoints are accessible without authentication (or configure an API key if you added restricted access).
- [ ] In Drupal, ensure CORS is configured to allow requests from your Vercel domain. Edit `sites/default/services.yml`:
  ```yaml
  cors.config:
    enabled: true
    allowedHeaders: ['*']
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
    allowedOrigins: ['https://levelpro.in', 'https://www.levelpro.in']
    exposedHeaders: false
    maxAge: false
    supportsCredentials: false
  ```
