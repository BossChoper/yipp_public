# Yippee Backend API

A Node.js/Express backend API for the Yippee food discovery application, powered by Supabase.

## 🚀 Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env` file (see `ENV_SETUP.md` for details):
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   GROQ_API_KEY=your_groq_key
   POLLINATIONS_API_KEY=your_pollinations_key
   PORT=3000
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   
   Or use the mock server for testing:
   ```bash
   npm run mock
   ```

4. **Access the app**
   ```
   http://localhost:3000
   ```

## 📦 Deployment

### Deploy to Vercel

See **`DEPLOYMENT.md`** for complete Vercel deployment instructions.

**Quick deploy:**
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## 📁 Project Structure

```
database_testing/
├── server.js           # Main Express server with Supabase integration
├── mock-server.js      # Mock server with sample data for testing
├── package.json        # Dependencies and scripts
├── vercel.json         # Vercel configuration
├── .env               # Environment variables (not committed)
├── public/            # Frontend static files
│   ├── app.html       # Main frontend application
│   ├── app.js         # Frontend JavaScript
│   └── app-styles.css # Frontend styles
├── routes/            # API route handlers (if using modular structure)
└── server/            # Server utilities
    └── menu-processor.js  # Menu processing utilities
```

## 🛠️ API Endpoints

### Restaurant & Menu Endpoints

- `GET /api/all-restaurant-menus` - Get all restaurants with menus
- `GET /api/protein-custom-menu-items` - Get menu items with protein customization
- `GET /api/protein-options-with-portions` - Get protein options with portion calculations

### Customization Endpoints

- `GET /api/custom-option-values/:optionId` - Get values for a custom option
- `GET /api/toppings-option-values/:optionId` - Get top 3 toppings by protein
- `GET /api/random-option-value/:menuItemId` - Get random customization for item

### Allergen Endpoints

- `GET /api/menu-item-allergen/:menuItemId/:allergenId` - Check item for allergen
- `GET /api/swap-option-value-allergen/:menuItemId/:allergenId` - Swap allergen option

### Order & Translation Endpoints

- `GET /api/order-script/:menuItemId` - Generate order script
- `GET /api/order-script-translated/:menuItemId/:language` - Generate translated order script
- `GET /api/generate-menu-image/:menuItemId` - Generate AI image for menu item

### Frontend Routes

- `GET /` - Home page
- `GET /map` - Restaurant map view
- `GET /restaurants` - Restaurant list view
- `GET /restaurant/:id` - Individual restaurant page
- `GET /upload` - Admin upload page

## 🔧 Technologies

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Supabase** - PostgreSQL database and backend services
- **Groq AI** - Translation services
- **Pollinations.ai** - Image generation
- **dotenv** - Environment variable management

## 📖 Documentation Files

- **START_HERE.md** - Complete setup and feature guide
- **DEPLOYMENT.md** - Vercel deployment instructions
- **ENV_SETUP.md** - Environment variables guide
- **MOCK_BACKEND.md** - Mock server documentation
- **QUICKSTART.md** - User guide for the app
- **ui_guidelines.md** - UI/UX specifications

## 🧪 Testing

### Test with Mock Server

```bash
npm run mock
```

The mock server includes 5 sample restaurants with complete data.

### Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Get all restaurants
curl http://localhost:3000/api/all-restaurant-menus

# Get protein options
curl http://localhost:3000/api/protein-custom-menu-items
```

## 🔐 Environment Variables

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon key
- `GROQ_API_KEY` - Groq AI API key (for translations)
- `POLLINATIONS_API_KEY` - Pollinations.ai key (for images)

Optional:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

### Database Connection Issues

1. Verify Supabase credentials in `.env`
2. Check Supabase project is active
3. Ensure database tables are created (see schema.txt)

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notes

- The `menu-processor.js` module is currently not implemented (commented out in server.js)
- Frontend files are served from the `public/` directory
- CORS is enabled for all origins (configure for production)
- The server uses Supabase's auto-generated REST API through the JS client

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with mock server
4. Submit a pull request

## 📄 License

ISC

---

**For deployment instructions, see `DEPLOYMENT.md`**

**For environment setup, see `ENV_SETUP.md`**

