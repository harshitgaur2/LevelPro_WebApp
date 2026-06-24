# Drupal CMS Setup Guide

This project relies on Drupal 10 acting as a headless CMS. While the Docker setup provides a working Drupal installation, you must manually create the content types and fields via the Drupal Admin UI so the Next.js API can fetch the content.

## Initial Setup

1. Run the local setup script to start Drupal:
   ```bash
   ./setup.sh
   ```
2. Open http://localhost:8888 in your browser.
3. Follow the standard Drupal installation process (choose Standard profile).
4. Use the database credentials from `docker-compose.yml`:
   - Database name: `drupal`
   - Database username: `drupal`
   - Database password: `drupal_secret`
   - Host: `drupal_db`
5. Enable the core **JSON:API** module:
   - Go to **Manage > Extend** (`/admin/modules`)
   - Search for "JSON:API"
   - Check the box and click **Install**.

---

## Content Types to Create

Go to **Structure > Content types > Add content type** (`/admin/structure/types/add`) and create the following:

### 1. Company
**Name**: Company (`company`)

**Fields to Add** (Manage Fields > Add field):
- `field_slug` (Text plain)
- `field_logo` (Image)
- `field_description` (Text formatted, long)
- `field_industry` (Text plain) - *e.g., "Technology", "Fintech"*
- `field_website` (Link)
- `field_location` (Text plain)
- `field_hiring_status` (List text)
  - Allowed values:
    - `actively_hiring|Actively Hiring`
    - `coming_soon|Coming Soon`
    - `closed|Closed`

### 2. Placement Program
**Name**: Placement Program (`placement_program`)

**Fields to Add**:
- `field_description` (Text formatted, long)
- `field_eligibility` (Text plain) - *e.g., "2024, 2025 Grads"*
- `field_duration` (Text plain)
- `field_stipend` (Text plain)
- `field_deadline` (Date)
- `field_company` (Entity reference -> Content -> Company)

### 3. Internship
**Name**: Internship (`internship`)

**Fields to Add**:
- `field_description` (Text formatted, long)
- `field_skills_required` (Text plain) - *Configure to allow unlimited values (multiple skills)*
- `field_duration` (Text plain)
- `field_stipend` (Text plain)
- `field_is_remote` (Boolean)
- `field_company` (Entity reference -> Content -> Company)

### 4. FAQ
**Name**: FAQ (`faq`)

**Fields to Add**:
- `field_question` (Text plain) - *(You can also just use the default Title field)*
- `field_answer` (Text formatted, long)
- `field_category` (List text)
  - Allowed values:
    - `general|General`
    - `applications|Applications`
    - `interviews|Interviews`

---

## Next Steps

Once the content types and fields are created:
1. Go to **Content > Add content** and create a few sample Companies, Programs, and Internships.
2. The Next.js frontend will now automatically fetch this content via the `/api/companies`, `/api/programs`, and `/api/internships` routes.
