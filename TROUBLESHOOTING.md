# Troubleshooting Guide

## Database Connection Issues

### Error: getaddrinfo ENOTFOUND postgres.railway.internal

This error occurs when trying to connect to the PostgreSQL database in Railway.

#### Quick Diagnosis

Run this command to check your database configuration:
```bash
railway run npm run check:db
```

#### Common Causes & Solutions

**1. Database Not Ready**
- **Symptom:** Database was just created
- **Solution:** Wait 1-2 minutes after creating PostgreSQL service for it to fully initialize
- **Check:** Database service should show green/active status in Railway dashboard

**2. Services Not Linked**
- **Symptom:** `DATABASE_URL` is missing or not auto-injected
- **Solution:** 
  1. Ensure PostgreSQL service and app service are in the same Railway project
  2. Railway automatically links services in the same project
  3. Check app service → Variables tab → Look for `DATABASE_URL`
  4. If missing, manually link: Go to PostgreSQL service → Settings → ensure it's in the same project

**3. Wrong DATABASE_URL Format**
- **Symptom:** Connection string parsing errors
- **Solution:**
  1. Go to PostgreSQL service → **"Connect"** tab
  2. Copy the **"Connection URL"** (should start with `postgresql://`)
  3. Verify it's set in your app service variables as `DATABASE_URL`

**4. Database Service Not Running**
- **Symptom:** Database service shows as stopped or error
- **Solution:**
  1. Check PostgreSQL service status in Railway dashboard
  2. Restart the database service if needed
  3. Wait for it to be fully running (green status)

#### Verification Steps

1. **Check if DATABASE_URL is set:**
   ```bash
   railway run npm run check:db
   ```

2. **Verify database is accessible:**
   - Go to Railway → PostgreSQL service → **"Connect"** tab
   - Try the connection test if available

3. **Check service linking:**
   - Both services should be in the same project
   - `DATABASE_URL` should appear automatically in app service variables

## Troubleshooting Guide

## 401 Unauthorized - "Invalid account SID"

### Problem
When accessing protected endpoints (like `/topics`), you receive:
```json
{
  "message": "Invalid account SID",
  "details": {
    "message": "Invalid account SID",
    "error": "Unauthorized",
    "statusCode": 401
  }
}
```

### Root Cause
The production database doesn't have an account with the SID being sent from the frontend. This happens when:
1. The account seeding script hasn't been run in production
2. The Account SID in Vercel environment variables doesn't match what's in the database
3. The database was reset/recreated without re-seeding

### Solution Steps

#### Step 1: Verify Account Exists
Run this command in Railway to check if accounts exist:
```bash
railway run npm run check:account
```

If no accounts are found, proceed to Step 2.

#### Step 2: Seed the Account
Run the seed script to create the default test account:
```bash
railway run npm run seed:account
```

This creates:
- **Account SID:** `AC123456789`
- **API Key:** `sk_live_abc123xyz456`

#### Step 3: Verify Environment Variables in Vercel
Ensure your Vercel project has these exact values (no extra spaces):
```
NEXT_PUBLIC_API_ACCOUNT_SID=AC123456789
NEXT_PUBLIC_API_KEY=sk_live_abc123xyz456
```

#### Step 4: Redeploy Frontend
After updating environment variables, trigger a new deployment in Vercel.

### Verification

1. **Check Backend Logs:**
   - Go to Railway → Your Project → Deployments → Latest → Logs
   - Look for authentication attempts (in development mode only)

2. **Test the Endpoint:**
   ```bash
   curl -X GET https://your-api.up.railway.app/topics \
     -H "x-account-sid: AC123456789" \
     -H "x-api-key: sk_live_abc123xyz456"
   ```

3. **Check Frontend:**
   - Open browser DevTools → Network tab
   - Look at the request headers for `/topics`
   - Verify `x-account-sid` and `x-api-key` are present and correct

### Common Mistakes

1. **Extra Spaces:** Environment variables with trailing/leading spaces
   - ❌ `NEXT_PUBLIC_API_ACCOUNT_SID= AC123456789 ` (has spaces)
   - ✅ `NEXT_PUBLIC_API_ACCOUNT_SID=AC123456789` (no spaces)

2. **Wrong Credentials:** Using different credentials than what was seeded
   - Solution: Either seed with matching credentials OR update Vercel env vars

3. **Database Reset:** Database was recreated but account wasn't re-seeded
   - Solution: Always re-run seed script after database changes

### Additional Debugging

If the issue persists, check:

1. **Database Connection:**
   ```bash
   railway run npm run check:account
   ```

2. **Header Format:**
   - Headers should be lowercase: `x-account-sid`, `x-api-key`
   - No extra whitespace

3. **API Key Status:**
   - Verify the API key is active (`isActive: true` in database)
   - Check if multiple API keys exist for the account

### Production Best Practices

1. **Use Strong Credentials:** Don't use default test credentials in production
2. **Separate Environments:** Use different accounts for staging/production
3. **Monitor Logs:** Set up logging to track authentication failures
4. **Document Credentials:** Keep a secure record of production credentials

