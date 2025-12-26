# Production Deployment Guide

This guide covers deploying the Ticket Management application to Railway (backend) and Vercel (frontend).

## 📋 Prerequisites

- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository with your code

## 🗄️ Environment Variables

### Backend (Railway)

| Variable Name | Purpose | Example Value | Required |
|--------------|---------|---------------|----------|
| `NODE_ENV` | Environment mode | `production` | Yes |
| `PORT` | Server port | `3000` | Auto-set by Railway |
| `FRONTEND_URL` | Frontend origin(s) for CORS | `https://your-app.vercel.app` | Yes |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` | Auto-set by Railway |
| `DB_SYNCHRONIZE` | Auto-sync database schema | `false` | Recommended: false in production |
| `DB_SSL` | Enable SSL for database | `true` | Yes (for Railway) |
| `DB_LOGGING` | Enable SQL logging | `false` | Optional |

### Frontend (Vercel)

| Variable Name | Purpose | Example Value | Required |
|--------------|---------|---------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-api.railway.app` | Yes |
| `NEXT_PUBLIC_API_ACCOUNT_SID` | Account SID for API auth | `AC123456789` | Yes |
| `NEXT_PUBLIC_API_KEY` | API key for authentication | `sk_live_abc123xyz456` | Yes |

## 🚂 Backend Deployment (Railway)

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Select the `ticket-management-api` folder as the root directory

### Step 2: Provision PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a PostgreSQL database
4. **Wait 1-2 minutes** for the database to fully initialize (status should be green)
5. The `DATABASE_URL` environment variable will be automatically set and linked to your app service
6. **Important:** Ensure both your app service and PostgreSQL service are in the same Railway project

### Step 3: Configure Environment Variables

1. In your Railway project, go to **"Variables"** tab
2. Add the following environment variables:

```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-app.vercel.app
DB_SYNCHRONIZE=false
DB_SSL=true
DB_LOGGING=false
```

**Note:** 
- Replace `https://your-frontend-app.vercel.app` with your actual Vercel **production domain** (not preview URLs)
- You'll get this URL after deploying the frontend (Step 3 of Frontend Deployment)
- The production domain is typically `https://{project-name}.vercel.app` (without the hash suffix)

### Step 4: Configure Build Settings

Railway will automatically detect the build settings from `railway.json`, but verify:

1. Go to **"Settings"** → **"Service"**
2. Ensure:
   - **Root Directory:** `ticket-management-api`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`

### Step 5: Deploy

1. Railway will automatically deploy when you push to your main branch
2. Or click **"Deploy"** to trigger a manual deployment
3. Wait for the build to complete
4. Copy your Railway deployment URL (e.g., `https://your-api.up.railway.app`)

### Step 6: Verify Database Connection

Before seeding, verify the database connection works:

```bash
railway run npm run check:db
```

This will show:
- Whether `DATABASE_URL` is set
- Database connection details
- Connection test results

**If you see connection errors:**
1. Ensure PostgreSQL service is running (green status in Railway)
2. Verify services are linked (both in same project)
3. Check Railway variables for `DATABASE_URL`

### Step 7: Seed Test Account (REQUIRED)

**⚠️ IMPORTANT:** You MUST seed an account before the frontend can authenticate. This is not optional.

To create a test account, use Railway CLI:

```bash
railway run npm run seed:account
```

**Troubleshooting:** If you get database connection errors:
1. First run: `railway run npm run check:db` to diagnose
2. Ensure PostgreSQL service is running and linked
3. Wait a few minutes after creating the database for it to be fully ready

Or via Railway Dashboard:
1. Go to Railway project → **"Deployments"**
2. Click on the latest deployment
3. Open the **"Logs"** tab
4. Or use the **"Shell"** option to run commands

This creates:
- Account SID: `AC123456789`
- API Key: `sk_live_abc123xyz456`

**Note:** These credentials must match the environment variables you set in Vercel.

### Step 8: Run Database Migrations

After seeding the account, run the topic migration:

```bash
railway run npm run migrate:topics
```

This ensures all existing tickets have `topicNameSnapshot` populated.

## ▲ Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `v0-uix-ticket-qf`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

### Step 2: Configure Environment Variables

1. In your Vercel project, go to **"Settings"** → **"Environment Variables"**
2. Add the following variables:

```
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
NEXT_PUBLIC_API_ACCOUNT_SID=AC123456789
NEXT_PUBLIC_API_KEY=sk_live_abc123xyz456
```

**Note:** 
- Replace `https://your-api.up.railway.app` with your Railway backend URL
- Use the same Account SID and API Key you seeded in the backend

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Vercel will provide you with a deployment URL (e.g., `https://your-app.vercel.app`)

### Step 4: Update Backend CORS

After getting your Vercel URL, update the backend CORS:

1. Go back to Railway project → **"Variables"**
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will automatically redeploy with the new CORS settings

**⚠️ Important - Vercel URL Types:**
- Vercel provides multiple URLs:
  - **Production domain**: `https://your-app.vercel.app` (your custom/production URL)
  - **Preview URLs**: `https://your-app-{hash}.vercel.app` (deployment-specific)
