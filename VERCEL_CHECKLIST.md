# ✅ Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment Checklist

### 📦 Files Ready

- [x] `vercel.json` - Vercel configuration file created
- [x] `package.json` - Updated with correct dependencies and scripts
- [x] `.vercelignore` - Files to ignore during deployment
- [x] `.gitignore` - Updated to include `.env` and `.vercel/`
- [x] `server.js` - Main server file (fixed imports)
- [x] `DEPLOYMENT.md` - Complete deployment guide
- [x] `ENV_SETUP.md` - Environment variables guide
- [x] `README.md` - Project documentation

### 🔧 Code Fixes

- [x] Added missing `axios` import to `server.js`
- [x] Added missing `axios` dependency to `package.json`
- [x] Added `cors` import and middleware to `server.js`
- [x] Fixed static file serving path
- [x] Commented out incomplete `menu-processor` import
- [x] Added Node.js version specification in `package.json`

### 📝 Environment Variables to Set in Vercel

- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_KEY` - Your Supabase anon/public key
- [ ] `GROQ_API_KEY` - Groq AI API key (for translations)
- [ ] `POLLINATIONS_API_KEY` - Pollinations.ai API key (for images)

## Deployment Steps

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   cd database_testing
   git init
   git add .
   git commit -m "Prepare for Vercel deployment"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect settings

3. **Add Environment Variables**
   - During import, add all required env vars
   - Or add them later in Settings → Environment Variables

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Test your deployment URL

### Option 2: Deploy via CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd database_testing
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_KEY
   vercel env add GROQ_API_KEY
   vercel env add POLLINATIONS_API_KEY
   ```

5. **Production Deploy**
   ```bash
   vercel --prod
   ```

## Post-Deployment Verification

### ✅ Test Endpoints

```bash
# Replace YOUR_VERCEL_URL with your actual Vercel URL

# Test basic route
curl https://YOUR_VERCEL_URL/

# Test API endpoint
curl https://YOUR_VERCEL_URL/api/all-restaurant-menus

# Test protein options
curl https://YOUR_VERCEL_URL/api/protein-custom-menu-items
```

### ✅ Check Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Select latest deployment
5. Click "View Function Logs"
6. Check for any errors

### ✅ Frontend Testing

1. Open your Vercel URL in browser
2. Verify:
   - [ ] Home page loads
   - [ ] Navigation works (map, restaurants, etc.)
   - [ ] API calls succeed (check browser console)
   - [ ] Static files load (CSS, images)
   - [ ] No CORS errors

## Common Issues & Solutions

### ❌ Build Fails

**Problem:** Module not found errors

**Solution:**
```bash
# Ensure all dependencies are in package.json
npm install
# Test locally
npm start
```

### ❌ 500 Errors

**Problem:** Server crashes on startup

**Solution:**
- Check environment variables are set in Vercel
- Review function logs for error messages
- Verify Supabase credentials are correct

### ❌ CORS Errors

**Problem:** Frontend can't access API

**Solution:**
- CORS is now enabled in `server.js`
- If you need specific origins, update:
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

### ❌ Static Files 404

**Problem:** CSS/JS files not loading

**Solution:**
- Static file serving is now fixed in `server.js`
- Verify files are in `public/` directory
- Check `.vercelignore` isn't excluding them

### ❌ Database Connection Fails

**Problem:** Can't connect to Supabase

**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check Supabase project is active
- Test connection locally first

## Performance Optimization

### After Successful Deployment

- [ ] Enable Vercel Analytics (Settings → Analytics)
- [ ] Set up custom domain (Settings → Domains)
- [ ] Configure caching headers if needed
- [ ] Monitor function execution time
- [ ] Check bandwidth usage

### Recommended Settings

In `vercel.json`, you can add:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=60, stale-while-revalidate" }
      ]
    }
  ]
}
```

## Security Checklist

- [ ] Environment variables stored in Vercel (not in code)
- [ ] `.env` file is gitignored
- [ ] Supabase RLS (Row Level Security) enabled
- [ ] API rate limiting configured (if needed)
- [ ] CORS configured for specific origins (production)
- [ ] No sensitive data in logs

## Monitoring

### Set Up Alerts

1. Vercel Dashboard → Project Settings
2. Configure:
   - Error alerts
   - Performance alerts
   - Usage alerts

### Regular Checks

- Weekly: Check function logs for errors
- Monthly: Review bandwidth and function usage
- As needed: Update dependencies

## Rollback Plan

If deployment has issues:

1. **Via Dashboard:**
   - Go to Deployments
   - Find previous working deployment
   - Click "Promote to Production"

2. **Via CLI:**
   ```bash
   vercel rollback
   ```

## Next Steps After Deployment

- [ ] Test all API endpoints
- [ ] Share URL with team
- [ ] Update documentation with live URL
- [ ] Set up custom domain (optional)
- [ ] Configure CI/CD for automatic deployments
- [ ] Add monitoring/logging service (optional)

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Supabase + Vercel Guide](https://supabase.com/docs/guides/getting-started/quickstarts/vercel)
- Project-specific help: See `DEPLOYMENT.md`

---

## Quick Command Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Check environment variables
vercel env ls

# Pull environment variables locally
vercel env pull

# Open project in browser
vercel open
```

---

**Ready to deploy! 🚀**

Start with: `vercel` in the `database_testing` directory

