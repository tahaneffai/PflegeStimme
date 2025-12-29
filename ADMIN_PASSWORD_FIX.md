# Admin Password Fix Guide

## Problem
You're getting "Invalid password" error when trying to login with `12345678`.

## Root Causes
1. **Database not set up** - PostgreSQL database doesn't exist or isn't accessible
2. **Tables don't exist** - Migrations haven't been run yet
3. **AdminConfig missing** - Admin config record doesn't exist in database
4. **Wrong password hash** - Password hash in database doesn't match

## Solution Steps

### Step 1: Set Up PostgreSQL Database

#### Option A: Local PostgreSQL (for development)

1. **Install PostgreSQL** (if not installed):
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create database**:
   ```sql
   CREATE DATABASE awareness_db;
   ```

3. **Update `.env.local`** with your actual credentials:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/awareness_db"
   ADMIN_PASSWORD="12345678"
   ADMIN_SECRET="change-this-to-a-random-secret-in-production"
   ```

#### Option B: Cloud Database (for production/Vercel)

1. **Choose a provider**:
   - **Vercel Postgres** (recommended): Integrated with Vercel
   - **Supabase**: Free tier available
   - **Neon**: Serverless PostgreSQL
   - **Railway/Render**: Managed PostgreSQL

2. **Get connection string** from your provider

3. **Set in Vercel**:
   - Go to Vercel Project → Settings → Environment Variables
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Add `ADMIN_PASSWORD="12345678"`
   - Add `ADMIN_SECRET` (random secure string)

### Step 2: Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init
```

This will:
- Create the `AnonymousVoice` table
- Create the `AdminConfig` table
- Set up all indexes

### Step 3: Fix Admin Password

Run the fix script:

```bash
node scripts/fix-admin-password.js
```

This script will:
- ✅ Check database connection
- ✅ Verify tables exist
- ✅ Create/update AdminConfig with password `12345678`
- ✅ Test the password

### Step 4: Test Login

1. Start your dev server: `npm run dev`
2. Go to your website
3. Click the Shield icon (admin login)
4. Enter password: `12345678`

## Alternative: Use Fallback Password

If database isn't set up yet, you can use the **fallback password** that always works:

**Password: `Taha2005`**

This password works even if the database isn't connected, as a safety mechanism.

## Troubleshooting

### Error: "Database connection failed"
- ✅ Check PostgreSQL is running: `pg_isready` or check service status
- ✅ Verify DATABASE_URL in `.env.local` is correct
- ✅ Test connection: `psql -h localhost -U postgres -d awareness_db`

### Error: "Table does not exist"
- ✅ Run migrations: `npx prisma migrate dev --name init`

### Error: "Invalid password" (but database works)
- ✅ Run fix script: `node scripts/fix-admin-password.js`
- ✅ Or use fallback: `Taha2005`

### For Vercel Deployment
1. Set up PostgreSQL database (Vercel Postgres, Supabase, etc.)
2. Add `DATABASE_URL` to Vercel environment variables
3. Add `ADMIN_PASSWORD="12345678"` to Vercel environment variables
4. Add `ADMIN_SECRET` (random string) to Vercel environment variables
5. Deploy - migrations will run automatically on first build

## Quick Commands Reference

```bash
# Check database connection
node scripts/fix-admin-password.js

# Generate Prisma Client
npx prisma generate

# Create migrations
npx prisma migrate dev --name init

# View database (Prisma Studio)
npx prisma studio

# Reset admin password (if needed)
node scripts/reset-admin-password.js
```

## Admin Passwords

- **`12345678`** - Default password (stored in database)
- **`Taha2005`** - Fallback password (always works, even without DB)

