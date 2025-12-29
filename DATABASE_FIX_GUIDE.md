# Database Connection Fix Guide

## Error: Authentication failed against database server

This means your `DATABASE_URL` in `.env.local` has incorrect credentials.

## Quick Fix Steps

### Step 1: Check Your PostgreSQL Credentials

You need to know:
- **Username** (usually `postgres`)
- **Password** (the one you set when installing PostgreSQL)
- **Database name** (create one if it doesn't exist)

### Step 2: Update `.env.local`

Open `.env.local` and update the `DATABASE_URL` line:

**Format:**
```
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME"
```

**Example:**
```
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/awareness_db"
```

### Step 3: Create Database (if it doesn't exist)

1. Open PostgreSQL command line or pgAdmin
2. Connect as the postgres user
3. Run:
   ```sql
   CREATE DATABASE awareness_db;
   ```
   (Replace `awareness_db` with your database name)

### Step 4: Test Connection

Run:
```bash
node scripts/test-db-connection.js
```

This will tell you if the connection works.

### Step 5: Apply Migrations

Once connected, apply the database schema:
```bash
npx prisma migrate deploy
```

Or if you want to reset everything:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## Common Issues

### Issue 1: Wrong Password
- **Symptom**: "Authentication failed"
- **Fix**: Check the password in DATABASE_URL matches your PostgreSQL password

### Issue 2: Database Doesn't Exist
- **Symptom**: "database does not exist"
- **Fix**: Create the database (see Step 3 above)

### Issue 3: PostgreSQL Not Running
- **Symptom**: "ECONNREFUSED" or "connection refused"
- **Fix**: Start PostgreSQL service
  - Windows: Check Services app, start "postgresql" service
  - Or use: `pg_ctl start`

### Issue 4: Wrong Port
- **Symptom**: Connection timeout
- **Fix**: Check if PostgreSQL is on port 5432 (default)
  - If different, update DATABASE_URL: `...@localhost:YOUR_PORT/...`

## Example `.env.local` File

```env
# Database
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/awareness_db"

# Admin
ADMIN_PASSWORD="12345678"
ADMIN_SESSION_SECRET="your-random-secret-string-at-least-32-characters-long"
```

**Important**: 
- Replace `your_password_here` with your actual PostgreSQL password
- Replace `awareness_db` with your database name
- Make sure there are no extra spaces or quotes issues

## After Fixing

1. **Restart dev server** (Ctrl+C, then `npm run dev`)
2. **Test connection**: `node scripts/test-db-connection.js`
3. **Apply migrations**: `npx prisma migrate deploy`
4. **Test the app**: Try submitting a comment



