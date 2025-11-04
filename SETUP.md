# Quick Setup Guide

## 1. Create Environment File

Create a `.env` file in the `database_testing` directory:

```bash
cd database_testing
touch .env
```

## 2. Add Your Supabase Credentials

Open the `.env` file and add:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=development
PORT=3000
```

### Finding Your Supabase Credentials:

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Click on the **Settings** icon (⚙️) in the left sidebar
4. Go to **API** section
5. Copy:
   - **Project URL** → Use as `SUPABASE_URL`
   - **anon public** key → Use as `SUPABASE_ANON_KEY`

## 3. Install Dependencies

```bash
npm install
```

## 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## 5. Test the Connection

Open your browser or use curl:

```bash
curl http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-04T...",
  "restaurants_loaded": X
}
```

If you see "Mock Data (offline)" in the server logs, check your `.env` file for typos.

## 6. Test API Endpoints

### Get All Restaurants
```bash
curl http://localhost:3000/api/all-restaurant-menus
```

### Get Specific Restaurant
```bash
curl http://localhost:3000/api/restaurants/1
```

### Get Menu Item Nutrition
```bash
curl http://localhost:3000/api/menu-items/1/nutrition
```

## Troubleshooting

### Issue: "Supabase credentials not found"
- Make sure `.env` file is in the `database_testing` directory
- Check for typos in variable names (they are case-sensitive)
- Ensure there are no spaces around the `=` sign

### Issue: "Failed to fetch restaurants"
- Verify your Supabase URL is correct
- Check that your anon key is valid
- Ensure your database schema has been applied
- Check Supabase project status

### Issue: "PGRST116" errors
- This means the resource wasn't found in the database
- Check that you have data in your Supabase tables
- Verify the ID you're requesting exists

## Next Steps

See [SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md) for:
- Complete API endpoint documentation
- Database schema details
- Advanced usage examples
- Deployment instructions

