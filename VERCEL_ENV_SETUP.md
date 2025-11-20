# 🔧 Vercel Environment Variables Setup

## ❌ Current Issue
Environment Variable "MONGODB_URI" references Secret "mongodb_uri", which does not exist.

## ✅ Solution
Remove the `env` section from `vercel.json` and set environment variables directly in Vercel Dashboard.

## 📋 Step-by-Step Setup

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Click on your project: `employeetask-gules`

### 2. Navigate to Environment Variables
- Click on **Settings** tab
- Click on **Environment Variables** in the sidebar

### 3. Add These Environment Variables

**Variable 1:**
- Name: `MONGODB_URI`
- Value: `mongodb+srv://emp_task_db:Colab123@cluster0.4ph63nw.mongodb.net/emptaskdb?retryWrites=true&w=majority`
- Environment: `Production`, `Preview`, `Development` (select all)

**Variable 2:**
- Name: `JWT_SECRET`
- Value: `your_super_secret_jwt_key_change_this_in_production_12345`
- Environment: `Production`, `Preview`, `Development` (select all)

**Variable 3:**
- Name: `NODE_ENV`
- Value: `production`
- Environment: `Production` (only production)

### 4. Save and Redeploy
- Click **Save** for each variable
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment

## 🔍 Verification

After deployment, test:
1. Health endpoint: `https://employeetask-gules.vercel.app/api/health`
2. Should show: `mongoUri: "Set"`, `jwtSecret: "Set"`, `mongoConnection: "Connected"`

## 📝 Important Notes

- **Don't use `@secret_name` syntax** in vercel.json unless you've created Vercel secrets
- **Environment variables in dashboard** are the standard approach
- **Remove the `env` section** from vercel.json (already done)
- **Redeploy after adding variables** for them to take effect

## 🚨 If Still Having Issues

1. **Double-check MongoDB Atlas**:
   - Network Access: Allow 0.0.0.0/0
   - Database Access: User `emp_task_db` exists
   - Connection string is correct

2. **Check Vercel Function Logs**:
   - Go to Functions tab in Vercel dashboard
   - Check server function logs for errors

3. **Test locally**:
   ```bash
   npm run build
   npm start
   ```
   Should work the same as production.