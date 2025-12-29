# Admin Login Troubleshooting

## Current Status: Still Getting 401 Unauthorized

I've simplified the password check to the absolute minimum. Here's what to do:

## Step 1: Check Server Terminal

**CRITICAL**: When you try to log in, look at your **server terminal** (where `npm run dev` is running).

### You SHOULD see these logs:
```
========================================
[POST /api/admin/login] LOGIN REQUEST RECEIVED
[POST /api/admin/login] Password received: "12345678"
========================================
[checkPassword] SIMPLE CHECK
[checkPassword] Input: "12345678"
[checkPassword] Expected: "12345678"
[checkPassword] Are equal? true/false
========================================
```

### If you DON'T see these logs:
- **The request isn't reaching the server!**
- Check if the server is actually running
- Check if you're accessing the correct URL
- Check browser console for network errors

## Step 2: Verify Server is Running

1. Check terminal shows: `Ready in Xs`
2. Check it says: `Local: http://localhost:3000`
3. Make sure no errors in terminal

## Step 3: Test Direct API Call

Open browser console and run:
```javascript
fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: '12345678' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

This will show you the exact response.

## Step 4: Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try to log in
4. Click on the `/api/admin/login` request
5. Check:
   - Request URL (should be `http://localhost:3000/api/admin/login`)
   - Request payload (should have `{"password":"12345678"}`)
   - Response status (401?)
   - Response body (what error message?)

## Most Likely Issues

1. **Server not restarted** - Code changes need server restart
2. **Request not reaching server** - Check network tab
3. **Wrong port** - Make sure it's 3000
4. **Cached code** - Clear browser cache, restart server

## What to Share

If it still doesn't work, share:
1. **Server terminal output** when you try to log in
2. **Browser console errors** (if any)
3. **Network tab** screenshot of the login request
4. **Response body** from the failed request

This will help identify the exact issue!
