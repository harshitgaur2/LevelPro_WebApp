# LevelPro Netlify Deployment

LevelPro deploys to Netlify as a normal Next.js app. It does not use Netlify Database.

## Production Architecture

- App hosting: Netlify
- App framework: Next.js with `@netlify/plugin-nextjs`
- Database: external hosted PostgreSQL through `DATABASE_URL`
- Auth: NextAuth/Auth.js credentials + OTP
- Email OTP: Resend

## Netlify Build Settings

These settings are already stored in `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Do not add Netlify Database resources or provisioning config.

## Required Netlify Environment Variables

Set these in Netlify under Site configuration > Environment variables:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="https://levelpro.netlify.app"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_APP_URL="https://levelpro.netlify.app"
EMAIL_FROM="LevelPro <contact@levelproedu.com>"
RESEND_API_KEY="re_..."
```

When the custom domain is live, update both URL values:

```env
AUTH_URL="https://levelproedu.com"
NEXT_PUBLIC_APP_URL="https://levelproedu.com"
```

Optional Google OAuth variables:

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## Hosted Database Setup

Use a hosted PostgreSQL provider such as Neon or Supabase. Neon is a good fit for this app because it supports serverless Postgres and pooled connection strings.

For Neon:

1. Create a Neon project.
2. Copy the pooled connection string for runtime usage.
3. Use it as `DATABASE_URL` in Netlify.
4. Keep the value secret. Do not commit it.

The app uses Prisma with `DATABASE_URL`; no Netlify Database URL is required.

## Initialize Production Database

After setting `DATABASE_URL` to the hosted PostgreSQL connection string, run these once from the project folder:

```bash
npx prisma db push
npm run db:seed
```

This creates the tables and seeds:

- Admin account
- Starter student account
- Java DSA course
- Java DSA modules
- LeetCode practice questions
- Starter batch and notifications

If production shows "No course enrollment yet" after login, the database most likely has not been seeded.

## OTP Email Checklist

For inbox OTP delivery:

1. Add and verify `levelproedu.com` or a sending subdomain in Resend.
2. Add the DNS records shown by Resend in GoDaddy.
3. Keep `EMAIL_FROM` aligned with the verified domain, for example:

```env
EMAIL_FROM="LevelPro <contact@levelproedu.com>"
```

4. Add `RESEND_API_KEY` in Netlify as a secret environment variable.
5. Redeploy the site after updating environment variables.

## Deploy

```bash
npm run build
npx netlify deploy --prod
```

Or push to the connected production branch if the Netlify site is connected to GitHub.

## Domain Checklist

In Netlify:

1. Add `levelproedu.com` as a custom domain.
2. Follow Netlify's DNS instructions.
3. In GoDaddy, update DNS records to point to Netlify.
4. After DNS is active, update `AUTH_URL` and `NEXT_PUBLIC_APP_URL`.
5. Redeploy once more.
