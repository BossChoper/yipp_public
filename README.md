# Yippee Backend Server with Supabase Integration

A Node.js/Express API server that connects to Supabase to manage restaurant data, menus, menu items, nutrition information, customizations, and images.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp env.template .env
```

Edit `.env` with your Supabase credentials:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Start Server
```bash
npm start
```

Server will start on `http://localhost:3000`

### 4. Verify Connection
```bash
npm run health
# or
curl http://localhost:3000/api/health
```

## 📁 Project Structure

```
database_testing/
├── api/                          # Vercel serverless functions
│   └── mock-server.cjs          # Main API server (Vercel)
├── mock-server.cjs              # Main API server (Local)
├── public/                      # Frontend files
│   ├── app.html
│   ├── app.js
│   └── app-styles.css
├── schema/                      # Database schema
│   └── 11_3_schema.rtf
├── .env                         # Environment variables (create this)
├── env.template                 # Environment template
├── package.json
└── Documentation/
    ├── README.md                # This file
    ├── SETUP.md                 # Quick setup guide
    ├── SUPABASE_INTEGRATION.md  # Complete API docs
    └── INTEGRATION_SUMMARY.md   # What was implemented
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 3000) | No |

## 📚 API Documentation

### Quick Reference

**Restaurants:**
- `GET /api/all-restaurant-menus` - All restaurants with menus
- `GET /api/restaurants/:id` - Single restaurant
- `GET /api/restaurants/:id/images` - Restaurant images

**Menu Items:**
- `GET /api/menu-items/:id/nutrition` - Nutrition info
- `GET /api/menu-items/:id/images` - Item images
- `GET /api/menu-items/:id/customizations` - Customizations
- `POST /api/menu-items` - Create item
- `PUT /api/menu-items/:id` - Update item
- `DELETE /api/menu-items/:id` - Delete item

**Customizations:**
- `GET /api/custom-options/:id/values` - Option values
- `POST /api/custom-options/:id/values` - Create value

**Other:**
- `GET /api/search` - Search restaurants
- `GET /api/stats` - Database stats
- `GET /api/health` - Health check

### Detailed Documentation

See [SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md) for complete API documentation with request/response examples.

## 🗄️ Database Schema

The server integrates with these Supabase tables:

**Core Tables:**
- `restaurant` - Restaurant information
- `menu` - Restaurant menus
- `menu_item` - Menu items
- `nutrition` - Nutritional data
- `custom_option` - Customization options
- `option_value` - Option values
- `image` - Image storage
- `allergen` - Allergens
- `ingredient` - Ingredients
- `tag` - Tags

**Relationship Tables:**
- `menu_item_customization`
- `menu_item_image`
- `menu_item_allergen`
- `menu_item_ingredient`
- `menu_item_tag`
- `restaurant_image`
- `option_value_allergen`
- `option_value_ingredient`

Schema file: `schema/11_3_schema.rtf`

## 🎯 Features

### ✅ Implemented
- Complete CRUD for menu items
- Nutrition information with ingredients and allergens
- Customization options and values
- Image management for menu items and restaurants
- Nested relationship queries
- Automatic fallback to mock data
- Soft delete for menu items
- Comprehensive error handling

### 🔮 Future Enhancements
- Search with Supabase (currently uses mock data)
- Stats with Supabase (currently uses mock data)
- Image upload to Supabase Storage
- Real-time subscriptions
- Batch operations
- Authentication & RLS
- Pagination

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Get All Restaurants
```bash
curl http://localhost:3000/api/all-restaurant-menus
```

### Get Menu Item with Nutrition
```bash
curl http://localhost:3000/api/menu-items/1/nutrition
```

### Create Menu Item
```bash
curl -X POST http://localhost:3000/api/menu-items \
  -H "Content-Type: application/json" \
  -d '{
    "menu_id": 1,
    "display_name": "New Item",
    "base_price": 12.99,
    "meal_type": "All Day",
    "item_type": "Entree"
  }'
```

### Get Customizations
```bash
curl http://localhost:3000/api/menu-items/1/customizations
```

## 🚢 Deployment

### Local Development
```bash
npm start
```

### Vercel
```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- Settings > Environment Variables
- Add `SUPABASE_URL` and `SUPABASE_ANON_KEY`

The `vercel.json` is already configured for serverless deployment.

## 🐛 Troubleshooting

### Server shows "Mock Data (offline)"
- Check `.env` file exists in project root
- Verify credentials are correct
- Restart server after editing `.env`

### "PGRST116" errors
- The requested resource doesn't exist in database
- Check that you have data in your tables
- Verify the ID is correct

### "Failed to fetch"
- Check Supabase project is active
- Verify database tables exist
- Check Supabase logs for errors

### Empty results
- Verify `is_active` flags in database
- Check table relationships are set up correctly

## 📖 Additional Documentation

- **[SETUP.md](./SETUP.md)** - Step-by-step setup guide
- **[SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md)** - Complete API reference
- **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** - Implementation details
- **[env.template](./env.template)** - Environment variable template

## 🛠️ NPM Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start server |
| `npm run dev` | Start in development mode |
| `npm run health` | Check server health |
| `npm run mock` | Start with mock data |

## 📦 Dependencies

- `express` - Web server framework
- `@supabase/supabase-js` - Supabase client
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `serverless-http` - Serverless compatibility

## 🤝 Contributing

When adding new endpoints:
1. Add Supabase query with error handling
2. Include mock data fallback
3. Update server logs
4. Document in SUPABASE_INTEGRATION.md

## 📝 License

ISC

## 🔗 Links

- [Supabase Dashboard](https://supabase.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js](https://expressjs.com)

---

**Need help?** Check the documentation files or review console output for detailed error messages.

