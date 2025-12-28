# Troubleshooting Database Errors

## Quick Diagnosis

If you see database errors, run these diagnostics:

```bash
# Test database connection
node scripts/test-db-connection.js

# Setup environment variables (if missing)
node scripts/setup-env.js
```

## "Environment variable not found: DATABASE_URL"

**Symptoms:**
- Error: `Environment variable not found: DATABASE_URL`
- Prisma schema validation fails

**Solution:**
1. **Create .env.local file:**
   ```bash
   node scripts/setup-env.js
   ```
   Or manually create `.env.local`:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```

2. **Restart your dev server** after creating .env.local

3. **Verify it's loaded:**
   ```bash
   node -e "console.log(process.env.DATABASE_URL)"
   ```

**Note:** The code now automatically sets a default DATABASE_URL in development, but it's still recommended to create `.env.local` explicitly.

## Common Causes & Solutions

### 1. Database File Locked (SQLite)
**Symptoms:**
- Error code: `SQLITE_BUSY` or `P1008`
- Error message contains "locked"

**Solution:**
- Close any database viewers (DB Browser, Prisma Studio, etc.)
- Stop the dev server
- Restart: `npm run dev`

### 2. Database File Missing
**Symptoms:**
- Error code: `P1001`
- Error message: "Can't reach database"

**Solution:**
```bash
npx prisma db push
```

### 3. Schema Out of Sync
**Symptoms:**
- Error message: "no such table" or "no such column"

**Solution:**
```bash
npx prisma migrate dev
# or
npx prisma db push
```

### 4. Prisma Client Not Generated
**Symptoms:**
- Error message contains "PrismaClient"
- Error code: `P1000`

**Solution:**
```bash
npx prisma generate
```

### 5. Environment Variable Missing
**Symptoms:**
- Error code: `ENV_MISSING`
- Error message: "DATABASE_URL is not set"

**Solution:**
Create `.env.local`:
```
DATABASE_URL="file:./prisma/dev.db"
```

### 6. Database Permissions
**Symptoms:**
- Error on Windows: "EPERM: operation not permitted"
- Database file exists but can't be accessed

**Solution:**
- Check file permissions
- Ensure no other process is using the database
- Try running as administrator (if needed)

## Enhanced Error Messages

The system now provides more specific error messages:

- **"Database query failed"** → Generic error (check logs for details)
- **"Database table not found. Please run migrations."** → Schema issue
- **"Database schema mismatch. Please run migrations."** → Column missing
- **"Database is locked. Please try again later."** → SQLite lock
- **"Database connection error"** → Can't reach database
- **"Database client not initialized"** → Prisma client issue

## Debug Mode

In development, check the console for detailed error logs:
```
[safeDbQuery] Attempt 1/3 failed: {
  code: 'P1001',
  message: 'Can\'t reach database',
  error: ...
}
```

## Still Having Issues?

1. **Check if database file exists:**
   ```bash
   Test-Path prisma\dev.db  # Windows PowerShell
   ls prisma/dev.db          # Linux/Mac
   ```

2. **Verify Prisma schema:**
   ```bash
   npx prisma validate
   ```

3. **Reset database (⚠️ deletes all data):**
   ```bash
   npx prisma migrate reset
   ```

4. **Check for file locks:**
   - Close all database tools
   - Stop dev server
   - Check Task Manager for processes using the DB file

