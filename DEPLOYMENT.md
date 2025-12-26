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
4. The `DATABASE_URL` environment variable will be automatically set

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

**Note:** Replace `https://your-frontend-app.vercel.app` with your actual Vercel deployment URL (you'll get this after deploying the frontend).

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

### Step 6: Run Database Migrations

After the first deployment, run the topic migration:

1. Go to Railway project → **"Deployments"**
2. Click on the latest deployment
3. Open the **"Logs"** tab
4. Or use Railway CLI:
   ```bash
   railway run npm run migrate:topics
   ```

### Step 7: Seed Test Account (Optional)

To create a test account:

```bash
railway run npm run seed:account
```

This creates:
- Account SID: `AC123456789`
- API Key: `sk_live_abc123xyz456`

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

## ✅ Verification

### Test Backend

1. Visit your Railway URL: `https://your-api.up.railway.app/health`
2. Should return: `{"ok":true}`

### Test Frontend

1. Visit your Vercel URL
2. Try creating a ticket
3. Verify API calls work correctly

### Common Issues

**CORS Errors:**
- Ensure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check for trailing slashes
- Verify the URL includes `https://`

**Database Connection Errors:**
- Verify `DATABASE_URL` is set (Railway sets this automatically)
- Check `DB_SSL=true` is set
- Ensure database is provisioned and running

**API Authentication Errors:**
- Verify `NEXT_PUBLIC_API_ACCOUNT_SID` and `NEXT_PUBLIC_API_KEY` match the seeded values
- Check that the account was seeded in the backend

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

