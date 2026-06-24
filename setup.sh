#!/usr/bin/env bash
set -euo pipefail

echo "🚀 LevelPro — Setup Script"
echo "=========================="

# 1. Copy .env.example → .env (if not exists)
if [ ! -f .env ]; then
  echo "📋 Copying .env.example → .env"
  cp .env.example .env

  # Generate AUTH_SECRET automatically
  SECRET=$(openssl rand -base64 32)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|CHANGE_ME_generate_with_openssl_rand_base64_32|${SECRET}|g" .env
  else
    sed -i "s|CHANGE_ME_generate_with_openssl_rand_base64_32|${SECRET}|g" .env
  fi
  echo "🔑 Generated AUTH_SECRET"
else
  echo "✅ .env already exists, skipping copy"
fi

# 2. Start Docker containers
echo ""
echo "🐳 Starting Docker containers..."
docker compose up -d

# 3. Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
RETRIES=30
until docker exec levelpro_postgres pg_isready -U levelpro > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "  Waiting... ($RETRIES attempts left)"
  RETRIES=$((RETRIES - 1))
  sleep 2
done

if [ $RETRIES -eq 0 ]; then
  echo "❌ PostgreSQL failed to start. Check docker logs."
  exit 1
fi

echo "✅ PostgreSQL is ready"

# 4. Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦 Installing npm dependencies..."
  npm install
fi

# 5. Run Prisma migrations
echo ""
echo "🗄️  Running Prisma migrations..."
npx prisma migrate dev --name init

# 6. Generate Prisma client
echo ""
echo "⚙️  Generating Prisma client..."
npx prisma generate

# 7. Seed the database
echo ""
echo "🌱 Seeding database..."
npx prisma db seed

echo ""
echo "============================================"
echo "✅ LevelPro setup complete!"
echo ""
echo "  Next.js app:  http://localhost:3000"
echo "  Drupal CMS:   http://localhost:8888"
echo "  Adminer:      http://localhost:8080"
echo ""
echo "  Run: npm run dev"
echo "============================================"
