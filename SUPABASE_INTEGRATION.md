# Supabase Integration Guide

This document explains how the Yippee Mock Backend Server integrates with Supabase for real database operations.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the `database_testing` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server Configuration
NODE_ENV=development
PORT=3000
```

**To get your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" for `SUPABASE_URL`
4. Copy the "anon/public" key for `SUPABASE_ANON_KEY`

### 2. Install Dependencies

```bash
cd database_testing
npm install
```

Dependencies include:
- `@supabase/supabase-js` - Supabase JavaScript client
- `dotenv` - Environment variable management
- `express` - Web server framework
- `cors` - CORS middleware

### 3. Start the Server

```bash
npm start
# or
npm run dev
```

The server will automatically detect if Supabase credentials are configured and use them. If not configured, it will fall back to mock data.

## API Endpoints

### 🏪 Restaurant Endpoints

#### Get All Restaurants with Menus
```http
GET /api/all-restaurant-menus
```

Returns all active restaurants with their menus, menu items, and nutrition information.

**Response Structure:**
```json
[
  {
    "restaurant_id": 1,
    "name": "Restaurant Name",
    "description": "Description",
    "phone": "(555) 123-4567",
    "website": "https://example.com",
    "average_price": 15.99,
    "is_verified": true,
    "menus": [
      {
        "menu_id": 1,
        "menu_name": "Lunch Menu",
        "menu_type": "Static",
        "is_active": true,
        "menu_items": [
          {
            "menu_item_id": 1,
            "display_name": "Burger",
            "item_description": "Delicious burger",
            "base_price": 12.99,
            "meal_type": "Lunch",
            "nutrition": { ... }
          }
        ]
      }
    ]
  }
]
```

#### Get Single Restaurant
```http
GET /api/restaurants/:id
```

Returns detailed information about a specific restaurant including menus, menu items, tags, allergens, and images.

#### Get Restaurant Images
```http
GET /api/restaurants/:id/images
```

Returns all images associated with a restaurant (exterior, interior, logo, etc.).

**Response Structure:**
```json
[
  {
    "restaurant_id": "rest-001",
    "image_id": 1,
    "is_exterior": true,
    "is_interior": false,
    "is_logo": false,
    "is_restaurant_entrance": false,
    "image": {
      "image_id": 1,
      "image_url": "https://...",
      "type": "restaurant",
      "alt_text": "Restaurant exterior",
      "is_verified": true,
      "quality_rating": 5
    }
  }
]
```

---

### 🍽️ Menu Item Endpoints

#### Get Menu Item Nutrition
```http
GET /api/menu-items/:id/nutrition
```

Returns detailed nutrition information, ingredients, and allergens for a menu item.

**Response Structure:**
```json
{
  "item_name": "Burger",
  "nutrition_id": 1,
  "calories": 580,
  "protein_grams": 28,
  "fat_grams": 24,
  "carbohydrates_grams": 62,
  "fiber_grams": 12,
  "sodium_mg": 890,
  "sugar_grams": 8,
  "ingredients": ["Beef patty", "Bun", "Lettuce", "Tomato"],
  "allergens": ["gluten", "dairy"]
}
```

#### Create Menu Item
```http
POST /api/menu-items
```

**Request Body:**
```json
{
  "menu_id": 1,
  "display_name": "New Item",
  "item_description": "Description",
  "base_price": 14.99,
  "portion_size": "Regular",
  "meal_type": "All Day",
  "item_type": "Entree",
  "is_customizable": true,
  "nutrition": {
    "calories": 500,
    "protein_grams": 25,
    "fat_grams": 20,
    "carbohydrates_grams": 60,
    "fiber_grams": 10,
    "sodium_mg": 800,
    "sugar_grams": 8
  }
}
```

**Response:**
```json
{
  "success": true,
  "menu_item_id": 123,
  "message": "Menu item created successfully",
  "data": { ... }
}
```

#### Update Menu Item
```http
PUT /api/menu-items/:id
```

Update any field of a menu item. Only include fields you want to update.

**Request Body:**
```json
{
  "display_name": "Updated Name",
  "base_price": 15.99,
  "is_active": true
}
```

#### Delete Menu Item (Soft Delete)
```http
DELETE /api/menu-items/:id
```

Performs a soft delete by setting `is_active` to `false`.

#### Get Menu Item Images
```http
GET /api/menu-items/:id/images
```

Returns all images for a specific menu item.

#### Add Image to Menu Item
```http
POST /api/menu-items/:id/images
```

**Request Body:**
```json
{
  "image_url": "https://...",
  "type": "food",
  "alt_text": "Description of image",
  "is_generated": false,
  "is_verified": true,
  "quality_rating": 5,
  "display_order": 0
}
```

---

### 🎛️ Customization Endpoints

#### Get Menu Item Customizations
```http
GET /api/menu-items/:id/customizations
```

Returns all customization options for a menu item (e.g., "Choose Protein", "Add Toppings").

**Response Structure:**
```json
[
  {
    "menu_item_id": 1,
    "option_id": 10,
    "is_required": true,
    "display_order": 0,
    "option_type": "Single",
    "custom_option": {
      "option_id": 10,
      "name": "Choose Protein",
      "option_description": "Select your protein",
      "is_active": true,
      "option_values": [
        {
          "value_id": 101,
          "value_name": "Chicken",
          "default_portion": "8oz",
          "is_available": true,
          "display_order": 0,
          "nutrition": { ... }
        }
      ]
    }
  }
]
```

#### Get Option Values
```http
GET /api/custom-options/:id/values
```

Returns all available values for a specific customization option.

#### Create Option Value
```http
POST /api/custom-options/:id/values
```

**Request Body:**
```json
{
  "value_name": "Tofu",
  "default_portion": "6oz",
  "is_available": true,
  "display_order": 3,
  "twelve_word_description": "Organic tofu grilled to perfection",
  "nutrition_id": 25
}
```

---

### 🔍 Search & Stats Endpoints

#### Search Restaurants
```http
GET /api/search?q=burger&dietary=vegan
```

Search restaurants by name, cuisine, or menu items. Filter by dietary preferences.

#### Get Stats
```http
GET /api/stats
```

Returns database statistics (total restaurants, menu items, verified restaurants, etc.).

#### Health Check
```http
GET /api/health
```

Returns server health status and whether database is connected.

---

## Database Schema Integration

The integration maps to your Supabase schema as follows:

### Core Tables Used

1. **restaurant** - Restaurant information
2. **menu** - Restaurant menus
3. **menu_item** - Individual menu items
4. **nutrition** - Nutritional information
5. **custom_option** - Customization options (e.g., "Choose Size")
6. **option_value** - Values for options (e.g., "Small", "Medium", "Large")
7. **menu_item_customization** - Links menu items to their customization options
8. **image** - Image storage
9. **menu_item_image** - Links images to menu items
10. **restaurant_image** - Links images to restaurants
11. **allergen** - Allergen information
12. **ingredient** - Ingredient details
13. **tag** - Tags for categorization

### Relationship Queries

The integration uses Supabase's powerful relationship queries to fetch nested data in a single request. For example:

```javascript
// Get restaurant with all nested data
const { data } = await supabase
  .from('restaurant')
  .select(`
    *,
    menus:menu(
      *,
      menu_items:menu_item(
        *,
        nutrition:nutrition(*),
        menu_item_tags:menu_item_tag(
          tag:tag(*)
        )
      )
    )
  `)
  .eq('restaurant_id', id)
  .single();
