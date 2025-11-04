# Getting Started with Supabase Integration

## 🎯 Three Simple Steps

### Step 1: Configure Environment (2 minutes)

1. Copy the template:
```bash
cp env.template .env
```

2. Get your Supabase credentials:
   - Go to https://supabase.com
   - Open your project
   - Settings ⚙️ → API
   - Copy **Project URL** and **anon public key**

3. Edit `.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

### Step 2: Start Server (30 seconds)

```bash
npm install  # First time only
npm start
```

Look for:
```
🗄️  Database: Supabase ✅
✅ Server running on http://localhost:3000
```

### Step 3: Test It (1 minute)

```bash
# Open in browser:
http://localhost:3000/api/health

# Or use curl:
curl http://localhost:3000/api/all-restaurant-menus
```

---

## 🎨 Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR APPLICATION                        │
│                                                             │
│  Frontend (app.html) ←→ API Server (mock-server.cjs)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ Supabase Client
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ restaurant   │  │ menu         │  │ menu_item    │    │
│  │──────────────│  │──────────────│  │──────────────│    │
│  │ id           │  │ id           │  │ id           │    │
│  │ name         │  │ name         │  │ display_name │    │
│  │ description  │  │ restaurant_id│  │ menu_id      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ nutrition    │  │ image        │  │ custom_option│    │
│  │──────────────│  │──────────────│  │──────────────│    │
│  │ id           │  │ id           │  │ id           │    │
│  │ calories     │  │ image_url    │  │ name         │    │
│  │ protein_grams│  │ type         │  │ description  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 API Quick Reference Card

### Get Data

```bash
# All restaurants with menus
GET /api/all-restaurant-menus

# Single restaurant (replace {id})
GET /api/restaurants/1

# Menu item nutrition
GET /api/menu-items/1/nutrition

# Menu item images
GET /api/menu-items/1/images

# Customization options
GET /api/menu-items/1/customizations

# Option values
GET /api/custom-options/1/values
```

### Create/Update Data

```bash
# Create menu item
POST /api/menu-items
{
  "menu_id": 1,
  "display_name": "New Dish",
  "base_price": 15.99,
  "meal_type": "Dinner",
  "item_type": "Entree"
}

# Update menu item
PUT /api/menu-items/1
{
  "display_name": "Updated Name",
  "base_price": 17.99
}

# Add image to menu item
POST /api/menu-items/1/images
{
  "image_url": "https://example.com/image.jpg",
  "alt_text": "Delicious dish"
}

# Delete menu item (soft delete)
DELETE /api/menu-items/1
```

---

## 🎓 Example Usage

### Fetch Restaurant with All Data

```javascript
// GET /api/restaurants/1
// Returns:
{
  "restaurant_id": 1,
  "name": "Best Restaurant",
  "description": "Amazing food",
  "menus": [
    {
      "menu_id": 1,
      "menu_name": "Lunch Menu",
      "menu_items": [
        {
          "menu_item_id": 1,
          "display_name": "Burger",
          "base_price": 12.99,
          "nutrition": {
            "calories": 580,
            "protein_grams": 28
          }
        }
      ]
    }
  ]
}
```

### Create Menu Item with Nutrition

```javascript
// POST /api/menu-items
const response = await fetch('http://localhost:3000/api/menu-items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    menu_id: 1,
    display_name: "Grilled Salmon",
    base_price: 24.99,
    meal_type: "Dinner",
    item_type: "Entree",
    nutrition: {
      calories: 450,
      protein_grams: 45,
      fat_grams: 20,
      carbohydrates_grams: 10
    }
  })
});

// Returns:
{
  "success": true,
  "menu_item_id": 123,
  "message": "Menu item created successfully"
}
```

### Get Customizations for Build-Your-Own Items

```javascript
// GET /api/menu-items/5/customizations
// Returns options like "Choose Protein", "Add Toppings", etc.
[
  {
    "option_id": 10,
    "name": "Choose Protein",
    "is_required": true,
    "custom_option": {
      "option_values": [
        { "value_id": 1, "value_name": "Chicken" },
        { "value_id": 2, "value_name": "Tofu" },
        { "value_id": 3, "value_name": "Beef" }
      ]
    }
  }
]
```

---

## 🚨 Common Issues & Solutions

### ❌ "Supabase credentials not found"
**Solution:** Create `.env` file with correct variable names

### ❌ "Failed to fetch restaurants"
**Solution:** Check Supabase project is active and credentials are correct

### ❌ Empty results
**Solution:** Verify you have data in your Supabase tables

### ❌ "PGRST116" error
**Solution:** The requested ID doesn't exist in database

---

## ✅ Success Checklist

- [ ] Created `.env` file with Supabase credentials
- [ ] Ran `npm install`
- [ ] Started server with `npm start`
- [ ] Saw "Database: Supabase ✅" in console
- [ ] Tested `/api/health` endpoint
- [ ] Successfully fetched restaurant data

---

## 🎉 You're Ready!

Your server is now connected to Supabase. All API calls will:
1. Query your real database
2. Return actual data
3. Support full CRUD operations
4. Include relationships (menus, items, nutrition, etc.)

**Next Steps:**
- Test the API endpoints
- Add more menu items
- Upload images
- Customize your restaurants

**Need More Help?**
- Read [SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md) for detailed API docs
- Check [SETUP.md](./SETUP.md) for troubleshooting
- Review [README.md](./README.md) for complete reference

---

## 📞 Quick Command Reference

```bash
# Start server
npm start

# Check health
npm run health

# Stop server (when running)
Ctrl + C

# View logs
# (automatically shown in terminal)

# Test endpoint
curl http://localhost:3000/api/health
```

---

**Happy Coding! 🚀**

