# Admin Login 401 Error - Fix Guide

## Problem

Getting `401 Unauthorized` when trying to log in to admin panel.

## Debugging Added

I've added debug logging to help identify the issue. After restarting your dev server, check the **server terminal** (where `npm run dev` is running) when you try to log in. You'll see:

- Whether `ADMIN_PASSWORD` is loaded from environment
- Password comparison details
- Why the login is failing

## Common Causes & Fixes

### 1. Password Has Quotes or Whitespace

**Check**: Look at your `.env.local` file. The password might have extra quotes or spaces:

**Wrong:**
```env
ADMIN_PASSWORD="12345678"    # Has quotes
ADMIN_PASSWORD= 12345678     # Has space
ADMIN_PASSWORD="12345678 "   # Has space inside quotes
```

**Correct:**
```env
ADMIN_PASSWORD=12345678      # No quotes, no spaces
```

### 2. Wrong Password

**Check**: Make sure you're entering the exact password from `.env.local`:
- Default: `12345678`
- Case-sensitive
- No extra spaces

### 3. Environment Variable Not Loaded

**Fix**: Restart dev server after changing `.env.local`:
1. Stop server (Ctrl+C)
2. Start again: `npm run dev`

### 4. Port Mismatch

I noticed the error shows port `3001` instead of `3000`. If your dev server is on a different port, make sure you're accessing the correct URL.

## Quick Fix Steps

1. **Check `.env.local`**:
   ```env
   ADMIN_PASSWORD=12345678
   ```
   (No quotes, no spaces)

2. **Restart dev server**:
   ```bash
   # Stop (Ctrl+C)
   npm run dev
   ```

3. **Try logging in** with password: `12345678`

4. **Check server terminal** for debug messages

## What the Debug Logs Will Show

When you try to log in, the server terminal will show:
```
[POST /api/admin/login] Checking password...
[POST /api/admin/login] ADMIN_PASSWORD from env: ***set***
[POST /api/admin/login] Password length: 8
[checkPassword] Comparing passwords...
[checkPassword] Input length: 8
[checkPassword] Expected length: 8
[checkPassword] Match: true/false
```

This will tell you exactly why the password check is failing.

## Still Not Working?

1. Check server terminal for the debug messages
2. Verify `.env.local` has `ADMIN_PASSWORD=12345678` (no quotes)
3. Make sure you restarted the dev server
4. Try clearing browser cookies and logging in again