```

---

## Fallback Behavior

If Supabase credentials are not configured or the connection fails, the server automatically falls back to mock data. This ensures the API remains functional during development or if the database is unavailable.

**Console Output:**
```
⚠️  WARNING: Supabase credentials not found in environment variables!
   Please create a .env file with SUPABASE_URL and SUPABASE_ANON_KEY
   Falling back to mock data...
```

---

## Error Handling

All Supabase endpoints include comprehensive error handling:

- **404 Errors**: When resources are not found (PGRST116 error code)
- **500 Errors**: For database connection or query errors
- **Validation Errors**: For invalid data submissions

**Example Error Response:**
```json
{
  "error": "Failed to fetch menu item",
  "details": "relation \"menu_item\" does not exist"
}
```

---

## Testing

### Test Supabase Connection

```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-04T12:00:00.000Z",
  "restaurants_loaded": 5
}
```

### Test Menu Item Creation

```bash
curl -X POST http://localhost:3000/api/menu-items \
  -H "Content-Type: application/json" \
  -d '{
    "menu_id": 1,
    "display_name": "Test Item",
    "base_price": 9.99,
    "meal_type": "All Day",
    "item_type": "Entree"
  }'
```

---

## Deployment Notes

For Vercel deployment, make sure to:

1. Add environment variables in Vercel dashboard
2. The server exports as a serverless function: `module.exports = app;`
3. Uses `serverless-http` for compatibility

---

## Support

For issues or questions:
- Check Supabase logs in your project dashboard
- Review server console output for detailed error messages
- Verify your database schema matches the expected structure

