# Vercel Deployment Guide

## 🚀 Quick Deploy

### Prerequisites
- Install Vercel CLI: `npm i -g vercel`
- Have a Vercel account (sign up at https://vercel.com)

### Deployment Steps

1. **Install dependencies** (if not already done):
```bash
cd database_testing
npm install
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy to Vercel**:
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N** (first time)
- Project name? Press enter or choose a name
- In which directory is your code located? `./`
- Want to override settings? **N**

4. **Deploy to Production**:
```bash
vercel --prod
```

## 📋 Configuration Details

### Files Created
- `vercel.json` - Vercel configuration
- `.vercelignore` - Files to exclude from deployment
- `VERCEL_DEPLOYMENT.md` - This guide

### What's Deployed
- **Server**: `mock-server.js` (Express app with mock data)
- **Frontend**: Files in `public/` directory
- **API Endpoints**: All routes defined in mock-server.js

### API Endpoints Available
- `GET /api/all-restaurant-menus` - Get all restaurants with menus
- `GET /api/restaurants/:id` - Get single restaurant
- `GET /api/menu-items/:id/nutrition` - Get nutrition info
- `POST /api/menu-items` - Create menu item
- `PUT /api/menu-items/:id` - Update menu item
- `DELETE /api/menu-items/:id` - Delete menu item
- `GET /api/search?q=query&dietary=tag` - Search restaurants
- `GET /api/stats` - Get statistics
- `GET /api/health` - Health check
- `GET /` - Frontend application

## 🔧 Troubleshooting

### Issue: "Module not found"
**Solution**: Make sure all dependencies are in `package.json` and run `npm install`

### Issue: "Build failed"
**Solution**: Check that `mock-server.js` exports the Express app (it does: `module.exports = app;`)

### Issue: Static files not loading
**Solution**: Vercel automatically serves files from `public/` directory

### Issue: API routes returning 404
**Solution**: All routes are proxied through `mock-server.js` via the vercel.json configuration

## 🌐 After Deployment

Your app will be available at:
- `https://your-project-name.vercel.app`

Example endpoints:
- `https://your-project-name.vercel.app/` - Frontend
- `https://your-project-name.vercel.app/api/health` - Health check
- `https://your-project-name.vercel.app/api/all-restaurant-menus` - Get all data

## 📝 Environment Variables

If you later want to use the real backend (`server.js` with Supabase):

1. Update `vercel.json` to use `server.js` instead of `mock-server.js`
2. Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add: `SUPABASE_URL` and `SUPABASE_KEY`
3. Redeploy: `vercel --prod`

## 🔄 Continuous Deployment

### Connect to Git (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Every push to main branch auto-deploys

### Manual Deployment
Run `vercel --prod` whenever you want to deploy changes

## 📊 Monitoring

View logs and analytics:
```bash
vercel logs your-deployment-url
```

Or visit the Vercel dashboard: https://vercel.com/dashboard

## ⚡ Performance Tips

1. **Serverless Cold Starts**: First request may be slower (~1-2s)
2. **Data Persistence**: Mock data resets on each deployment
3. **For Production**: Consider using a real database (Supabase, MongoDB, etc.)

## 🛠️ Local Testing

Test the production build locally:
```bash
vercel dev
```

This runs your app in a local Vercel environment.

