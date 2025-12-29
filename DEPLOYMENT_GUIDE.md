# Deployment Guide - Vercel

## Pre-Deployment Checklist

### ✅ Code is Ready
- ✅ Comments API working
- ✅ Admin login working
- ✅ Database schema migrated
- ✅ All Edge Runtime issues fixed

## Step 1: Environment Variables

### Required Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

1. **DATABASE_URL**
   - Your PostgreSQL connection string
   - Example: `postgresql://user:password@host:5432/database?sslmode=require`

2. **ADMIN_PASSWORD**
   - Admin login password
   - Example: `12345678`
   - ⚠️ **Change this to a strong password in production!**

3. **ADMIN_SESSION_SECRET**
   - Secret for signing session cookies
   - Generate a random string (at least 32 characters)
   - Example: `your-super-secret-random-string-at-least-32-chars-long`
   - ⚠️ **Must be different from default!**

### Generate a Secure ADMIN_SESSION_SECRET

You can generate one using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Database Migration

### Option A: Automatic Migration (Recommended)

Vercel will run migrations automatically if you have a `postinstall` script.

Your `package.json` already has:
```json
"postinstall": "prisma generate"
```

### Option B: Manual Migration

If automatic migration doesn't work, run manually after deployment:

1. Connect to your database
2. Run: `npx prisma migrate deploy`

## Step 3: Deploy to Vercel

### If you haven't connected your repo:

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Set Environment Variables**:
   - Add all 3 variables (DATABASE_URL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET)
   - Make sure to add them for:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

### If repo is already connected:

1. **Push your changes**:
   ```bash
   git add .
   git commit -m "Fix admin login and Edge Runtime issues"
   git push
   ```

2. **Vercel will auto-deploy** from your push

## Step 4: Verify Deployment

### After deployment:

1. **Test Comments**:
   - Go to: `https://your-app.vercel.app/voices`
   - Try submitting a comment
   - Should work!

2. **Test Admin Login**:
   - Go to: `https://your-app.vercel.app/admin/login`
   - Enter your `ADMIN_PASSWORD`
   - Should redirect to admin dashboard

3. **Check Logs**:
   - Go to Vercel Dashboard → Your Project → Logs
   - Check for any errors

## Step 5: Post-Deployment

### Important Security Notes:

1. **Change Admin Password**:
   - Don't use `12345678` in production!
   - Update `ADMIN_PASSWORD` in Vercel environment variables
   - Use a strong password (at least 16 characters)

2. **Update ADMIN_SESSION_SECRET**:
   - Don't use the default secret!
   - Generate a new random secret
   - Update in Vercel environment variables

3. **Database Security**:
   - Make sure your DATABASE_URL uses SSL (`?sslmode=require`)
   - Don't commit `.env` files to Git

## Troubleshooting

### Build Fails:

1. **Check build logs** in Vercel dashboard
2. **Common issues**:
   - Missing environment variables
   - Prisma client not generated
   - TypeScript errors

### Database Connection Fails:

1. **Check DATABASE_URL** is correct
2. **Verify database allows connections** from Vercel IPs
3. **Check SSL mode** is set correctly

### Admin Login Doesn't Work:

1. **Check ADMIN_PASSWORD** is set correctly
2. **Check ADMIN_SESSION_SECRET** is set (not default)
3. **Check browser console** for errors
4. **Check Vercel function logs** for errors

## Quick Deploy Commands

```bash
# 1. Commit and push
git add .
git commit -m "Ready for deployment"
git push

# 2. Deploy (if using Vercel CLI)
vercel --prod
```

## Environment Variables Summary

```
DATABASE_URL=postgresql://... (your database URL)
ADMIN_PASSWORD=your-strong-password-here
ADMIN_SESSION_SECRET=your-random-secret-32-chars-minimum
```

That's it! Your app should be ready to deploy. 🚀

