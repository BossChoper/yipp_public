# API Quick Reference Card

## 🚀 Server Commands

```bash
npm start              # Start server
npm run health         # Check health
Ctrl + C              # Stop server
```

## 🌐 Base URL
```
Local: http://localhost:3000
```

---

## 📋 Restaurants

```bash
# Get all restaurants with menus
GET /api/all-restaurant-menus

# Get single restaurant
GET /api/restaurants/:id

# Get restaurant images
GET /api/restaurants/:id/images
```

---

## 🍽️ Menu Items

```bash
# Get nutrition info
GET /api/menu-items/:id/nutrition

# Get images
GET /api/menu-items/:id/images

# Get customizations
GET /api/menu-items/:id/customizations

# Create menu item
POST /api/menu-items
Content-Type: application/json
{
  "menu_id": 1,
  "display_name": "Item Name",
  "base_price": 15.99,
  "meal_type": "All Day",
  "item_type": "Entree",
  "nutrition": { ... }
}

# Update menu item
PUT /api/menu-items/:id
Content-Type: application/json
{
  "display_name": "New Name",
  "base_price": 17.99
}

# Delete menu item
DELETE /api/menu-items/:id
```

---

## 🎛️ Customizations

```bash
# Get option values
GET /api/custom-options/:id/values

# Create option value
POST /api/custom-options/:id/values
Content-Type: application/json
{
  "value_name": "Tofu",
  "default_portion": "6oz",
  "nutrition_id": 25
}
```

---

## 🖼️ Images

```bash
# Add image to menu item
POST /api/menu-items/:id/images
Content-Type: application/json
{
  "image_url": "https://...",
  "alt_text": "Description",
  "type": "food"
}
```

---

## 🔍 Other

```bash
# Search
GET /api/search?q=burger&dietary=vegan

# Stats
GET /api/stats

# Health check
GET /api/health
```

---

## 🎨 Response Codes

```
200 - Success
201 - Created
404 - Not Found
500 - Server Error
```

---

## 📊 Common Meal Types

```
All Day
Breakfast
Brunch
Lunch
Dinner
```

## 🍕 Common Item Types

```
Entree
Appetizer
Side
Dessert
Beverage
Special
```

---

## 💾 Environment Variables

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
NODE_ENV=development
PORT=3000
```

---

## ⚡ Quick Test Commands

```bash
# Health check
curl http://localhost:3000/api/health

# Get all restaurants
curl http://localhost:3000/api/all-restaurant-menus

# Get nutrition
curl http://localhost:3000/api/menu-items/1/nutrition

# Create item
curl -X POST http://localhost:3000/api/menu-items \
  -H "Content-Type: application/json" \
  -d '{"menu_id":1,"display_name":"Test","base_price":9.99,"meal_type":"All Day","item_type":"Entree"}'
```

---

## 🐛 Common Errors

```
"Supabase credentials not found"
→ Create .env file with credentials

"PGRST116"
→ Resource not found in database

"Failed to fetch"
→ Check Supabase connection
```

---

**Full Docs:** See `SUPABASE_INTEGRATION.md`

