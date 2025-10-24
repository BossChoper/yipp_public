# 🚀 Deploy to Vercel - Quick Start

**Your app is ready! Follow these steps to deploy:**

## Option 1: Deploy via Vercel Dashboard (5 minutes)

### 1. Push to GitHub

```bash
cd database_testing
git init
git add .
git commit -m "Ready for Vercel deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to **https://vercel.com/new**
2. Click **"Import Project"**
3. Select your GitHub repository
4. Vercel auto-detects settings ✅
5. Click **"Deploy"**

### 3. Add Environment Variables

After deployment, go to your project dashboard:

1. Click **Settings** → **Environment Variables**
2. Add these 4 variables:

```
SUPABASE_URL → Your Supabase project URL
SUPABASE_KEY → Your Supabase anon key
GROQ_API_KEY → Your Groq API key
POLLINATIONS_API_KEY → Your Pollinations API key
```

3. Click **"Redeploy"** to apply changes

### 4. Done! 🎉

Your app is live at: `https://your-project.vercel.app`

---

## Option 2: Deploy via CLI (3 minutes)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
cd database_testing
vercel login
vercel
```

Follow the prompts (accept defaults).

### 3. Add Environment Variables

Go to the Vercel dashboard URL shown, then:
- Settings → Environment Variables
- Add all 4 variables (see above)

### 4. Deploy to Production

```bash
vercel --prod
```

### 5. Done! 🎉

---

## Getting Your Environment Variable Values

### Supabase (SUPABASE_URL & SUPABASE_KEY)

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_KEY`

### Groq (GROQ_API_KEY)

1. Go to https://console.groq.com
2. Sign up or log in
3. Navigate to **API Keys**
4. Create new key → Copy it

### Pollinations.ai (POLLINATIONS_API_KEY)

1. Go to https://pollinations.ai
2. Sign up for API access
3. Get your API key

*(Note: Pollinations may not require a key - check their docs)*

---

## Test Your Deployment

After deploying, test these URLs (replace with your actual URL):

```bash
# Home page
https://your-project.vercel.app/

# API endpoint
https://your-project.vercel.app/api/all-restaurant-menus

# Protein options
https://your-project.vercel.app/api/protein-custom-menu-items
```

---

## Troubleshooting

### Build Fails?
- Check that you committed all files
- Verify package.json has all dependencies

### 500 Errors?
- Make sure all 4 environment variables are set
- Check Vercel function logs for details

### Need More Help?
- See `DEPLOYMENT.md` for detailed guide
- See `VERCEL_CHECKLIST.md` for step-by-step checklist
- See `ENV_SETUP.md` for environment variable help

---

## What's Already Done ✅

- ✅ Vercel configuration created
- ✅ All dependencies fixed
- ✅ CORS enabled
- ✅ Static files configured
- ✅ Code errors fixed
- ✅ Documentation created

You're ready to deploy right now!

---

**Start here:** `vercel` or push to GitHub

**Time to deploy:** ~5 minutes

**Cost:** FREE (Vercel free tier)

Let's go! 🚀

