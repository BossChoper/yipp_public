# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] `vercel.json` created ✅
- [x] `.vercelignore` created ✅
- [x] `package.json` updated with correct main file ✅
- [x] `.gitignore` updated ✅
- [x] Express app exports correctly (`module.exports = app;`) ✅

## 📦 Quick Start Commands

```bash
# 1. Make sure you're in the right directory
cd database_testing

# 2. Install Vercel CLI (if not already installed)
npm install -g vercel

# 3. Login to Vercel
vercel login

# 4. Preview deployment (staging)
vercel

# 5. Production deployment
vercel --prod
```

## 🧪 Test Locally First

Before deploying, test locally:

```bash
# Start the server locally
npm start

# Test in browser or with curl:
# Health check
curl http://localhost:3000/api/health

# Get all restaurants
curl http://localhost:3000/api/all-restaurant-menus

# Search
curl "http://localhost:3000/api/search?q=vegan"
```

## 🌐 After Deployment

Your deployment URL will look like:
- **Preview**: `https://database-testing-xxxx.vercel.app`
- **Production**: `https://database-testing.vercel.app`

### Test Your Deployed App

```bash
# Replace YOUR_URL with your actual Vercel URL
curl https://YOUR_URL.vercel.app/api/health
curl https://YOUR_URL.vercel.app/api/all-restaurant-menus
```

## 🔧 Configuration Files

### `vercel.json`
- Routes all requests to `mock-server.js`
- Uses `@vercel/node` builder
- Sets production environment

### `package.json`
- Main entry: `mock-server.js`
- Node version: `>=18.x`
- Start script points to mock server

## 📊 What Gets Deployed

✅ **Included:**
- `mock-server.js` (main server)
- `public/` directory (frontend)
- `package.json` and `package-lock.json`
- Node modules (installed automatically)

❌ **Excluded:**
- `server.js`, `new_server.js`, `old_server.js`
- `node_modules` (rebuilt on Vercel)
- `.env` files
- Documentation files
- Git files

## 🎯 Expected Results

After deployment, you should have:
- ✅ Frontend accessible at root URL
- ✅ API endpoints working at `/api/*`
- ✅ 5 mock restaurants with full menu data
- ✅ Search functionality
- ✅ CRUD operations for menu items

## 🐛 Troubleshooting

**Issue**: Module not found
```bash
# Solution: Install dependencies
npm install
```

**Issue**: Port already in use (locally)
```bash
# Solution: Kill the process or change port
# Kill: lsof -ti:3000 | xargs kill -9
# Or change PORT in mock-server.js
```

**Issue**: Vercel deployment fails
```bash
# Solution: Check logs
vercel logs
# Or redeploy
vercel --prod --force
```

## 🔄 Updating Your Deployment

After making changes:

```bash
# Preview changes first
vercel

# If everything looks good, deploy to production
vercel --prod
```

## 📈 Next Steps

1. ✅ Deploy to Vercel
2. Test all API endpoints
3. Share the URL with your team
4. (Optional) Connect a custom domain
5. (Optional) Set up GitHub integration for auto-deploy

## 💡 Tips

- Use `vercel dev` to test in Vercel environment locally
- Check Vercel dashboard for analytics and logs
- Cold starts may take 1-2 seconds on first request
- Mock data resets on each deployment (expected behavior)

---

**Ready to deploy?** Run `vercel --prod` and you're live! 🎉