- **Always use the production domain** in `FRONTEND_URL` (the one users access)
- The `Origin` header from the browser must match `FRONTEND_URL` exactly
- Check your browser's Network tab to see the exact `Origin` header being sent

## ✅ Verification

### Test Backend

1. Visit your Railway URL: `https://your-api.up.railway.app/health`
2. Should return: `{"ok":true}`

### Test Frontend

1. Visit your Vercel URL
2. Try creating a ticket
3. Verify API calls work correctly

### Common Issues

**401 Unauthorized - "Invalid account SID":**
- **Most Common Cause:** Account not seeded in production database
- **Solution:** Run `railway run npm run seed:account` in your Railway project
- **Verify Account Exists:** Run `railway run npm run check:account` to see all accounts in the database
- **Verify Credentials Match:** Check that the Account SID and API Key in Vercel environment variables match the seeded values exactly (no extra spaces)
- **Debug:** Check Railway logs to see what SID is being received (development mode only)
- **Note:** Each environment (production, staging) needs its own account seeded
- **Quick Fix:** If using default credentials, ensure Vercel has:
  - `NEXT_PUBLIC_API_ACCOUNT_SID=AC123456789` (no spaces)
  - `NEXT_PUBLIC_API_KEY=sk_live_abc123xyz456` (no spaces)

**CORS Errors (Missing Allow Origin):**
- **Most Common Cause:** `FRONTEND_URL` in Railway doesn't match the `Origin` header from the browser
- **Solution:** 
  1. Check the browser's Network tab → find the OPTIONS request → check the `Origin` header value
  2. Update `FRONTEND_URL` in Railway to match that exact value
  3. Common issues:
     - Using Vercel preview URL (`https://app-{hash}.vercel.app`) instead of production domain (`https://app.vercel.app`)
     - Trailing slash mismatch: `https://app.vercel.app/` vs `https://app.vercel.app`
     - Protocol mismatch: `http://` instead of `https://`
- **Multiple origins:** Use comma-separated values: `https://app1.vercel.app,https://app2.vercel.app`
- **After updating:** Railway will auto-redeploy; wait for deployment to complete before testing

**Database Connection Errors (getaddrinfo ENOTFOUND postgres.railway.internal):**
- **Cause:** TypeORM trying to connect but DATABASE_URL might not be set correctly or database isn't linked
- **Diagnosis:** Run `railway run npm run check:db` to diagnose the issue
- **Solution 1:** Verify DATABASE_URL is set in Railway:
  1. Go to Railway project → **"Variables"** tab
  2. Look for `DATABASE_URL` (should be auto-set by Railway when you add PostgreSQL)
  3. If missing, check that PostgreSQL service is linked to your app service
- **Solution 2:** Link database to your service:
  1. In Railway project, ensure PostgreSQL service is added
  2. Click on your app service → **"Settings"** → **"Variables"**
  3. Verify `DATABASE_URL` appears (Railway auto-injects it when services are linked)
  4. If not linked: Click on PostgreSQL service → **"Settings"** → **"Generate Domain"** (if needed)
  5. Then in your app service, Railway should auto-inject `DATABASE_URL`
- **Solution 3:** Manually set DATABASE_URL (if auto-injection fails):
  1. Go to PostgreSQL service → **"Connect"** tab
  2. Copy the **"Connection URL"** (starts with `postgresql://`)
  3. Go to your app service → **"Variables"** tab
  4. Add `DATABASE_URL` with the copied connection URL
- **Solution 4:** Ensure services are in the same project:
  - Both your app service and PostgreSQL service must be in the same Railway project
  - Railway only auto-injects `DATABASE_URL` when services are in the same project
- **For Scripts:** When running `railway run`, ensure you're in the correct project context:
  ```bash
  # Make sure you're in the right project
  railway link  # Link to your project if needed
  railway run npm run seed:account
  ```

**API Authentication Errors:**
- Verify `NEXT_PUBLIC_API_ACCOUNT_SID` and `NEXT_PUBLIC_API_KEY` in Vercel match the seeded values exactly
- Check for extra whitespace in environment variables
- Ensure account was seeded AFTER database was provisioned
- Verify API key is active: Check `isActive: true` in the database

## 🔄 Continuous Deployment

Both Railway and Vercel support automatic deployments:

- **Railway:** Automatically deploys on push to your main branch
- **Vercel:** Automatically deploys on push to your main branch

To disable auto-deploy, configure in each platform's settings.

## 📝 Local Development

Local development remains unchanged:

### Backend
```bash
cd ticket-management-api
npm install
npm run start:dev
```

### Frontend
```bash
cd v0-uix-ticket-qf
npm install
npm run dev
```

The application will use local environment variables from `.env` files (not committed to git).

## 🔐 Security Notes

1. **Never commit `.env` files** - They contain sensitive information
2. **Use strong API keys** in production - Generate new ones instead of using the default test values
3. **Enable HTTPS** - Both Railway and Vercel provide HTTPS by default
4. **Database SSL** - Always enabled in production (`DB_SSL=true`)
5. **CORS** - Only allow your production frontend URL

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Production Best Practices](https://docs.nestjs.com/techniques/configuration)

