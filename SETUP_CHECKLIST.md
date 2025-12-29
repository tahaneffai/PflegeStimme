# Setup Checklist - Clean Backend System

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git repository cloned

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/awareness_db"
ADMIN_SESSION_SECRET="your-random-secret-string-here-change-in-production"
```

**For local development:**
- `DATABASE_URL`: Your local PostgreSQL connection string
- `ADMIN_SESSION_SECRET`: Any random string (e.g., `dev-secret-123`)

**For production (Vercel):**
- Add both variables in Vercel Project Settings → Environment Variables
- Use a strong random string for `ADMIN_SESSION_SECRET` (e.g., generate with `openssl rand -base64 32`)

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Create Database Schema
```bash
npx prisma migrate dev --name init
```

This will:
- Create the `Comment` table with status enum
- Create the `AdminUser` table
- Set up all indexes

### 5. Seed Admin User
```bash
npm run seed:admin
```

This creates/updates the default admin user:
- **Username:** `admin` (or `ADMIN_USERNAME` from env)
- **Password:** `12345678` (or `ADMIN_PASSWORD` from env)

To customize:
```bash
ADMIN_USERNAME=myadmin ADMIN_PASSWORD=mypassword npm run seed:admin
```

### 6. Start Development Server
```bash
npm run dev
```

### 7. Test the System

1. **Public Comment Submission:**
   - Go to `/voices`
   - Submit a comment (20-2000 characters)
   - Comment will be created with status `PENDING`

2. **Admin Login:**
   - Go to `/admin/login`
   - Login with username: `admin`, password: `12345678`
   - You'll be redirected to `/admin` dashboard

3. **Admin Dashboard:**
   - View all comments (PENDING, APPROVED, REJECTED)
   - Filter by status
   - Search comments
   - Approve/Reject/Edit/Delete comments

4. **Public View:**
   - Only `APPROVED` comments are visible on `/voices`
   - `PENDING` and `REJECTED` comments are hidden from public

## API Endpoints

### Public
- `GET /api/comments` - Get approved comments (paginated)
- `POST /api/comments` - Submit new comment (status: PENDING)

### Admin (Protected)
- `POST /api/admin/login` - Login with username/password
- `POST /api/admin/logout` - Logout
- `GET /api/admin/comments` - List all comments (with filters)
- `PATCH /api/admin/comments/[id]` - Update comment
- `DELETE /api/admin/comments/[id]` - Delete comment

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check `DATABASE_URL` is correct
- Test connection: `psql $DATABASE_URL`

### Migration Errors
- Make sure database exists
- Check Prisma schema is valid: `npx prisma validate`
- Reset if needed: `npx prisma migrate reset` (⚠️ deletes all data)

### Admin Login Not Working
- Verify admin user exists: `npm run seed:admin`
- Check `ADMIN_SESSION_SECRET` is set
- Clear browser cookies and try again

### TypeScript Errors
- Run `npx prisma generate` after schema changes
- Restart TypeScript server in your IDE

## Production Deployment (Vercel)

1. **Set up PostgreSQL:**
   - Use Vercel Postgres, Supabase, Neon, or any PostgreSQL provider
   - Get connection string

2. **Add Environment Variables in Vercel:**
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `ADMIN_SESSION_SECRET` - Strong random secret

3. **Deploy:**
   - Push to GitHub
   - Vercel will auto-deploy
   - Migrations run automatically on build

4. **Seed Admin (First Time):**
   - After deployment, run seed script locally with production DATABASE_URL:
   ```bash
   DATABASE_URL="your-production-url" npm run seed:admin
   ```
   - Or use Vercel CLI: `vercel env pull` then run seed

## File Structure

```
app/
  api/
    comments/route.ts          # Public comments API
    admin/
      login/route.ts            # Admin login
      logout/route.ts           # Admin logout
      comments/route.ts         # Admin list comments
      comments/[id]/route.ts   # Admin update/delete

lib/
  prisma.ts                     # Prisma client singleton
  admin-auth.ts                 # Admin authentication utilities

prisma/
  schema.prisma                 # Database schema

scripts/
  seed-admin.js                 # Seed admin user script
```

## Security Notes

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ HTTP-only session cookies
- ✅ Signed session tokens (HMAC-SHA256)
- ✅ Secure cookies in production
- ✅ Middleware protection for admin routes
- ✅ No fallback passwords
- ✅ Input validation on all endpoints

## Next Steps

- Customize admin username/password
- Set up production database
- Configure environment variables
- Deploy to Vercel
- Test all functionality

---

**System is now clean, minimal, and production-ready!**

