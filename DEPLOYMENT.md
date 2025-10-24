# Vercel Deployment Guide for Yippee App

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier available)
2. [Vercel CLI](https://vercel.com/cli) installed (optional, but recommended)
3. Your Supabase credentials
4. API keys for Groq and Pollinations.ai

## Step-by-Step Deployment

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Prepare for Vercel deployment"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables**
   - In the import screen, add these environment variables:
     - `SUPABASE_URL` - Your Supabase project URL
     - `SUPABASE_KEY` - Your Supabase anon/public key
     - `GROQ_API_KEY` - Your Groq API key
     - `POLLINATIONS_API_KEY` - Your Pollinations.ai API key

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from the database_testing directory**
   ```bash
   cd database_testing
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? Yes
   - Which scope? Select your account
   - Link to existing project? No (first time)
   - Project name? (Accept default or customize)
   - Directory? ./ (current directory)

5. **Add Environment Variables**
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_KEY
   vercel env add GROQ_API_KEY
   vercel env add POLLINATIONS_API_KEY
   ```
   
   Or add them via the Vercel dashboard at:
   `https://vercel.com/your-username/your-project/settings/environment-variables`

6. **Redeploy with environment variables**
   ```bash
   vercel --prod
   ```

## Environment Variables Setup

### Required Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_KEY` | Your Supabase anon key | Supabase Dashboard → Settings → API |
| `GROQ_API_KEY` | API key for Groq AI | [console.groq.com](https://console.groq.com) |
| `POLLINATIONS_API_KEY` | API key for Pollinations.ai | [pollinations.ai](https://pollinations.ai) |

### How to Add in Vercel Dashboard

1. Go to your project on Vercel
2. Navigate to Settings → Environment Variables
3. Add each variable:
   - Name: `SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Environment: Production (check all if needed)
4. Click "Save"
5. Redeploy your project for changes to take effect

## Post-Deployment Configuration

### 1. Update Frontend API Base URL

If your frontend is making API calls, update the API base URL in `public/app.js`:

```javascript
const CONFIG = {
    API_BASE: 'https://your-app.vercel.app/api',
    // ... rest of config
};
```

### 2. Configure CORS (if needed)

The server already includes CORS configuration. If you need to restrict origins, update `server.js`:

```javascript
const cors = require('cors');
app.use(cors({
    origin: 'https://your-frontend-domain.com',
    credentials: true
}));
```

### 3. Update Supabase Settings

If you're using Supabase auth or RLS policies, add your Vercel domain to allowed origins:
- Supabase Dashboard → Authentication → URL Configuration
- Add: `https://your-app.vercel.app`

## Troubleshooting

### Build Fails

**Issue:** Module not found errors
- **Solution:** Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Issue:** Environment variables not found
- **Solution:** Add them in Vercel dashboard and redeploy

### Runtime Errors

**Issue:** 500 errors on API endpoints
- **Solution:** Check Vercel function logs:
  - Go to your project dashboard
  - Click "Deployments"
  - Select the latest deployment
  - View "Function Logs"

**Issue:** Database connection fails
- **Solution:** Verify Supabase credentials are correct
- Check if Supabase allows connections from Vercel IPs (should be allowed by default)

### Menu Processor Issue

The current `server.js` imports a `menu-processor` module that appears to be empty or incomplete. If you encounter errors related to this:

1. **Option A:** Implement the menu processor functionality
2. **Option B:** Comment out the import and endpoint if not needed:

```javascript
// const { processMenuWithGroq } = require('./menu-processor');

// And comment out or remove the endpoint:
// app.post('/api/process-menu', async (req, res) => { ... })
```

## Testing Your Deployment

1. **Health Check**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. **Test an API endpoint**
   ```bash
   curl https://your-app.vercel.app/api/all-restaurant-menus
   ```

3. **Open in browser**
   ```
   https://your-app.vercel.app
   ```

## Custom Domain (Optional)

1. Go to your project on Vercel
2. Navigate to Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL certificate

## Continuous Deployment

Once connected to GitHub/GitLab/Bitbucket:
- Every push to `main` branch automatically deploys to production
- Pull requests create preview deployments
- View deployment status in Vercel dashboard

## Performance Tips

1. **Enable Edge Caching** - Add cache headers to static responses
2. **Optimize Images** - Use Vercel's built-in image optimization
3. **Monitor Usage** - Check Vercel dashboard for function execution times
4. **Set up Monitoring** - Enable Vercel Analytics in project settings

## Costs

- Free tier includes:
  - 100GB bandwidth
  - 100GB-hrs serverless function execution
  - Automatic HTTPS
  - Preview deployments
  
- Check [Vercel Pricing](https://vercel.com/pricing) for current limits

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Supabase + Vercel Guide](https://supabase.com/docs/guides/getting-started/quickstarts/vercel)

---

## Quick Deploy Checklist

- [ ] Code pushed to Git repository
- [ ] `vercel.json` file present
- [ ] All dependencies in `package.json`
- [ ] Environment variables documented
- [ ] Import project to Vercel
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test endpoints
- [ ] Update frontend API URLs (if needed)
- [ ] Configure custom domain (optional)

---

**You're ready to deploy! 🚀**

Run `vercel` in the `database_testing` directory to get started.

