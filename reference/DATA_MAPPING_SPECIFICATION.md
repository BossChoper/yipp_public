# Yippee App - Data Mapping Specification Sheet

**Version:** 1.0  
**Schema Version:** 12_4  
**Last Updated:** December 11, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Layers](#architecture-layers)
3. [Core Entity Mappings](#core-entity-mappings)
4. [API Endpoints & Data Flow](#api-endpoints--data-flow)
5. [Frontend State Management](#frontend-state-management)
6. [Field Mapping Tables](#field-mapping-tables)
7. [Junction Tables Reference](#junction-tables-reference)
8. [Data Normalization Functions](#data-normalization-functions)

---

## Overview

This document provides a comprehensive mapping between the Supabase database schema, backend API (mock-server.cjs), and frontend application (app.js/app.html).

### Data Flow Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Supabase DB   │────▶│  Mock Server    │────▶│   Frontend      │
│   (12_4 Schema) │     │  (Express API)  │     │   (app.js)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
   Raw Tables            Normalized JSON          UI State/DOM
```

---

## Architecture Layers

### Layer 1: Database (Supabase)
- PostgreSQL database with normalized schema
- Uses junction tables for many-to-many relationships
- Primary keys: `*_id` (bigint, auto-generated)

### Layer 2: Backend API (mock-server.cjs)
- Express.js REST API
- Handles data transformation from DB → JSON
- Supports both Supabase and mock data fallback

### Layer 3: Frontend (app.js/app.html)
- Vanilla JavaScript with state management
- Normalizes API responses for consistent handling
- DOM rendering and user interactions

---

## Core Entity Mappings

### Restaurant Entity

| Layer | Field Name | Type | Description |
|-------|------------|------|-------------|
| **DB** | `restaurant.restaurant_id` | bigint | Primary key |
| **DB** | `restaurant.name` | text | Restaurant name |
| **DB** | `restaurant.description` | text | Restaurant description |
| **DB** | `restaurant.is_active` | boolean | Active status |
| **API** | `restaurant_id` | string | ID as string |
| **API** | `restaurant_name` | string | Alias for `name` |
| **API** | `description` | string | Direct mapping |
| **API** | `menus[]` | array | Nested menu objects |
| **Frontend** | `state.restaurants[]` | array | Normalized restaurant objects |
| **Frontend** | `restaurant.restaurant_id` | string | Used for lookups |
| **Frontend** | `restaurant.restaurant_name` | string | Display name |

### Menu Entity

| Layer | Field Name | Type | Description |
|-------|------------|------|-------------|
| **DB** | `menu.menu_id` | bigint | Primary key |
| **DB** | `menu.menu_name` | varchar | Menu name |
| **DB** | `menu.restaurant_id` | bigint | FK to restaurant |
| **DB** | `menu.menu_type` | enum | Static/Dynamic/Seasonal |
| **DB** | `menu.is_active` | boolean | Active status |
| **API** | `menu_id` | string | ID as string |
| **API** | `menu_name` | string | Direct mapping |
| **API** | `items[]` | array | Alias for menu_items |
| **API** | `menu_items[]` | array | Nested menu item objects |
| **Frontend** | `menu.menu_id` | string | Used in lookups |
| **Frontend** | `menu.menu_name` | string | Display name |
| **Frontend** | `menu.items[]` | array | Normalized items |

### Menu Item Entity

| Layer | Field Name | Type | Description |
|-------|------------|------|-------------|
| **DB** | `menu_item.menu_item_id` | bigint | Primary key |
| **DB** | `menu_item.display_name` | text | Full display name |
| **DB** | `menu_item.three_word_short_name` | text | Short name (3 words) |
| **DB** | `menu_item.item_description` | text | Brief description |
| **DB** | `menu_item.fifty_char_description` | text | 50-char description |
| **DB** | `menu_item.hundred_char_description` | text | 100-char description |
| **DB** | `menu_item.menu_id` | bigint | FK to menu |
| **DB** | `menu_item.is_customizable` | boolean | Has customizations |
| **DB** | `menu_item.meal_type` | enum | All Day/Breakfast/Lunch/Dinner |
| **DB** | `menu_item.item_type` | enum | Entree/Appetizer/Dessert/etc |
| **API** | `menu_item_id` | string | ID as string |
| **API** | `display_name` | string | From DB display_name |
| **API** | `item_name` | string | Alias for display_name |
| **API** | `item_description` | string | From DB |
| **API** | `current_price` | string | Formatted price (e.g., "12.99") |
| **API** | `diets[]` | array | Diet names from junction |
| **API** | `tags[]` | array | Alias for diets |
| **Frontend** | `item.menu_item_id` | string | Used for lookups |
| **Frontend** | `item.item_name` | string | Normalized from display_name |
| **Frontend** | `item.short_name` | string | From three_word_short_name |
| **Frontend** | `item.description` | string | Normalized description |
| **Frontend** | `item.long_description` | string | From hundred_char_description |
| **Frontend** | `item.base_price` | number | Parsed from current_price |
| **Frontend** | `item.tags[]` | array | Dietary/nutrition tags |

### Nutrition Entity

| Layer | Field Name | Type | Description |
|-------|------------|------|-------------|
| **DB** | `nutrition.nutrition_id` | integer | Primary key |
| **DB** | `nutrition.calories` | integer | Calorie count |
| **DB** | `nutrition.protein_grams` | numeric | Protein in grams |
| **DB** | `nutrition.fat_grams` | numeric | Fat in grams |
| **DB** | `nutrition.saturated_fat_grams` | numeric | Saturated fat |
| **DB** | `nutrition.carbohydrates_grams` | numeric | Carbs in grams |
| **DB** | `nutrition.sugar_grams` | numeric | Sugar in grams |
| **DB** | `nutrition.fiber_grams` | numeric | Fiber in grams |
| **DB** | `nutrition.sodium_mg` | integer | Sodium in mg |
| **DB** | `nutrition.cholesterol_mg` | integer | Cholesterol in mg |
| **API** | `nutrition.calories` | number | Direct mapping |
| **API** | `nutrition.protein_grams` | number | Direct mapping |
| **API** | `nutrition.fat_grams` | number | Direct mapping |
| **API** | `nutrition.carbohydrates_grams` | number | Direct mapping |
| **API** | `nutrition.fiber_grams` | number | Direct mapping |
| **API** | `nutrition.sodium_mg` | number | Direct mapping |
| **Frontend** | `item.nutrition.calories` | number | For display |
| **Frontend** | `item.nutrition.protein_grams` | number | For display |
| **Frontend** | `item.nutrition.fat_grams` | number | For display |
| **Frontend** | `item.nutrition.carbohydrates_grams` | number | For display |

### Ingredient Entity

| Layer | Field Name | Type | Description |
|-------|------------|------|-------------|
| **DB** | `ingredient.ingredient_id` | integer | Primary key |
| **DB** | `ingredient.name` | varchar | Ingredient name |
| **DB** | `ingredient.brand` | varchar | Brand name |
| **DB** | `ingredient.possible_allergens` | text | Comma-separated allergens |
| **DB** | `ingredient.is_vegan` | boolean | Vegan flag |
| **DB** | `ingredient.is_vegetarian` | boolean | Vegetarian flag |
| **DB** | `ingredient.is_gluten_free` | boolean | Gluten-free flag |
| **API** | `ingredients[].name` | string | Ingredient name |
| **API** | `ingredients[].brand` | string | Brand if applicable |
| **API** | `ingredients[].is_optional` | boolean | From junction table |
| **API** | `ingredients[].is_vegan` | boolean | Dietary flag |
| **Frontend** | (rendered in modal) | HTML | Checklist display |

### Allergen Entity

| Layer | Field Name | Type | Description |
|-------|------------|------|-------------|
| **DB** | `allergen.allergen_id` | bigint | Primary key |
| **DB** | `allergen.name` | varchar | Allergen name |
| **DB** | `allergen.allergen_description` | text | Description |
| **DB** | `allergen.contains_dairy` | boolean | Category flag |
| **DB** | `allergen.contains_gluten` | boolean | Category flag |
| **DB** | `allergen.contains_soy` | boolean | Category flag |
| **API** | `allergens[].name` | string | Allergen name |
| **API** | `allergens[].description` | string | From allergen_description |
| **API** | `allergens[].is_verified` | boolean | From junction |
| **Frontend** | (warning display) | HTML | Alert display |

### Custom Option Entity

| Layer | Field Name | Type | Description |
|-------|------------|------|-------------|
| **DB** | `custom_option.option_id` | integer | Primary key |
| **DB** | `custom_option.name` | text | Option name |
| **DB** | `custom_option.option_description` | text | Description |
| **DB** | `custom_option.option_type` | text | Single/Multiple |
| **API** | `customizations[].option_id` | number | ID |
| **API** | `customizations[].is_required` | boolean | From junction |
| **API** | `customizations[].custom_option.name` | string | Option name |
| **API** | `customizations[].custom_option.option_values[]` | array | Available values |
| **Frontend** | (Make It modal) | HTML | Option selection UI |

### Option Value Entity

| Layer | Field Name | Type | Description |
|-------|------------|------|-------------|
| **DB** | `option_value.value_id` | integer | Primary key |
| **DB** | `option_value.option_id` | integer | FK to custom_option |
| **DB** | `option_value.value_name` | text | Value name |
| **DB** | `option_value.twelve_word_description` | text | Description |
| **DB** | `option_value.is_available` | boolean | Availability flag |
| **DB** | `option_value.display_order` | integer | Sort order |
| **API** | `option_values[].value_id` | number | ID |
| **API** | `option_values[].value_name` | string | Display name |
| **API** | `option_values[].nutrition` | object | Enriched nutrition |
| **API** | `option_values[].diets[]` | array | Compatible diets |
| **API** | `option_values[].allergens[]` | array | Allergens present |
| **API** | `option_values[].price` | number | Additional price |
| **Frontend** | `.option-value-card` | HTML | Selection card |

### Price Entity

| Layer | Field Name | Type | Description |
|-------|------------|------|-------------|
| **DB** | `item_price.price_id` | bigint | Primary key |
| **DB** | `item_price.menu_item_id` | bigint | FK to menu_item |
| **DB** | `item_price.value_id` | integer | FK to option_value |
| **DB** | `item_price.location_id` | bigint | FK to location |
| **DB** | `item_price.price_cents` | integer | Price in cents |
| **DB** | `item_price.is_active` | boolean | Active price |
| **API** | `current_price` | string | Formatted: "12.99" |
| **API** | `base_price` | number | Dollars (float) |
| **Frontend** | `item.base_price` | number | For calculations |

---

## API Endpoints & Data Flow

### GET /api/all-restaurant-menus

**Purpose:** Load all restaurants with menus and items

**Response Structure:**
```javascript
[
  {
    restaurant_id: string,
    restaurant_name: string,      // Alias for name
    name: string,                 // From DB
    description: string,
    cuisine: string,
    address: string,
    phone: string,
    email: string,
    rating: number,
    price_range: string,
    is_verified: boolean,
    image_url: string | null,
    menus: [
      {
        menu_id: string,
        menu_name: string,
        menu_type: string,
        items: [...],             // Alias
        menu_items: [...]         // From DB
      }
    ]
  }
]
```

**Frontend Usage:**
```javascript
state.restaurants = rawData.map(normalizeRestaurant);
```

### GET /api/restaurants/:id

**Purpose:** Get single restaurant with full details

**Response includes:**
- Restaurant base info
- Nested menus with items
- restaurant_tags (via junction)
- restaurant_images (via junction)
- Menu item details with:
  - menu_item_tags
  - menu_item_allergens
  - menu_item_images
  - menu_item_ingredients
  - customizations

### GET /api/menu-items/:id

**Purpose:** Get menu item with enhanced details

**Response Structure:**
```javascript
{
  data: {
    menu_item_id: number,
    display_name: string,
    restaurant: string,           // Resolved restaurant name
    base_price: number | null,
    calories_range: string,       // "400–600"
    diets_possible: string[],
    images: [
      { url: string, type: string, is_generated: boolean }
    ],
    custom_options: [
      { option_id: number, name: string, is_required: boolean, type: string }
    ]
  }
}
```

### GET /api/menu-items/:id/nutrition

**Purpose:** Get nutrition, ingredients, allergens for item

**Response Structure:**
```javascript
{
  menu_item_id: number,
  item_name: string,
  nutrition: {
    nutrition_id: number,
    name: string,
    calories: number,
    protein_grams: number,
    fat_grams: number,
    saturated_fat_grams: number,
    carbohydrates_grams: number,
    sugar_grams: number,
    fiber_grams: number,
    sodium_mg: number,
    cholesterol_mg: number,
    is_verified: boolean
  },
  ingredients: [
    {
      name: string,
      brand: string | null,
      is_optional: boolean,
      is_vegan: boolean,
      is_vegetarian: boolean,
      is_gluten_free: boolean,
      possible_allergens: string | null
    }
  ],
  allergens: [
    {
      name: string,
      description: string,
      is_verified: boolean
    }
  ],
  diets: string[]
}
```

### GET /api/menu-items/:id/customizations

**Purpose:** Get customization options for item

**Response Structure:**
```javascript
[
  {
    menu_item_id: number,
    option_id: number,
    is_required: boolean,
    display_order: number,
    option_type: string,
    custom_option: {
      option_id: number,
      name: string,
      option_description: string,
      option_type: string,
      option_values: [
        {
          value_id: number,
          value_name: string,
          is_available: boolean,
          display_order: number,
          twelve_word_description: string,
          nutrition: { ... } | null,      // Enriched
          diets: string[],                 // Enriched
          allergens: string[],             // Enriched
          price: number | null             // Enriched
        }
      ]
    }
  }
]
```

### GET /api/menu-items/:id/configure

**Purpose:** Calculate configured item with selected options

**Query Parameters:**
- `options`: Comma-separated value_ids (e.g., `?options=1,5,12`)

**Response Structure:**
```javascript
{
  data: {
    configured_item: string,      // "Base Item + Option1 + Option2"
    total_price: number,
    nutrition: {
      calories: number,
      protein_grams: number,
      fat_grams: number,
      carbs_grams: number
    },
    diets: string[],              // Intersection of all component diets
    allergens_present: string[],
    allergens_possible: string[],
    breakdown: [
      { name: string, price: number }
    ],
    best_image: string | null
  }
}
```

### GET /api/search

**Purpose:** Search restaurants and menu items

**Query Parameters:**
- `q`: Search query
- `dietary`: Dietary filter(s) (can be array)

**Response:** Array of matching restaurants

### POST /api/menu-items

**Purpose:** Create new menu item

**Request Body:**
```javascript
{
  menu_id: number,                // Required FK
  display_name: string,           // Or item_name
  short_name: string,
  item_description: string,
  fifty_char_description: string,
  hundred_char_description: string,
  serving_size: number,
  meal_type: string,
  item_type: string,
  is_customizable: boolean,
  base_price: number,             // Creates item_price record
  nutrition: { ... },             // Creates nutrition + junction
  allergen_ids: number[],         // Creates junction records
  diet_ids: number[]              // Creates junction records
}
```

### PUT /api/menu-items/:id

**Purpose:** Update existing menu item

**Request Body:** Same fields as POST (partial update supported)

---

## Frontend State Management

### Global State Structure

```javascript
const state = {
  currentPage: 'map',              // Current view
  restaurants: [],                 // Normalized restaurant data
  selectedRestaurant: null,        // Currently viewed restaurant
  selectedMenuItem: null,          // Currently viewed item
  shoppingCart: [],                // Cart items with restaurant info
  userProfile: {
    name: 'Guest User',
    location: null,
    favorites: [],
    preferences: {
      dietary: [],                 // Default dietary filters
      notifications: {}
    }
  },
  filters: {
    dietary: [],                   // Active dietary filters
    nutritional: [],               // Active nutrition filters
    allergens: [],                 // Allergens to avoid
    priceRange: 100
  },
  activeTags: [],                  // Clickable tag filters
  socialPosts: [],
  postsLoaded: 0
};
```

### Shopping Cart Item Structure

```javascript
{
  menu_item_id: string,
  item_name: string,
  base_price: number,
  restaurantId: string,           // Added during addToCart
  restaurantName: string          // Added during addToCart
}
```

---

## Field Mapping Tables

### Restaurant: DB → API → Frontend

| Database Field | API Field | Frontend Field | Notes |
|---------------|-----------|----------------|-------|
| `restaurant_id` | `restaurant_id` | `restaurant_id` | Direct |
| `name` | `name`, `restaurant_name` | `restaurant_name` | API adds alias |
| `description` | `description`, `twelve_word_description` | `description` | Normalized |
| `is_active` | (filtered) | — | Only active returned |

### Menu Item: DB → API → Frontend

| Database Field | API Field | Frontend Field | Notes |
|---------------|-----------|----------------|-------|
| `menu_item_id` | `menu_item_id` | `menu_item_id` | Direct |
| `display_name` | `display_name`, `item_name` | `item_name` | Normalized |
| `three_word_short_name` | `short_name` | `short_name` | Alias |
| `item_description` | `item_description`, `description` | `description` | Normalized |
| `fifty_char_description` | `fifty_char_description` | `description` | Fallback |
| `hundred_char_description` | `long_description` | `long_description` | Alias |
| (from `item_price`) | `current_price` | `base_price` | Joined & formatted |
| (from `menu_item_diet`) | `diets` | `tags` | Junction resolved |
| `is_customizable` | `is_customizable` | (UI flag) | Show "Make It" btn |

### Nutrition: DB → API → Frontend

| Database Field | API Field | Frontend Field | Notes |
|---------------|-----------|----------------|-------|
| `calories` | `nutrition.calories` | `nutrition.calories` | Direct |
| `protein_grams` | `nutrition.protein_grams` | `nutrition.protein_grams` | Direct |
| `fat_grams` | `nutrition.fat_grams` | `nutrition.fat_grams` | Direct |
| `carbohydrates_grams` | `nutrition.carbohydrates_grams` | `nutrition.carbohydrates_grams` | Direct |
| `fiber_grams` | `nutrition.fiber_grams` | `nutrition.fiber_grams` | Direct |
| `sodium_mg` | `nutrition.sodium_mg` | `nutrition.sodium_mg` | Direct |
| `sugar_grams` | `nutrition.sugar_grams` | — | Available |

---

## Junction Tables Reference

### Menu Item Relationships

| Junction Table | FK 1 | FK 2 | Extra Fields |
|---------------|------|------|--------------|
| `menu_item_nutrition` | `menu_item_id` | `nutrition_id` | — |
| `menu_item_ingredient` | `menu_item_id` | `ingredient_id` | `is_optional`, `display_order` |
| `menu_item_allergen` | `menu_item_id` | `allergen_id` | `is_verified` |
| `menu_item_diet` | `menu_item_id` | `diet_id` | — |
| `menu_item_image` | `menu_item_id` | `image_id` | `is_generated`, `is_verified`, `display_order`, `quality_rating` |
| `menu_item_tag` | `menu_item_id` | `tag_id` | — |
| `menu_item_customization` | `menu_item_id` | `option_id` | `is_required`, `display_order`, `option_type` |

### Option Value Relationships

| Junction Table | FK 1 | FK 2 | Extra Fields |
|---------------|------|------|--------------|
| `option_value_nutrition` | `value_id` | `nutrition_id` | — |
| `option_value_ingredient` | `value_id` | `ingredient_id` | — |
| `option_value_allergen` | `value_id` | `allergen_id` | — |
| `option_value_diet` | `value_id` | `diet_id` | — |
| `option_value_image` | `value_id` | `image_id` | — |

### Restaurant Relationships

| Junction Table | FK 1 | FK 2 | Extra Fields |
|---------------|------|------|--------------|
| `restaurant_image` | `restaurant_id` | `image_id` | `is_exterior`, `is_interior`, `is_logo`, `is_restaurant_entrance` |
| `restaurant_tag` | `restaurant_id` | `tag_id` | — |

### Location Relationships

| Junction Table | FK 1 | FK 2 | Extra Fields |
|---------------|------|------|--------------|
| `location_menu` | `location_id` | `menu_id` | — |
| `location_contact` | `location_id` | `contact_id` | — |
| `location_hours` | `location_id` | (hours data) | `day_of_week`, `open_time`, `close_time`, `is_closed` |

---

## Data Normalization Functions

### Frontend: normalizeRestaurant()

```javascript
function normalizeRestaurant(restaurant) {
  return {
    ...restaurant,
    restaurant_id: restaurant.restaurant_id,
    restaurant_name: restaurant.name || restaurant.restaurant_name,
    description: restaurant.description || restaurant.twelve_word_description,
    menus: (restaurant.menus || []).map(menu => ({
      ...menu,
      menu_id: menu.menu_id,
      menu_name: menu.menu_name,
      items: (menu.menu_items || menu.items || []).map(item => ({
        ...item,
        menu_item_id: item.menu_item_id,
        item_name: item.display_name || item.item_name,
        short_name: item.three_word_short_name || item.short_name,
        description: item.item_description || item.description || item.fifty_char_description,
        long_description: item.hundred_char_description || item.long_description,
        base_price: item.current_price || item.base_price || 0,
        tags: item.diets || item.tags || [],
        nutrition: item.nutrition || {}
      }))
    }))
  };
}
```

### Backend: Restaurant Query (Supabase)

```javascript
// Full restaurant query with all relationships
const { data, error } = await supabase
  .from('restaurant')
  .select(`
    *,
    menus:menu(
      *,
      menu_items:menu_item(
        *,
        menu_item_tags:menu_item_tag(tag:tag_id(tag_id, tag_text)),
        menu_item_allergens:menu_item_allergen(allergen:allergen_id(...)),
        menu_item_images:menu_item_image(image:image_id(...)),
        menu_item_ingredients:menu_item_ingredient(...),
        customizations:menu_item_customization(custom_option:option_id(...))
      )
    ),
    restaurant_tags:restaurant_tag(tag:tag_id(...)),
    restaurant_images:restaurant_image(image:image_id(...))
  `)
  .eq('restaurant_id', id)
  .single();
```

---

## UI Component → Data Mapping

### Restaurant Card (`createRestaurantCard`)

| UI Element | Data Source | Notes |
|-----------|-------------|-------|
| Restaurant Name | `restaurant.restaurant_name` | Normalized |
| Rating | (mock: random) | Not in current schema |
| Distance | (mock: random) | Requires geolocation |
| Description | `restaurant.description` | Normalized |
| Item Count | `restaurant.menus.reduce(...)` | Calculated |
| Tags | `extractRestaurantTags()` | Aggregated from items |
| Like/Dislike | (mock counts) | Not persisted |

### Menu Item Card (`createMenuItemCard`)

| UI Element | Data Source | Notes |
|-----------|-------------|-------|
| Item Name | `item.item_name` | Normalized |
| Description | `item.description` | Normalized |
| Price | `item.base_price` | Formatted with `$` |
| Tags | `item.tags[]` | Dietary/nutrition |
| Show Nutrition | `item.menu_item_id` | Fetches from API |
| Make It | `item.tags` includes customizable | Shows customization modal |
| Add to Cart | `item.menu_item_id` | Adds to shopping cart |

### Nutrition Modal (`showNutritionModal`)

| UI Element | Data Source | API Endpoint |
|-----------|-------------|--------------|
| Ingredients List | `response.ingredients[]` | `/api/menu-items/:id/nutrition` |
| Nutrition Grid | `response.nutrition` | Same endpoint |
| Allergens Warning | `response.allergens[]` | Same endpoint |
| Diets Info | `response.diets[]` | Same endpoint |

### Make It Modal (`showMakeItModal`)

| UI Element | Data Source | API Endpoint |
|-----------|-------------|--------------|
| Option Groups | `customizations[]` | `/api/menu-items/:id/customizations` |
| Option Values | `custom_option.option_values[]` | Same endpoint |
| Value Nutrition | `value.nutrition` | Enriched in response |
| Value Diets | `value.diets[]` | Enriched in response |
| Value Allergens | `value.allergens[]` | Enriched in response |
| Value Price | `value.price` | Enriched in response |

---

## Mock Data Structure (Fallback)

When Supabase is unavailable, mock data follows this structure:

```javascript
const mockRestaurants = [
  {
    restaurant_id: 'rest-001',
    restaurant_name: 'Restaurant Name',
    description: 'Description...',
    cuisine: 'Cuisine Type',
    address: 'Full Address',
    phone: '(xxx) xxx-xxxx',
    email: 'email@restaurant.com',
    rating: 4.5,
    price_range: '$$',
    is_verified: false,
    image_url: null,
    menus: [
      {
        menu_id: 'menu-001',
        menu_name: 'Menu Name',
        description: 'Menu Description',
        items: [
          {
            menu_item_id: 'item-001',
            item_name: 'Item Name',
            short_name: 'Short Name',
            description: 'Brief description',
            long_description: 'Detailed description...',
            base_price: 12.99,
            portion_size: '8 oz',
            meal_type: 'All Day',
            tags: ['vegan', 'high-protein'],
            image_url: null,
            nutrition: {
              calories: 500,
              protein_grams: 25,
              fat_grams: 15,
              carbohydrates_grams: 60,
              fiber_grams: 10,
              sodium_mg: 800,
              sugar_grams: 8
            },
            ingredients: ['Ingredient 1', 'Ingredient 2'],
            allergens: ['gluten', 'soy']
          }
        ]
      }
    ]
  }
];
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 11, 2025 | Initial specification |

---

## Notes

1. **ID Types:** Database uses `bigint`, API returns strings, frontend handles both
2. **Price Storage:** Database stores cents (integer), API returns dollars (string/float)
3. **Field Aliases:** Multiple field names supported for backwards compatibility
4. **Junction Tables:** All many-to-many relationships use junction tables with potential extra metadata
5. **Normalization:** Frontend `normalizeRestaurant()` ensures consistent data structure regardless of source
