# Yippee Mock Backend Server

A lightweight Express.js backend with comprehensive mock restaurant data for testing the Yippee frontend.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
node mock-server.js
```

Or add to package.json scripts:

```bash
npm run mock
```

### 3. Access the App

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

## 📊 Mock Data Overview

The server includes **5 diverse restaurants** with **15 menu items** covering various dietary preferences:

### Restaurants

1. **Green Garden Bistro** 🌱
   - Fully vegan restaurant
   - 4 items: Impossible Burger, Quinoa Power Bowl, Tofu Scramble, Vegan Chocolate Cake
   - Tags: vegan, high-protein, plant-protein, gluten-free

2. **Protein Palace** 💪
   - High-protein fitness food
   - 3 items: Chicken Power Bowl, Steak & Sweet Potato, Salmon & Quinoa
   - Tags: high-protein, meat-eater, customizable, meal-build

3. **Bella Italia** 🍝
   - Traditional Italian with GF options
   - 3 items: Margherita Pizza (GF), Penne Arrabbiata, Chicken Parmigiana
   - Tags: vegetarian, gluten-free, meat-eater

4. **Taco Fiesta** 🌮
   - Mexican street food
   - 3 items: Build Your Own Burrito, Vegan Tacos, Carne Asada Bowl
   - Tags: customizable, vegan, meat-eater, plant-protein

5. **Sunrise Cafe** ☕
   - All-day breakfast
   - 2 items: Protein Pancakes, Avocado Toast
   - Tags: high-protein, vegetarian, high-fiber

### Data Features

Each menu item includes:
- ✅ Complete nutrition facts (calories, protein, fat, carbs, fiber, sodium, sugar)
- ✅ Detailed ingredients list
- ✅ Allergen information
- ✅ Multiple dietary tags
- ✅ Short and long descriptions
- ✅ Portion sizes and meal types
- ✅ Customizable flags for meal-build items

## 📡 API Endpoints

### Get All Restaurants with Menus
```http
GET /api/all-restaurant-menus
```

**Response:**
```json
[
  {
    "restaurant_id": "rest-001",
    "restaurant_name": "Green Garden Bistro",
    "description": "A fully vegan restaurant...",
    "cuisine": "Vegan",
    "rating": 4.7,
    "menus": [
      {
        "menu_id": "menu-001",
        "menu_name": "All Day Menu",
        "items": [...]
      }
    ]
  }
]
```

### Get Single Restaurant
```http
GET /api/restaurants/:id
```

**Example:** `GET /api/restaurants/rest-001`

### Get Menu Item Nutrition
```http
GET /api/menu-items/:id/nutrition
```

**Example:** `GET /api/menu-items/item-001/nutrition`

**Response:**
```json
{
  "item_name": "Impossible Burger",
  "calories": 580,
  "protein_grams": 28,
  "fat_grams": 24,
  "carbohydrates_grams": 62,
  "fiber_grams": 12,
  "sodium_mg": 890,
  "sugar_grams": 8,
  "ingredients": ["Impossible patty", "Whole wheat bun", ...],
  "allergens": ["gluten", "soy"]
}
```

### Create Menu Item
```http
POST /api/menu-items
Content-Type: application/json

{
  "display_name": "New Item",
  "short_name": "Item",
  "item_description": "Description",
  "base_price": 12.99,
  "portion_size": "12 oz",
  "meal_type": "All Day",
  "tags": ["vegan", "high-protein"]
}
```

### Update Menu Item
```http
PUT /api/menu-items/:id
Content-Type: application/json

