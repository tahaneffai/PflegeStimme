# Admin Authentication - Simplified

## ✅ What Changed

### Removed:
- ❌ User model dependency for admin
- ❌ Email/username fields
- ❌ Database lookup for admin authentication
- ❌ bcrypt password hashing for admin
- ❌ AdminUser table

### Added:
- ✅ Simple static password from `ADMIN_PASSWORD` env var
- ✅ Direct password comparison (no database)
- ✅ Session cookie still used (but not tied to user ID)

## 📁 Files Modified

1. **`lib/admin-auth.ts`**
   - Removed `prisma` import
   - Removed `bcrypt` usage
   - `checkPassword()` now compares directly with `ADMIN_PASSWORD`
   - `verifySession()` returns `boolean` (not user object)
   - Session token no longer contains user ID

2. **`app/api/admin/login/route.ts`**
   - Removed email/username requirement
   - Only checks password against `ADMIN_PASSWORD`
   - No database lookup

3. **`app/admin/login/page.tsx`**
   - Removed username field
   - Only password input now

4. **`middleware.ts`**
   - Updated to use boolean `verifySession()`

5. **`app/api/admin/comments/route.ts`**
   - Updated to use boolean `verifySession()`

6. **`app/api/admin/comments/[id]/route.ts`**
   - Updated to use boolean `verifySession()`

## 🔧 Environment Variables

Add to `.env.local`:

```env
ADMIN_PASSWORD=12345678
ADMIN_SESSION_SECRET=your-random-secret-here
DATABASE_URL=your-postgres-url
```

## 🚀 Usage

1. Set `ADMIN_PASSWORD` in `.env.local`
2. Go to `/admin/login`
3. Enter the password (no username needed)
4. Access granted if password matches `ADMIN_PASSWORD`

## 🔒 Security Notes

- Password is stored in environment variable (not in database)
- Session cookies are still signed and secure
- No user accounts needed for admin access
- Simple and minimal implementation




