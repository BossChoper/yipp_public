# Environment Variables Setup

Create a `.env` file in the `database_testing` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# API Keys
GROQ_API_KEY=your_groq_api_key_here
POLLINATIONS_API_KEY=your_pollinations_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

## How to Get These Values

### Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Log in or create an account
3. Create a new project or select existing one
4. Navigate to **Settings** → **API**
5. Copy:
   - **Project URL** → Use for `SUPABASE_URL`
   - **anon/public key** → Use for `SUPABASE_KEY`

### Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy the key → Use for `GROQ_API_KEY`

### Pollinations.ai API Key

1. Go to [pollinations.ai](https://pollinations.ai)
2. Sign up for an API key (if required)
3. Copy the key → Use for `POLLINATIONS_API_KEY`

**Note:** Pollinations.ai may not require an API key for basic usage. Check their current documentation.

## Local Development

1. Create the `.env` file with your credentials
2. Run the development server:
   ```bash
   npm start
   ```
3. Server will start on `http://localhost:3000`

## Production (Vercel)

Do not commit your `.env` file! Instead:

1. Add environment variables in Vercel dashboard
2. Go to your project → **Settings** → **Environment Variables**
3. Add each variable individually
4. Redeploy your application

See `DEPLOYMENT.md` for detailed Vercel setup instructions.