{
  "display_name": "Updated Name",
  "base_price": 14.99
}
```

### Delete Menu Item
```http
DELETE /api/menu-items/:id
```

### Search Restaurants
```http
GET /api/search?q=vegan&dietary=high-protein
```

**Query Parameters:**
- `q` - Search query (searches name, cuisine, menu items)
- `dietary` - Dietary filter tag(s)

### Get Stats
```http
GET /api/stats
```

**Response:**
```json
{
  "total_restaurants": 5,
  "total_menu_items": 15,
  "verified_restaurants": 3,
  "cuisines": ["Vegan", "Health Food", "Italian", "Mexican", "Breakfast"],
  "average_rating": "4.6"
}
```

### Health Check
```http
GET /api/health
```

## 🎯 Testing the Frontend

1. Start the mock server:
   ```bash
   node mock-server.js
   ```

2. Open browser to http://localhost:3000

3. Test features:
   - ✅ Browse all restaurants in the list view
   - ✅ Use global search (try "vegan", "protein", "pizza")
   - ✅ Apply dietary filters (Vegan, High-Protein, etc.)
   - ✅ Click restaurant cards to view details
   - ✅ Expand menu items with the ➕ button
   - ✅ Click "Show Nutrition" to see nutrition facts
   - ✅ Try "Make It" on customizable items
   - ✅ Add items to shopping cart
   - ✅ Create/edit/delete menu items (CRUD operations)

## 🔧 Customization

### Add More Restaurants

Edit `mock-server.js` and add to the `mockRestaurants` array:

```javascript
{
    restaurant_id: 'rest-006',
    restaurant_name: 'Your Restaurant',
    description: 'Description here',
    cuisine: 'Cuisine Type',
    // ... more fields
    menus: [
        {
            menu_id: 'menu-007',
            menu_name: 'Menu Name',
            items: [
                {
                    menu_item_id: 'item-016',
                    item_name: 'Item Name',
                    // ... item details
                }
            ]
        }
    ]
}
```

### Change Port

Set environment variable:
```bash
PORT=8080 node mock-server.js
```

Or edit the constant:
```javascript
const PORT = process.env.PORT || 3000;
```

### Add Custom Endpoints

Add new routes in the API Routes section:

```javascript
app.get('/api/my-endpoint', (req, res) => {
    res.json({ message: 'Custom endpoint' });
});
```

## 📝 Mock Data Details

### Tag System

The mock data uses these tags (matching UI guidelines):
- **Dietary**: vegan, vegetarian, meat-eater
- **Nutritional**: high-protein, low-carb, low-calorie, high-fiber
- **Protein Types**: protein, plant-protein
- **Allergen-Free**: gluten-free, dairy-free
- **Customization**: customizable, meal-build
- **Other**: dessert, spicy

### Nutrition Data

All items include complete nutrition information:
- Calories
- Protein (grams)
- Fat (grams)
- Carbohydrates (grams)
- Fiber (grams)
- Sodium (milligrams)
- Sugar (grams)

### Allergen Information

Common allergens tracked:
- gluten
- dairy
- eggs
- soy
- nuts
- fish
- shellfish
- sesame

### Customizable Items

Items tagged with "customizable" or "meal-build":
- Build Your Own Burrito (Taco Fiesta)
- Quinoa Power Bowl (Green Garden)
- Chicken Power Bowl (Protein Palace)

These items support the "Make It" auto-customization feature.

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 node mock-server.js
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### CORS Issues

The server has CORS enabled by default. If you still have issues:

```javascript
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));
```

### Data Not Loading

Check console logs:
```bash
# Server logs show all API calls
# Look for errors or 404s
```

Browser console (F12):
```javascript
// Check if API is reachable
fetch('http://localhost:3000/api/health')
    .then(r => r.json())
    .then(console.log);
```

## 📊 Sample Data Breakdown

### By Dietary Preference

- **Vegan Items**: 5 items (Green Garden + Taco Fiesta)
- **Vegetarian Items**: 5 items (includes vegan + others)
- **Meat-based Items**: 7 items (Protein Palace, Bella Italia, Taco Fiesta)
- **High-Protein Items**: 9 items (across all restaurants)
- **Gluten-Free Items**: 6 items (various restaurants)

### By Cuisine

- Vegan: 1 restaurant (4 items)
- Health Food: 1 restaurant (3 items)
- Italian: 1 restaurant (3 items)
- Mexican: 1 restaurant (3 items)
- Breakfast: 1 restaurant (2 items)

### By Price Range

- $ (Budget): 1 restaurant
- $$ (Moderate): 3 restaurants
- $$$ (Upscale): 1 restaurant

### Verified Status

- Verified: 3 restaurants
- Unverified: 2 restaurants

## 🎨 Frontend Integration

The mock backend is designed to work seamlessly with the Yippee frontend (`app.html`).

### Expected Data Format

The frontend expects this structure:

```javascript
{
    restaurant_id: string,
    restaurant_name: string,
    description: string,
    menus: [
        {
            menu_id: string,
            menu_name: string,
            items: [
                {
                    menu_item_id: string,
                    item_name: string,
                    description: string,
                    base_price: number,
                    tags: string[],
                    nutrition: object
                }
            ]
        }
    ]
}
```

All mock data follows this structure.

## 🚀 Production Considerations

This is a **mock backend for development/testing only**. For production:

1. **Replace with real database** (PostgreSQL, MongoDB, etc.)
2. **Add authentication** (JWT, OAuth)
3. **Implement data validation** (Joi, Yup)
4. **Add request rate limiting**
5. **Implement proper error handling**
6. **Add logging** (Winston, Morgan)
7. **Use environment variables** for sensitive data
8. **Add database migrations**
9. **Implement caching** (Redis)
10. **Add API documentation** (Swagger/OpenAPI)

## 📚 Related Files

- `public/app.html` - Frontend application
- `public/app.js` - Frontend JavaScript
- `public/app-styles.css` - Frontend styles
- `public/README.md` - Frontend documentation
- `QUICKSTART.md` - User guide
- `ui_guidelines.md` - UI/UX specifications

## 💡 Tips

1. **Use the stats endpoint** to verify data loaded correctly
2. **Check health endpoint** for server status
3. **Search endpoint** is great for testing filters
4. **Mock data persists** only in memory (resets on restart)
5. **Add console.log** statements to debug API calls
6. **Use Postman/Insomnia** to test endpoints directly

## 🎯 Next Steps

1. **Start the server** and test all endpoints
2. **Open the frontend** and verify data loads
3. **Test CRUD operations** (create, read, update, delete)
4. **Try search and filters** with various queries
5. **Add your own mock data** for specific testing needs
6. **Integrate with real database** when ready for production

---

**Happy Testing! 🍽️**

The mock backend provides everything you need to develop and test the Yippee frontend without a real database.

