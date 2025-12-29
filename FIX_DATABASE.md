# Fix Database Connection Error

## Problem

You're getting: `Authentication failed against database server at localhost`

## Root Cause

You have **two** `.env` files:
1. `.env` - Has Prisma Cloud database (working ✅)
2. `.env.local` - Has localhost database (not working ❌)

Next.js uses `.env.local` with **higher priority**, so it's trying to connect to localhost with wrong credentials.

## Solution Options

### Option A: Use Prisma Cloud Database (Recommended - Already Working!)

Since your Prisma Cloud database is already working and has the schema, use that:

1. **Copy the DATABASE_URL from `.env` to `.env.local`**:

   Open `.env.local` and replace the DATABASE_URL line with:
   ```
   DATABASE_URL="postgres://650a4008b5cdd6d9d023434ae9a1899afea0b6d89b654f91a49d29fcc772c89b:sk_B3cL4E3smrp0Rpka58BQ2@db.prisma.io:5432/postgres?sslmode=require"
   ```

2. **Restart dev server** (Ctrl+C, then `npm run dev`)

3. **Test**: Try submitting a comment

### Option B: Fix Localhost Database

If you want to use localhost PostgreSQL:

1. **Check your PostgreSQL password**:
   - The password in `.env.local` is currently `password`
   - This might not be your actual PostgreSQL password

2. **Update `.env.local`** with correct credentials:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/awareness_db"
   ```
   Replace `YOUR_ACTUAL_PASSWORD` with your real PostgreSQL password

3. **Make sure the database exists**:
   ```sql
   CREATE DATABASE awareness_db;
   ```

4. **Apply migrations**:
   ```bash
   npx prisma migrate deploy
   ```

5. **Restart dev server**

## Quick Fix (Recommended)

**Just use the Prisma Cloud database that's already working!**

1. Open `.env.local`
2. Find the `DATABASE_URL` line
3. Replace it with the one from `.env` (the Prisma Cloud URL)
4. Save the file
5. Restart dev server: `npm run dev`

That's it! The Prisma Cloud database already has your schema and is working.

## After Fixing

1. **Restart dev server** (important!)
2. **Test connection**: `node scripts/test-db-connection.js`
3. **Test the app**: Try submitting a comment



