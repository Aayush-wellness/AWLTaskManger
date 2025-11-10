# Deployment Issues Fix - Step by Step

## 🚨 IMMEDIATE ACTIONS NEEDED

### 1. Set Environment Variables in Vercel Dashboard

**CRITICAL**: Go to your Vercel project → Settings → Environment Variables and add:

```
Name: MONGODB_URI
Value: mongodb+srv://emp_task_db:Colab123@cluster0.4ph63nw.mongodb.net/emptaskdb?retryWrites=true&w=majority

Name: JWT_SECRET
Value: your_super_secret_jwt_key_change_this_in_production_12345

Name: NODE_ENV
Value: production
```

### 2. Redeploy After Adding Variables

After adding environment variables:

- Go to Deployments tab in Vercel
- Click "Redeploy" on latest deployment
- Wait for deployment to complete

### 3. Test Your Deployment

Replace `YOUR_APP_URL` with your actual Vercel URL:

```bash
# Test health endpoint
curl https://YOUR_APP_URL.vercel.app/api/health

# Should return JSON with status info
```

## 🔍 DEBUGGING STEPS

### Check Function Logs

1. Go to Vercel Dashboard → Functions tab
2. Click on your server function
3. Check logs for errors

### Common Error Messages & Solutions

**"Cannot read property of undefined"**

- Missing environment variables
- Check Vercel environment variables are set

**"MongooseError: Operation buffering timed out"**

- MongoDB connection issue
- Verify MONGODB_URI is correct
- Check MongoDB Atlas allows connections from 0.0.0.0/0

**"Route not found" / 404 errors**

- API routes not properly configured
- Check vercel.json routing rules

## 🛠️ QUICK FIXES

### If Still Getting 500 Errors:

1. **Check MongoDB Connection**:

   - Go to MongoDB Atlas
   - Database Access → Make sure user exists
   - Network Access → Allow 0.0.0.0/0 (all IPs)

2. **Verify Route Files**:
   All these files should exist:
   - server/routes/auth.js
   - server/routes/departments.js
   - server/routes/projects.js
   - server/routes/tasks.js
   - server/routes/users.js
   - server/routes/projectVendors.js

### If Getting 404 Errors:

1. **Check API Calls**: All working (using relative paths like `/api/auth/login`)
2. **Verify Build**: Client should build to `client/build/`
3. **Check Routes**: vercel.json should handle SPA routing

## 📋 VERIFICATION CHECKLIST

- [ ] Environment variables added to Vercel
- [ ] Redeployed after adding variables
- [ ] MongoDB Atlas allows all IPs (0.0.0.0/0)
- [ ] All route files exist in server/routes/
- [ ] Client builds successfully
- [ ] API health endpoint returns 200
- [ ] Login page loads without errors
- [ ] Can make API calls from browser

## 🆘 IF STILL NOT WORKING

1. **Check Vercel Function Logs** for specific error messages
2. **Test locally**: `npm run build && npm start`
3. **Verify MongoDB connection** with a simple test script
4. **Check browser Network tab** for failed requests

Your app structure looks correct - this is likely just an environment variable configuration issue!
