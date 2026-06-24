# LevelPro — Career & Placement Portal

LevelPro is a full-stack career and placement portal for Indian students, built with a modern Next.js 14 architecture, Headless Drupal CMS, and NextAuth authentication.

## 🚀 Tech Stack

- **Frontend & API**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4, custom Design System (CSS custom properties)
- **Database**: PostgreSQL (managed via Prisma ORM)
- **Authentication**: NextAuth.js v5 (Google OAuth + Credentials)
- **CMS**: Headless Drupal 10 (JSON:API)
- **State & Data Fetching**: TanStack React Query

## 📦 Local Development Setup

We use Docker Compose to run the local dependencies (PostgreSQL + Drupal) so your system stays clean.

1. **Run the setup script**:
   ```bash
   ./setup.sh
   ```
   *This script will copy `.env.example`, generate an auth secret, start Docker containers, run Prisma migrations, and seed the database with test accounts.*

2. **Configure Drupal**:
   Follow the instructions in `DRUPAL_SETUP.md` to create the required content types in the Drupal CMS.

3. **Start Next.js**:
   ```bash
   npm run dev
   ```

### Local Services

- **Next.js App**: http://localhost:3000
- **Drupal CMS**: http://localhost:8888
- **Adminer (DB UI)**: http://localhost:8080
- **PostgreSQL (App)**: `localhost:5433`
- **PostgreSQL (Drupal)**: `localhost:5434`

### Test Accounts

The setup script creates the following accounts:
- **Student**: `student@levelpro.in` / `student123`
- **Admin**: `admin@levelpro.in` / `admin123`

## 🏗 Architecture

### Backend-for-Frontend (BFF) Pattern
The Next.js App Router API (`src/app/api/...`) acts as a BFF. Client-side components never talk directly to Drupal. Instead, they call the Next.js API, which fetches from Drupal's JSON:API, transforms the complex nested JSON into flat, typed objects, and returns them to the client.

### Data Storage Strategy
- **User Data (PostgreSQL)**: Users, Profiles, Auth Sessions, Saved Companies, and Applications live in the PostgreSQL database managed by Prisma.
- **Content (Drupal CMS)**: Companies, Placement Programs, Internships, and FAQs live in Drupal.
- **Why?** This keeps high-write relational data separate from editorial content, making the system highly scalable.

## ☁️ Deployment

See `DEPLOYMENT.md` for a complete guide on migrating from the local Docker setup to cloud providers like Vercel, Railway, and DigitalOcean.
