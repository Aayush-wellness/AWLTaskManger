# Deployment Guide for Vercel

## Prerequisites
1. GitHub account
2. Vercel account (free tier works)
3. Your MongoDB Atlas database ready

## Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Make sure all files are committed including the new `vercel.json`

## Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it as a Node.js project

## Step 3: Configure Environment Variables
In Vercel dashboard, go to your project settings and add these environment variables:

```
MONGODB_URI = mongodb+srv://emp_task_db:Colab123@cluster0.4ph63nw.mongodb.net/emptaskdb?retryWrites=true&w=majority
JWT_SECRET = your_super_secret_jwt_key_change_this_in_production_12345
NODE_ENV = production
PORT = 5001
```

## Step 4: Deploy
1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at `https://your-project-name.vercel.app`

## Alternative: Backend-Only Deployment

If you prefer to deploy frontend and backend separately:

### Option A: Deploy Backend to Railway/Render
1. Create account on Railway.app or Render.com
2. Connect your GitHub repo
3. Deploy only the backend
4. Update your frontend API calls to use the deployed backend URL

### Option B: Deploy Frontend to Vercel, Backend to Heroku
1. Deploy backend to Heroku
2. Deploy frontend to Vercel
3. Update API endpoints in frontend

## Important Notes
- The current setup deploys both frontend and backend to Vercel
- Make sure your MongoDB Atlas allows connections from anywhere (0.0.0.0/0) for production
- Update CORS settings in your backend if needed for production domain