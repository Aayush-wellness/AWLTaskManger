# Vercel Deployment Fix Guide

## Current Issues
- 404 errors: Routes not found
- 500 errors: Server errors (likely environment variables)

## Step 1: Configure Environment Variables in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add these variables:

```
MONGODB_URI = mongodb+srv://emp_task_db:Colab123@cluster0.4ph63nw.mongodb.net/emptaskdb?retryWrites=true&w=majority
JWT_SECRET = your_super_secret_jwt_key_change_this_in_production_12345
NODE_ENV = production
PORT = 5000
```

## Step 2: Redeploy

After adding environment variables:
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger deployment

## Step 3: Test API Endpoints

After deployment, test these URLs:
- `https://your-app.vercel.app/api/health` - Should return status info
- `https://your-app.vercel.app/api/auth/login` - Should handle login requests

## Step 4: Check Logs

If still having issues:
1. Go to Vercel dashboard → Functions tab
2. Click on your server function
3. Check the logs for detailed error messages

## Common Issues & Solutions

### 404 Errors
- Make sure all API routes start with `/api/`
- Check that route files exist in server/routes/
- Verify vercel.json routing configuration

### 500 Errors
- Usually caused by missing environment variables
- Check MongoDB connection string
- Verify all required dependencies are in package.json

### Build Errors
- Make sure client builds successfully: `cd client && npm run build`
- Check for any missing dependencies
- Verify all imports are correct

## Testing Locally vs Production

Local test:
```bash
npm run build
npm start
```

This should work the same as production.