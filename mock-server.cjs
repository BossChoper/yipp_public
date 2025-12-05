/**
 * Yippee Backend Server v3
 * Schema Version: 12_2 - Enhanced Configuration Server with Supabase Integration
 * 
 * Features:
 * - Direct menu_item.menu_id FK
 * - Direct menu.restaurant_id FK (no restaurant_menu junction)
 * - Full customization support with nutrition tracking
 * - Diet and allergen filtering
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const serverless = require('serverless-http');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  WARNING: Supabase credentials not found in environment variables!');
    console.warn('   Please create a .env file with SUPABASE_URL and SUPABASE_KEY (or SUPABASE_ANON_KEY)');
    console.warn('   Falling back to mock data...\n');
} else {
    console.log('✅ Supabase credentials found');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
}

const supabase = supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// ========================================
// Helper Functions (Schema-Aligned)
// ========================================

// Helper function to get restaurant name from menu item
async function getRestaurantForMenuItem(menuItemId) {
    if (!supabase) return null;
    
    try {
        // Method 1: Get menu_id from menu_item, then get restaurant from menu.restaurant_id
        const { data: menuItem, error: itemError } = await supabase
            .from('menu_item')
            .select('menu_id')
            .eq('menu_item_id', menuItemId)
            .single();

        if (!itemError && menuItem?.menu_id) {
            // Get restaurant directly from menu table (menu has direct restaurant_id FK)
            const { data: menu, error: menuError } = await supabase
                .from('menu')
                .select(`
                    restaurant_id,
                    restaurant:restaurant_id (
                        name,
                        description,
                        restaurant_id
                    )
                `)
                .eq('menu_id', menuItem.menu_id)
                .single();

            if (!menuError && menu?.restaurant) {
                return menu.restaurant;
            }
        }

        // Method 2: Try location_menu -> location -> restaurant relationship
        if (menuItem?.menu_id) {
            const { data: locationMenus, error: locError } = await supabase
                .from('location_menu')
                .select(`
                    location_id,
                    location:location_id (
                        restaurant_id,
                        restaurant:restaurant_id (
                            name,
                            description,
                            restaurant_id
                        )
                    )
                `)
                .eq('menu_id', menuItem.menu_id)
                .limit(1);

            if (!locError && locationMenus && locationMenus.length > 0 && locationMenus[0].location?.restaurant) {
                return locationMenus[0].location.restaurant;
            }
        }

        console.log('No restaurant found for menu_item_id:', menuItemId);
        return null;
    } catch (error) {
        console.error('Error getting restaurant:', error);
        return null;
    }
}

// Helper function to get base price for menu item
async function getBasePrice(menuItemId) {
    if (!supabase) return null;
    
    try {
        const { data: priceData, error: priceError } = await supabase
            .from('item_price')
            .select('price_cents')
            .eq('menu_item_id', menuItemId)
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1);

        if (!priceError && priceData && priceData.length > 0) {
            return (priceData[0].price_cents / 100).toFixed(2);
        }

        return null;
    } catch (error) {
        console.error('Error getting price:', error);
        return null;
    }
}

// Helper function to get nutrition for menu item
async function getNutritionForMenuItem(menuItemId) {
    if (!supabase) return null;
    
    try {
        const { data: nutritionData, error: nutError } = await supabase
            .from('menu_item_nutrition')
            .select(`
                nutrition:nutrition_id (*)
            `)
            .eq('menu_item_id', menuItemId)
            .limit(1);

        if (nutError || !nutritionData || nutritionData.length === 0) return null;
        return nutritionData[0].nutrition;
    } catch (error) {
        return null;
    }
}

// Helper function to calculate calories range
function getCaloriesRange(nutrition, customizations) {
    if (!nutrition) return null;
    
    const baseCalories = nutrition.calories || 0;
    const minCalories = baseCalories;
    const maxCalories = baseCalories + (customizations?.length || 0) * 200;
    
    return `${minCalories}–${maxCalories}`;
}

// Helper function to get possible diets for menu item
async function getPossibleDiets(menuItemId) {
    if (!supabase) return [];
    
    try {
        const { data: diets, error: dietError } = await supabase
            .from('menu_item_diet')
            .select(`
                diet:diet_id (
                    diet_name
                )
            `)
            .eq('menu_item_id', menuItemId);

        if (dietError || !diets) return [];
        return diets.map(d => d.diet?.diet_name).filter(Boolean);
    } catch (error) {
        return [];
    }
}

// Helper to generate recommendations for missing data
function generateRecommendations(menuId, menus, restaurants, prices, nutritionLinks) {
    const recommendations = [];

    if (!menuId) {
        recommendations.push('❌ No menu_id found on menu_item. Need to set menu_item.menu_id FK.');
    }

    if (menus.length === 0) {
        recommendations.push('❌ No menu found. Need to create menu record and set menu_item.menu_id.');
    }

    if (restaurants.length === 0) {
        recommendations.push('❌ No restaurants found. Need to create restaurant record and set menu.restaurant_id FK.');
    }

    if (!prices || prices.length === 0) {
        recommendations.push('⚠️  No prices found in item_price table.');
    }

    if (!nutritionLinks || nutritionLinks.length === 0) {
        recommendations.push('⚠️  No nutrition data found. Need to insert into menu_item_nutrition table.');
    }

    if (recommendations.length === 0) {
        recommendations.push('✅ All critical relationships exist!');
    }

    return recommendations;
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// Mock Data
// ========================================

const mockRestaurants = [
    {
        restaurant_id: 'rest-001',
        restaurant_name: 'Green Garden Bistro',
        description: 'A fully vegan restaurant focused on organic, plant-based cuisine with high-protein options.',
        cuisine: 'Vegan',
        address: '123 Wellness Ave, San Francisco, CA 94102',
        phone: '(415) 555-0101',
        email: 'contact@greengardensbistro.com',
        rating: 4.7,
        price_range: '$$',
        is_verified: false,
        image_url: null,
        menus: [
            {
                menu_id: 'menu-001',
                menu_name: 'All Day Menu',
                description: 'Available all day',
                items: [
                    {
                        menu_item_id: 'item-001',
                        item_name: 'Impossible Burger',
                        short_name: 'Vegan Burger',
                        description: 'Plant-based patty with lettuce, tomato, vegan cheese, and special sauce on a whole wheat bun',
                        long_description: 'Our signature burger features a delicious Impossible meat patty that tastes just like beef but is 100% plant-based. Topped with crisp lettuce, ripe tomatoes, melted vegan cheese, pickles, onions, and our house-made special sauce, all on a toasted whole wheat bun. A satisfying meal packed with protein!',
                        base_price: 14.99,
                        portion_size: '8 oz patty',
                        meal_type: 'All Day',
                        tags: ['vegan', 'high-protein', 'plant-protein', 'customizable'],
                        image_url: null,
                        nutrition: {
                            calories: 580,
                            protein_grams: 28,
                            fat_grams: 24,
                            carbohydrates_grams: 62,
                            fiber_grams: 12,
                            sodium_mg: 890,
                            sugar_grams: 8
                        },
                        ingredients: [
                            'Impossible patty',
                            'Whole wheat bun',
                            'Lettuce',
                            'Tomato',
                            'Vegan cheese',
                            'Pickles',
                            'Onions',
                            'Special sauce'
                        ],
                        allergens: ['gluten', 'soy']
                    },
                    {
                        menu_item_id: 'item-002',
                        item_name: 'Quinoa Power Bowl',
                        short_name: 'Power Bowl',
                        description: 'Protein-rich quinoa bowl with roasted vegetables, chickpeas, and tahini dressing',
                        long_description: 'A nutrient-dense bowl featuring fluffy organic quinoa as the base, topped with roasted sweet potatoes, Brussels sprouts, chickpeas, kale, avocado, and a generous drizzle of our homemade tahini dressing. Perfect for a healthy, satisfying meal.',
                        base_price: 13.99,
                        portion_size: '16 oz',
                        meal_type: 'All Day',
                        tags: ['vegan', 'gluten-free', 'high-protein', 'high-fiber', 'plant-protein', 'customizable', 'meal-build'],
                        image_url: null,
                        nutrition: {
                            calories: 520,
                            protein_grams: 22,
                            fat_grams: 18,
                            carbohydrates_grams: 72,
                            fiber_grams: 16,
                            sodium_mg: 420,
                            sugar_grams: 9
                        },
                        ingredients: [
                            'Organic quinoa',
                            'Sweet potatoes',
                            'Brussels sprouts',
                            'Chickpeas',
                            'Kale',
                            'Avocado',
                            'Tahini dressing',
                            'Lemon juice'
                        ],
                        allergens: ['sesame']
                    },
                    {
                        menu_item_id: 'item-003',
                        item_name: 'Tofu Scramble',
                        short_name: 'Scramble',
                        description: 'Protein-packed tofu scramble with veggies and whole grain toast',
                        long_description: 'Crumbled organic tofu sautéed with turmeric, nutritional yeast, bell peppers, onions, spinach, and mushrooms. Served with two slices of whole grain toast and fresh fruit. A perfect high-protein breakfast!',
                        base_price: 11.99,
                        portion_size: '12 oz',
                        meal_type: 'Breakfast',
                        tags: ['vegan', 'high-protein', 'plant-protein'],
                        image_url: null,
                        nutrition: {
                            calories: 420,
                            protein_grams: 26,
                            fat_grams: 16,
                            carbohydrates_grams: 48,
                            fiber_grams: 10,
                            sodium_mg: 580,
                            sugar_grams: 6
                        },
                        ingredients: [
                            'Organic tofu',
                            'Turmeric',
                            'Nutritional yeast',
                            'Bell peppers',
                            'Onions',
                            'Spinach',
                            'Mushrooms',
                            'Whole grain bread'
                        ],
                        allergens: ['soy', 'gluten']
                    }
                ]
            },
            {
                menu_id: 'menu-002',
                menu_name: 'Desserts',
                description: 'Sweet treats',
                items: [
                    {
                        menu_item_id: 'item-004',
                        item_name: 'Vegan Chocolate Cake',
                        short_name: 'Chocolate Cake',
                        description: 'Rich, moist chocolate cake with coconut cream frosting',
                        long_description: 'Decadent three-layer chocolate cake made with premium cocoa, coconut milk, and topped with fluffy coconut cream frosting. Completely dairy-free but incredibly indulgent.',
                        base_price: 7.99,
                        portion_size: '1 slice',
                        meal_type: 'All Day',
                        tags: ['vegan', 'dessert'],
                        image_url: null,
                        nutrition: {
                            calories: 380,
                            protein_grams: 5,
                            fat_grams: 18,
                            carbohydrates_grams: 52,
                            fiber_grams: 4,
                            sodium_mg: 220,
                            sugar_grams: 32
                        },
                        ingredients: [
                            'Flour',
                            'Cocoa powder',
                            'Coconut milk',
                            'Coconut cream',
                            'Maple syrup',
                            'Vanilla',
                            'Baking powder'
                        ],
                        allergens: ['gluten']
                    }
                ]
            }
        ]
    },
    {
        restaurant_id: 'rest-002',
        restaurant_name: 'Protein Palace',
        description: 'High-protein meals for fitness enthusiasts. Customizable bowls and wraps with detailed macro tracking.',
        cuisine: 'Health Food',
        address: '456 Fitness Blvd, San Francisco, CA 94103',
        phone: '(415) 555-0202',
        email: 'info@proteinpalace.com',
        rating: 4.5,
        price_range: '$$',
        is_verified: true,
        image_url: null,
        menus: [
            {
                menu_id: 'menu-003',
                menu_name: 'Build Your Bowl',
                description: 'Customizable macro bowls',
                items: [
                    {
                        menu_item_id: 'item-005',
                        item_name: 'Chicken Power Bowl',
                        short_name: 'Chicken Bowl',
                        description: 'Grilled chicken breast with brown rice, broccoli, and teriyaki sauce',
                        long_description: 'Lean grilled chicken breast (8oz) served over a bed of brown rice with steamed broccoli, carrots, and our house teriyaki sauce. Macros are displayed for easy tracking. Customize your protein, grain, and veggie choices!',
                        base_price: 12.99,
                        portion_size: '20 oz',
                        meal_type: 'All Day',
                        tags: ['high-protein', 'meat-eater', 'customizable', 'meal-build'],
                        image_url: null,
                        nutrition: {
                            calories: 580,
                            protein_grams: 52,
                            fat_grams: 12,
                            carbohydrates_grams: 64,
                            fiber_grams: 8,
                            sodium_mg: 920,
                            sugar_grams: 10
                        },
                        ingredients: [
                            'Chicken breast',
                            'Brown rice',
                            'Broccoli',
                            'Carrots',
                            'Teriyaki sauce',
                            'Sesame seeds'
                        ],
                        allergens: ['soy', 'sesame']
                    },
                    {
                        menu_item_id: 'item-006',
                        item_name: 'Steak & Sweet Potato',
                        short_name: 'Steak Plate',
                        description: 'Grass-fed steak with roasted sweet potatoes and green beans',
                        long_description: 'Premium grass-fed sirloin steak (6oz) cooked to your preference, paired with herb-roasted sweet potatoes and garlic green beans. A complete high-protein, nutrient-dense meal.',
                        base_price: 16.99,
                        portion_size: '16 oz',
                        meal_type: 'Lunch',
                        tags: ['high-protein', 'meat-eater', 'low-carb', 'gluten-free'],
                        image_url: null,
                        nutrition: {
                            calories: 640,
                            protein_grams: 48,
                            fat_grams: 28,
                            carbohydrates_grams: 42,
                            fiber_grams: 8,
                            sodium_mg: 680,
                            sugar_grams: 12
                        },
                        ingredients: [
                            'Grass-fed sirloin',
                            'Sweet potatoes',
                            'Green beans',
                            'Olive oil',
                            'Garlic',
                            'Herbs'
                        ],
                        allergens: []
                    },
                    {
                        menu_item_id: 'item-007',
                        item_name: 'Salmon & Quinoa',
                        short_name: 'Salmon Bowl',
                        description: 'Wild-caught salmon with quinoa and roasted vegetables',
                        long_description: 'Fresh wild-caught salmon fillet (6oz) baked to perfection, served with fluffy quinoa, roasted asparagus, and cherry tomatoes. Rich in omega-3s and protein.',
                        base_price: 17.99,
                        portion_size: '18 oz',
                        meal_type: 'All Day',
                        tags: ['high-protein', 'meat-eater', 'gluten-free', 'high-fiber'],
                        image_url: null,
                        nutrition: {
                            calories: 620,
                            protein_grams: 44,
                            fat_grams: 24,
                            carbohydrates_grams: 52,
                            fiber_grams: 10,
                            sodium_mg: 540,
                            sugar_grams: 6
                        },
                        ingredients: [
                            'Wild salmon',
                            'Quinoa',
                            'Asparagus',
                            'Cherry tomatoes',
                            'Lemon',
                            'Dill'
                        ],
                        allergens: ['fish']
                    }
                ]
            }
        ]
    },
    {
        restaurant_id: 'rest-003',
        restaurant_name: 'Bella Italia',
        description: 'Traditional Italian cuisine with gluten-free and vegetarian options available.',
        cuisine: 'Italian',
        address: '789 Pasta Lane, San Francisco, CA 94104',
        phone: '(415) 555-0303',
        email: 'hello@bellaitalia.com',
        rating: 4.8,
        price_range: '$$$',
        is_verified: true,
        image_url: null,
        menus: [
            {
                menu_id: 'menu-004',
                menu_name: 'Pasta & Pizza',
                description: 'Italian classics',
                items: [
                    {
                        menu_item_id: 'item-008',
                        item_name: 'Margherita Pizza (GF)',
                        short_name: 'Margherita',
                        description: 'Classic pizza with fresh mozzarella, basil, and tomato sauce on gluten-free crust',
                        long_description: 'Authentic Neapolitan-style pizza made with our house-made gluten-free crust, topped with San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil, and extra virgin olive oil. We take cross-contamination seriously with dedicated prep areas.',
                        base_price: 15.99,
                        portion_size: '12 inch',
                        meal_type: 'All Day',
                        tags: ['vegetarian', 'gluten-free'],
                        image_url: null,
                        nutrition: {
                            calories: 720,
                            protein_grams: 32,
                            fat_grams: 28,
                            carbohydrates_grams: 86,
                            fiber_grams: 6,
                            sodium_mg: 1240,
                            sugar_grams: 8
                        },
                        ingredients: [
                            'Gluten-free dough',
                            'San Marzano tomatoes',
                            'Buffalo mozzarella',
                            'Fresh basil',
                            'Olive oil',
                            'Sea salt'
                        ],
                        allergens: ['dairy']
                    },
                    {
                        menu_item_id: 'item-009',
                        item_name: 'Penne Arrabbiata',
                        short_name: 'Arrabbiata',
                        description: 'Spicy tomato sauce with garlic and red pepper flakes',
                        long_description: 'Al dente penne pasta tossed in our fiery arrabbiata sauce made with crushed tomatoes, garlic, red pepper flakes, and fresh parsley. Can be made vegan upon request by omitting parmesan.',
                        base_price: 13.99,
                        portion_size: '14 oz',
                        meal_type: 'Lunch',
                        tags: ['vegetarian', 'spicy'],
                        image_url: null,
                        nutrition: {
                            calories: 520,
                            protein_grams: 16,
                            fat_grams: 12,
                            carbohydrates_grams: 88,
                            fiber_grams: 6,
                            sodium_mg: 680,
                            sugar_grams: 10
                        },
                        ingredients: [
                            'Penne pasta',
                            'Tomatoes',
                            'Garlic',
                            'Red pepper flakes',
                            'Olive oil',
                            'Parsley',
                            'Parmesan'
                        ],
                        allergens: ['gluten', 'dairy']
                    },
                    {
                        menu_item_id: 'item-010',
                        item_name: 'Chicken Parmigiana',
                        short_name: 'Chicken Parm',
                        description: 'Breaded chicken breast with marinara and melted mozzarella',
                        long_description: 'Tender chicken breast lightly breaded and pan-fried, topped with our house marinara sauce and melted mozzarella cheese. Served with a side of spaghetti. A hearty Italian-American classic!',
                        base_price: 18.99,
                        portion_size: '16 oz',
                        meal_type: 'Dinner',
                        tags: ['meat-eater', 'high-protein'],
                        image_url: null,
                        nutrition: {
                            calories: 820,
                            protein_grams: 58,
                            fat_grams: 32,
                            carbohydrates_grams: 72,
                            fiber_grams: 6,
                            sodium_mg: 1540,
                            sugar_grams: 12
                        },
                        ingredients: [
                            'Chicken breast',
                            'Breadcrumbs',
                            'Marinara sauce',
                            'Mozzarella',
                            'Spaghetti',
                            'Parmesan',
                            'Basil'
                        ],
                        allergens: ['gluten', 'dairy', 'eggs']
                    }
                ]
            }
        ]
    },
    {
        restaurant_id: 'rest-004',
        restaurant_name: 'Taco Fiesta',
        description: 'Fresh Mexican street food with vegetarian, vegan, and meat options. Build your own tacos!',
        cuisine: 'Mexican',
        address: '321 Salsa Street, San Francisco, CA 94105',
        phone: '(415) 555-0404',
        email: 'hola@tacofiesta.com',
        rating: 4.6,
        price_range: '$',
        is_verified: false,
        image_url: null,
        menus: [
            {
                menu_id: 'menu-005',
                menu_name: 'Tacos & Burritos',
                description: 'Build your perfect meal',
                items: [
                    {
                        menu_item_id: 'item-011',
                        item_name: 'Build Your Own Burrito',
                        short_name: 'Custom Burrito',
                        description: 'Choose your protein, rice, beans, and toppings',
                        long_description: 'Create your perfect burrito! Start with your choice of protein (carnitas, chicken, carne asada, tofu, or black beans), add rice (white or brown), beans (black or pinto), and load up with toppings like cheese, sour cream, guacamole, pico de gallo, lettuce, and salsa. All wrapped in a large flour tortilla.',
                        base_price: 9.99,
                        portion_size: '16 oz',
                        meal_type: 'All Day',
                        tags: ['customizable', 'meal-build', 'high-protein'],
                        image_url: null,
                        nutrition: {
                            calories: 680,
                            protein_grams: 32,
                            fat_grams: 24,
                            carbohydrates_grams: 82,
                            fiber_grams: 12,
                            sodium_mg: 1240,
                            sugar_grams: 4
                        },
                        ingredients: [
                            'Flour tortilla',
                            'Rice',
                            'Beans',
                            'Protein choice',
                            'Cheese',
                            'Lettuce',
                            'Pico de gallo',
                            'Salsa'
                        ],
                        allergens: ['gluten', 'dairy']
                    },
                    {
                        menu_item_id: 'item-012',
                        item_name: 'Vegan Tacos (3)',
                        short_name: 'Vegan Tacos',
                        description: 'Three soft tacos with seasoned tofu, black beans, and fresh toppings',
                        long_description: 'Three soft corn tortillas filled with seasoned grilled tofu, black beans, lettuce, pico de gallo, avocado, and cilantro lime sauce. Completely vegan and full of flavor!',
                        base_price: 8.99,
                        portion_size: '3 tacos',
                        meal_type: 'All Day',
                        tags: ['vegan', 'plant-protein', 'gluten-free'],
                        image_url: null,
                        nutrition: {
                            calories: 420,
                            protein_grams: 18,
                            fat_grams: 16,
                            carbohydrates_grams: 54,
                            fiber_grams: 14,
                            sodium_mg: 680,
                            sugar_grams: 4
                        },
                        ingredients: [
                            'Corn tortillas',
                            'Seasoned tofu',
                            'Black beans',
                            'Lettuce',
                            'Pico de gallo',
                            'Avocado',
                            'Cilantro',
                            'Lime'
                        ],
                        allergens: ['soy']
                    },
                    {
                        menu_item_id: 'item-013',
                        item_name: 'Carne Asada Bowl',
                        short_name: 'Steak Bowl',
                        description: 'Grilled steak over cilantro lime rice with beans and toppings',
                        long_description: 'Marinated and grilled carne asada served over cilantro lime rice with black beans, corn, lettuce, cheese, sour cream, and guacamole. A protein-packed bowl with bold flavors!',
                        base_price: 12.99,
                        portion_size: '18 oz',
                        meal_type: 'All Day',
                        tags: ['meat-eater', 'high-protein', 'gluten-free'],
                        image_url: null,
                        nutrition: {
                            calories: 720,
                            protein_grams: 46,
                            fat_grams: 28,
                            carbohydrates_grams: 68,
                            fiber_grams: 12,
                            sodium_mg: 1120,
                            sugar_grams: 6
                        },
                        ingredients: [
                            'Carne asada',
                            'Cilantro lime rice',
                            'Black beans',
                            'Corn',
                            'Lettuce',
                            'Cheese',
                            'Sour cream',
                            'Guacamole'
                        ],
                        allergens: ['dairy']
                    }
                ]
            }
        ]
    },
    {
        restaurant_id: 'rest-005',
        restaurant_name: 'Sunrise Cafe',
        description: 'All-day breakfast spot with healthy and indulgent options.',
        cuisine: 'Breakfast',
        address: '555 Morning Drive, San Francisco, CA 94106',
        phone: '(415) 555-0505',
        email: 'info@sunrisecafe.com',
        rating: 4.4,
        price_range: '$$',
        is_verified: true,
        image_url: null,
        menus: [
            {
                menu_id: 'menu-006',
                menu_name: 'Breakfast All Day',
                description: 'Breakfast favorites',
                items: [
                    {
                        menu_item_id: 'item-014',
                        item_name: 'Protein Pancakes',
                        short_name: 'Protein Pancakes',
                        description: 'Fluffy pancakes made with whey protein, topped with berries and maple syrup',
                        long_description: 'Three large pancakes made with a special protein-enhanced batter, topped with fresh blueberries, strawberries, and pure maple syrup. Each serving has 30g of protein! Perfect for a post-workout meal.',
                        base_price: 10.99,
                        portion_size: '3 pancakes',
                        meal_type: 'Breakfast',
                        tags: ['high-protein', 'vegetarian'],
                        image_url: null,
                        nutrition: {
                            calories: 520,
                            protein_grams: 30,
                            fat_grams: 12,
                            carbohydrates_grams: 72,
                            fiber_grams: 6,
                            sodium_mg: 680,
                            sugar_grams: 24
                        },
                        ingredients: [
                            'Flour',
                            'Whey protein',
                            'Eggs',
                            'Milk',
                            'Blueberries',
                            'Strawberries',
                            'Maple syrup'
                        ],
                        allergens: ['gluten', 'dairy', 'eggs']
                    },
                    {
                        menu_item_id: 'item-015',
                        item_name: 'Avocado Toast',
                        short_name: 'Avo Toast',
                        description: 'Smashed avocado on whole grain toast with poached eggs',
                        long_description: 'Fresh smashed avocado seasoned with lemon, red pepper flakes, and sea salt, served on thick-cut whole grain toast. Topped with two perfectly poached eggs and microgreens. Can be made vegan without eggs.',
                        base_price: 11.99,
                        portion_size: '2 slices',
                        meal_type: 'Breakfast',
                        tags: ['vegetarian', 'high-fiber'],
                        image_url: null,
                        nutrition: {
                            calories: 480,
                            protein_grams: 20,
                            fat_grams: 24,
                            carbohydrates_grams: 48,
                            fiber_grams: 14,
                            sodium_mg: 540,
                            sugar_grams: 4
                        },
                        ingredients: [
                            'Whole grain bread',
                            'Avocado',
                            'Eggs',
                            'Lemon',
                            'Red pepper flakes',
                            'Microgreens',
                            'Sea salt'
                        ],
                        allergens: ['gluten', 'eggs']
                    }
                ]
            }
        ]
    }
];

// Helper function to generate unique IDs
let idCounter = 100;
function generateId() {
    return `item-${idCounter++}`;
}

// ========================================
// API Routes
// ========================================

// Get all restaurants with menus (Schema 12_2 aligned)
// NOTE: Handles case where FK relationships (menu.restaurant_id, menu_item.menu_id) may be null
app.get('/api/all-restaurant-menus', async (req, res) => {
    console.log('📋 GET /api/all-restaurant-menus');
    
    if (!supabase) {
        console.log('   Using mock data (no Supabase)');
        return res.json(mockRestaurants);
    }
    
    try {
        console.log('   Fetching from Supabase...');
        
        // Fetch restaurants, menus, and menu_items separately then combine
        // This handles the case where FK relationships may not be set up
        
        // Get all restaurants
        const { data: restaurants, error: restError } = await supabase
            .from('restaurant')
            .select('*')
            .eq('is_active', true);
        
        if (restError) {
            console.error('   Restaurant error:', restError.message);
            throw restError;
        }
        
        console.log('   Found', restaurants?.length || 0, 'restaurants');
        
        if (!restaurants || restaurants.length === 0) {
            console.log('   No active restaurants, using mock data');
            return res.json(mockRestaurants);
        }
        
        // Get all menus
        const { data: menus, error: menuError } = await supabase
            .from('menu')
            .select('*')
            .eq('is_active', true);
        
        console.log('   Found', menus?.length || 0, 'menus');
        
        // Get all menu items
        const { data: menuItems, error: itemError } = await supabase
            .from('menu_item')
            .select('*')
            .eq('is_active', true);
        
        console.log('   Found', menuItems?.length || 0, 'menu items');
        
        // Build the response structure
        // If FKs are linked, use them. Otherwise, distribute items across restaurants
        const result = [];
        
        for (const restaurant of restaurants) {
            const restaurantData = {
                ...restaurant,
                restaurant_name: restaurant.name, // Frontend compatibility
                menus: []
            };
            
            // Find menus linked to this restaurant
            let linkedMenus = menus?.filter(m => m.restaurant_id === restaurant.restaurant_id) || [];
            
            // If no linked menus but we have menus, create a "virtual" menu
            if (linkedMenus.length === 0 && menus && menus.length > 0) {
                // Use the first available menu as a template
                linkedMenus = [{
                    menu_id: `virtual-${restaurant.restaurant_id}`,
                    menu_name: 'Menu',
                    menu_type: 'Standard',
                    is_active: true
                }];
            }
            
            for (const menu of linkedMenus) {
                const menuData = {
                    ...menu,
                    items: [],
                    menu_items: []
                };
                
                // Find menu items linked to this menu
                let linkedItems = menuItems?.filter(i => i.menu_id === menu.menu_id) || [];
                
                // If no linked items and we have items, include some for display
                if (linkedItems.length === 0 && menuItems && menuItems.length > 0) {
                    // Get a subset of unlinked items for this restaurant
                    const unlinkedItems = menuItems.filter(i => !i.menu_id);
                    // Distribute items: take a few for each restaurant
                    const startIdx = (result.length * 5) % Math.max(1, unlinkedItems.length);
                    linkedItems = unlinkedItems.slice(startIdx, startIdx + 5);
                }
                
                // Enrich items with nutrition and price
                for (const item of linkedItems) {
                    const enrichedItem = {
                        ...item,
                        item_name: item.display_name, // Frontend compatibility
                        description: item.item_description,
                        nutrition: await getNutritionForMenuItem(item.menu_item_id),
                        current_price: await getBasePrice(item.menu_item_id),
                        diets: await getPossibleDiets(item.menu_item_id),
                        tags: []
                    };
                    
                    // Convert diets to tags for frontend
                    if (enrichedItem.diets) {
                        enrichedItem.tags = enrichedItem.diets;
                    }
                    
                    menuData.items.push(enrichedItem);
                    menuData.menu_items.push(enrichedItem);
                }
                
                if (menuData.items.length > 0) {
                    restaurantData.menus.push(menuData);
                }
            }
            
            // Only include restaurants that have menu items
            if (restaurantData.menus.length > 0 && restaurantData.menus.some(m => m.items.length > 0)) {
                result.push(restaurantData);
            }
        }
        
        console.log('   Returning', result.length, 'restaurants with menus');
        
        // If we couldn't build any complete restaurants, fall back to mock
        if (result.length === 0) {
            console.log('   No complete restaurants built, using mock data');
            return res.json(mockRestaurants);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        console.log('   Falling back to mock data due to error');
        res.json(mockRestaurants);
    }
});

// Get single restaurant (Schema 12_2 aligned)
app.get('/api/restaurants/:id', async (req, res) => {
    console.log(`🏪 GET /api/restaurants/${req.params.id}`);
    
    if (!supabase) {
        const restaurant = mockRestaurants.find(r => r.restaurant_id === req.params.id);
        return restaurant ? res.json(restaurant) : res.status(404).json({ error: 'Restaurant not found' });
    }
    
    try {
        // Get restaurant with full relationships per schema 12_2
        const { data: restaurant, error } = await supabase
            .from('restaurant')
            .select(`
                *,
                menus:menu(
                    *,
                    menu_items:menu_item(
                        *,
                        menu_item_tags:menu_item_tag(
                            tag:tag_id(tag_id, tag_text, tag_type, tag_description)
                        ),
                        menu_item_allergens:menu_item_allergen(
                            allergen:allergen_id(allergen_id, name, allergen_description)
                        ),
                        menu_item_images:menu_item_image(
                            display_order,
                            is_generated,
                            is_verified,
                            quality_rating,
                            image:image_id(image_id, image_url, type, alt_text, is_generated)
                        ),
                        menu_item_ingredients:menu_item_ingredient(
                            is_optional,
                            display_order,
                            ingredient:ingredient_id(ingredient_id, name, brand, possible_allergens, is_vegan, is_vegetarian, is_gluten_free)
                        ),
                        customizations:menu_item_customization(
                            is_required,
                            display_order,
                            option_type,
                            custom_option:option_id(option_id, name, option_description, option_type)
                        )
                    )
                ),
                restaurant_tags:restaurant_tag(
                    tag:tag_id(tag_id, tag_text, tag_type)
                ),
                restaurant_images:restaurant_image(
                    is_exterior,
                    is_interior,
                    is_logo,
                    is_restaurant_entrance,
                    image:image_id(image_id, image_url, type, alt_text)
                )
            `)
            .eq('restaurant_id', req.params.id)
            .single();
            
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Restaurant not found' });
            }
            throw error;
        }
        
        // Enrich menu items with nutrition and price data (via junction tables)
        if (restaurant?.menus) {
            for (const menu of restaurant.menus) {
                for (const item of menu.menu_items || []) {
                    item.nutrition = await getNutritionForMenuItem(item.menu_item_id);
                    item.current_price = await getBasePrice(item.menu_item_id);
                    item.diets = await getPossibleDiets(item.menu_item_id);
                }
            }
        }
        
        res.json(restaurant);
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({ error: 'Failed to fetch restaurant', details: error.message });
    }
});

// Get menu item nutrition (Schema 12_2 - uses menu_item_nutrition junction table)
app.get('/api/menu-items/:id/nutrition', async (req, res) => {
    console.log(`📊 GET /api/menu-items/${req.params.id}/nutrition`);
    
    if (!supabase) {
        let foundNutrition = null;
        for (const restaurant of mockRestaurants) {
            for (const menu of restaurant.menus) {
                const item = menu.items.find(i => i.menu_item_id === req.params.id);
                if (item && item.nutrition) {
                    foundNutrition = {
                        ...item.nutrition,
                        item_name: item.item_name,
                        ingredients: item.ingredients,
                        allergens: item.allergens
                    };
                    break;
                }
            }
            if (foundNutrition) break;
        }
        return res.json(foundNutrition || {
            calories: 450,
            protein_grams: 20,
            fat_grams: 15,
            carbohydrates_grams: 50,
            fiber_grams: 8,
            sodium_mg: 600,
            sugar_grams: 5
        });
    }
    
    try {
        const menuItemId = req.params.id;
        
        // Get menu item basic info
        const { data: menuItem, error: itemError } = await supabase
            .from('menu_item')
            .select('menu_item_id, display_name')
            .eq('menu_item_id', menuItemId)
            .single();
            
        if (itemError) {
            if (itemError.code === 'PGRST116') {
                return res.status(404).json({ error: 'Menu item not found' });
            }
            throw itemError;
        }
        
        // Get nutrition via menu_item_nutrition junction table
        const { data: nutritionLinks, error: nutError } = await supabase
            .from('menu_item_nutrition')
            .select(`
                nutrition:nutrition_id (
                    nutrition_id,
                    name,
                    calories,
                    protein_grams,
                    fat_grams,
                    saturated_fat_grams,
                    trans_fat_grams,
                    carbohydrates_grams,
                    sugar_grams,
                    fiber_grams,
                    sodium_mg,
                    cholesterol_mg,
                    vitamin_details,
                    portion_ounces,
                    is_verified,
                    is_generated,
                    is_complete
                )
            `)
            .eq('menu_item_id', menuItemId);
        
        // Get ingredients via menu_item_ingredient junction table
        const { data: ingredientLinks, error: ingError } = await supabase
            .from('menu_item_ingredient')
            .select(`
                is_optional,
                display_order,
                ingredient:ingredient_id (
                    ingredient_id,
                    name,
                    brand,
                    possible_allergens,
                    is_vegan,
                    is_vegetarian,
                    is_gluten_free
                )
            `)
            .eq('menu_item_id', menuItemId)
            .order('display_order');
        
        // Get allergens via menu_item_allergen junction table
        const { data: allergenLinks, error: allergError } = await supabase
            .from('menu_item_allergen')
            .select(`
                is_verified,
                allergen:allergen_id (
                    allergen_id,
                    name,
                    allergen_description,
                    contains_dairy,
                    contains_gluten,
                    contains_meat,
                    contains_tree_nut,
                    contains_shellfish,
                    contains_fish,
                    contains_soy,
                    contains_peanut,
                    contains_sesame,
                    contains_egg
                )
            `)
            .eq('menu_item_id', menuItemId);
        
        // Get diets
        const diets = await getPossibleDiets(menuItemId);
        
        // Format the response
        const nutrition = nutritionLinks?.[0]?.nutrition || null;
        const response = {
            menu_item_id: parseInt(menuItemId),
            item_name: menuItem.display_name,
            nutrition: nutrition,
            ingredients: (ingredientLinks || []).map(il => ({
                name: il.ingredient?.name,
                brand: il.ingredient?.brand,
                is_optional: il.is_optional,
                is_vegan: il.ingredient?.is_vegan,
                is_vegetarian: il.ingredient?.is_vegetarian,
                is_gluten_free: il.ingredient?.is_gluten_free,
                possible_allergens: il.ingredient?.possible_allergens
            })),
            allergens: (allergenLinks || []).map(al => ({
                name: al.allergen?.name,
                description: al.allergen?.allergen_description,
                is_verified: al.is_verified
            })),
            diets: diets
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching nutrition:', error);
        res.status(500).json({ error: 'Failed to fetch nutrition data', details: error.message });
    }
});

// Create menu item (Schema 12_2 - uses junction tables)
app.post('/api/menu-items', async (req, res) => {
    console.log('➕ POST /api/menu-items', req.body);
    
    if (!supabase) {
        const newItem = {
            menu_item_id: generateId(),
            item_name: req.body.display_name || req.body.item_name,
            short_name: req.body.short_name || '',
            description: req.body.item_description || req.body.description || '',
            long_description: req.body.long_description || '',
            base_price: parseFloat(req.body.base_price) || 0,
            portion_size: req.body.portion_size || '',
            meal_type: req.body.meal_type || 'All Day',
            tags: req.body.tags || [],
            image_url: req.body.image_url || null,
            nutrition: req.body.nutrition || {},
            ingredients: req.body.ingredients || [],
            allergens: req.body.allergens || []
        };
        
        if (mockRestaurants.length > 0 && mockRestaurants[0].menus.length > 0) {
            mockRestaurants[0].menus[0].items.push(newItem);
        }
        
        return res.status(201).json({
            success: true,
            menu_item_id: newItem.menu_item_id,
            message: 'Menu item created successfully'
        });
    }
    
    try {
        // Create the menu item first (per schema 12_2: menu_item.menu_id FK)
        const { data: menuItem, error: menuItemError } = await supabase
            .from('menu_item')
            .insert({
                menu_id: req.body.menu_id,
                display_name: req.body.display_name || req.body.item_name,
                three_word_short_name: req.body.short_name,
                item_description: req.body.item_description || req.body.description,
                fifty_char_description: req.body.fifty_char_description,
                hundred_char_description: req.body.hundred_char_description,
                image_generation_characteristics: req.body.image_generation_characteristics,
                serving_size: req.body.serving_size,
                meal_type: req.body.meal_type || 'All Day',
                item_type: req.body.item_type || 'Entree',
                is_customizable: req.body.is_customizable || false,
                is_verified: false,
                is_active: true
            })
            .select()
            .single();
            
        if (menuItemError) throw menuItemError;
        
        const menuItemId = menuItem.menu_item_id;
        
        // Create nutrition if provided and link via menu_item_nutrition
        if (req.body.nutrition) {
            const { data: nutritionData, error: nutritionError } = await supabase
                .from('nutrition')
                .insert({
                    name: `${req.body.display_name} nutrition`,
                    calories: req.body.nutrition.calories,
                    protein_grams: req.body.nutrition.protein_grams,
                    fat_grams: req.body.nutrition.fat_grams,
                    saturated_fat_grams: req.body.nutrition.saturated_fat_grams,
                    carbohydrates_grams: req.body.nutrition.carbohydrates_grams,
                    fiber_grams: req.body.nutrition.fiber_grams,
                    sugar_grams: req.body.nutrition.sugar_grams,
                    sodium_mg: req.body.nutrition.sodium_mg,
                    cholesterol_mg: req.body.nutrition.cholesterol_mg,
                    is_verified: false
                })
                .select()
                .single();
                
            if (!nutritionError && nutritionData) {
                // Link via menu_item_nutrition junction table
                await supabase
                    .from('menu_item_nutrition')
                    .insert({
                        menu_item_id: menuItemId,
                        nutrition_id: nutritionData.nutrition_id
                    });
            }
        }
        
        // Create price if provided (per schema: item_price table)
        if (req.body.base_price) {
            await supabase
                .from('item_price')
                .insert({
                    menu_item_id: menuItemId,
                    price_cents: Math.round(parseFloat(req.body.base_price) * 100),
                    is_active: true,
                    updated_at: new Date().toISOString()
                });
        }
        
        // Link allergens if provided (via menu_item_allergen junction)
        if (req.body.allergen_ids && Array.isArray(req.body.allergen_ids)) {
            for (const allergenId of req.body.allergen_ids) {
                await supabase
                    .from('menu_item_allergen')
                    .insert({
                        menu_item_id: menuItemId,
                        allergen_id: allergenId,
                        is_verified: false
                    });
            }
        }
        
        // Link diets if provided (via menu_item_diet junction)
        if (req.body.diet_ids && Array.isArray(req.body.diet_ids)) {
            for (const dietId of req.body.diet_ids) {
                await supabase
                    .from('menu_item_diet')
                    .insert({
                        menu_item_id: menuItemId,
                        diet_id: dietId
                    });
            }
        }
        
        res.status(201).json({
            success: true,
            menu_item_id: menuItemId,
            message: 'Menu item created successfully',
            data: menuItem
        });
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'Failed to create menu item', details: error.message });
    }
});

// Update menu item (Schema 12_2 aligned)
app.put('/api/menu-items/:id', async (req, res) => {
    console.log(`✏️ PUT /api/menu-items/${req.params.id}`, req.body);
    
    if (!supabase) {
        let updated = false;
        for (const restaurant of mockRestaurants) {
            for (const menu of restaurant.menus) {
                const itemIndex = menu.items.findIndex(i => i.menu_item_id === req.params.id);
                if (itemIndex !== -1) {
                    const item = menu.items[itemIndex];
                    if (req.body.display_name) item.item_name = req.body.display_name;
                    if (req.body.short_name) item.short_name = req.body.short_name;
                    if (req.body.item_description) item.description = req.body.item_description;
                    if (req.body.base_price) item.base_price = parseFloat(req.body.base_price);
                    if (req.body.portion_size) item.portion_size = req.body.portion_size;
                    if (req.body.meal_type) item.meal_type = req.body.meal_type;
                    
                    updated = true;
                    return res.json({
                        success: true,
                        message: 'Menu item updated successfully',
                        item: menu.items[itemIndex]
                    });
                }
            }
        }
        if (!updated) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
    }
    
    try {
        const menuItemId = req.params.id;
        
        // Build update object with schema 12_2 field names
        const updateData = {};
        if (req.body.display_name) updateData.display_name = req.body.display_name;
        if (req.body.short_name) updateData.three_word_short_name = req.body.short_name;
        if (req.body.item_description) updateData.item_description = req.body.item_description;
        if (req.body.fifty_char_description) updateData.fifty_char_description = req.body.fifty_char_description;
        if (req.body.hundred_char_description) updateData.hundred_char_description = req.body.hundred_char_description;
        if (req.body.image_generation_characteristics) updateData.image_generation_characteristics = req.body.image_generation_characteristics;
        if (req.body.serving_size) updateData.serving_size = req.body.serving_size;
        if (req.body.meal_type) updateData.meal_type = req.body.meal_type;
        if (req.body.item_type) updateData.item_type = req.body.item_type;
        if (req.body.is_customizable !== undefined) updateData.is_customizable = req.body.is_customizable;
        if (req.body.is_verified !== undefined) updateData.is_verified = req.body.is_verified;
        if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active;
        if (req.body.menu_id) updateData.menu_id = req.body.menu_id;
        if (req.body.note) updateData.note = req.body.note;
        
        updateData.updated_at = new Date().toISOString();
        
        const { data: menuItem, error } = await supabase
            .from('menu_item')
            .update(updateData)
            .eq('menu_item_id', menuItemId)
            .select()
            .single();
            
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Menu item not found' });
            }
            throw error;
        }
        
        // Update price if provided (update or insert in item_price table)
        if (req.body.base_price !== undefined) {
            // First check if price exists
            const { data: existingPrice } = await supabase
                .from('item_price')
                .select('price_id')
                .eq('menu_item_id', menuItemId)
                .eq('is_active', true)
                .limit(1);
            
            if (existingPrice && existingPrice.length > 0) {
                // Update existing price
                await supabase
                    .from('item_price')
                    .update({
                        price_cents: Math.round(parseFloat(req.body.base_price) * 100),
                        updated_at: new Date().toISOString()
                    })
                    .eq('price_id', existingPrice[0].price_id);
            } else {
                // Insert new price
                await supabase
                    .from('item_price')
                    .insert({
                        menu_item_id: menuItemId,
                        price_cents: Math.round(parseFloat(req.body.base_price) * 100),
                        is_active: true,
                        updated_at: new Date().toISOString()
                    });
            }
        }
        
        res.json({
            success: true,
            message: 'Menu item updated successfully',
            item: menuItem
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Failed to update menu item', details: error.message });
    }
});

// Delete menu item
app.delete('/api/menu-items/:id', async (req, res) => {
    console.log(`🗑️ DELETE /api/menu-items/${req.params.id}`);
    
    if (!supabase) {
        let deleted = false;
        for (const restaurant of mockRestaurants) {
            for (const menu of restaurant.menus) {
                const itemIndex = menu.items.findIndex(i => i.menu_item_id === req.params.id);
                if (itemIndex !== -1) {
                    menu.items.splice(itemIndex, 1);
                    deleted = true;
                    return res.json({
                        success: true,
                        message: 'Menu item deleted successfully'
                    });
                }
            }
        }
        if (!deleted) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
    }
    
    try {
        // Soft delete by setting is_active to false
        const { data: menuItem, error } = await supabase
            .from('menu_item')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('menu_item_id', req.params.id)
            .select()
            .single();
            
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Menu item not found' });
            }
            throw error;
        }
        
        res.json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Failed to delete menu item', details: error.message });
    }
});

// ========================================
// Customization Options & Values Endpoints
// ========================================

// Get all customization options for a menu item (Schema 12_2 aligned)
app.get('/api/menu-items/:id/customizations', async (req, res) => {
    console.log(`🎛️ GET /api/menu-items/${req.params.id}/customizations`);
    
    if (!supabase) {
        return res.json([]);
    }
    
    try {
        const menuItemId = req.params.id;
        
        // Get customizations via menu_item_customization junction table
        const { data: customizations, error } = await supabase
            .from('menu_item_customization')
            .select(`
                menu_item_id,
                option_id,
                is_required,
                display_order,
                option_type,
                custom_option:option_id(
                    option_id,
                    name,
                    option_description,
                    option_type,
                    notes,
                    is_active,
                    option_values:option_value(
                        value_id,
                        value_name,
                        is_available,
                        available_from,
                        available_until,
                        display_order,
                        twelve_word_description,
                        image_generation_description,
                        generated_ingredient_list
                    )
                )
            `)
            .eq('menu_item_id', menuItemId)
            .order('display_order');
            
        if (error) throw error;
        
        // Enrich option values with nutrition, diets, and allergens
        for (const customization of customizations || []) {
            if (customization.custom_option?.option_values) {
                for (const value of customization.custom_option.option_values) {
                    // Get nutrition for this option value
                    const { data: nutritionData } = await supabase
                        .from('option_value_nutrition')
                        .select(`
                            nutrition:nutrition_id (
                                calories,
                                protein_grams,
                                fat_grams,
                                carbohydrates_grams,
                                fiber_grams,
                                sodium_mg,
                                sugar_grams
                            )
                        `)
                        .eq('value_id', value.value_id)
                        .limit(1);
                    
                    value.nutrition = nutritionData?.[0]?.nutrition || null;
                    
                    // Get diets for this option value
                    const { data: dietData } = await supabase
                        .from('option_value_diet')
                        .select(`
                            diet:diet_id (
                                diet_id,
                                diet_name
                            )
                        `)
                        .eq('value_id', value.value_id);
                    
                    value.diets = (dietData || []).map(d => d.diet?.diet_name).filter(Boolean);
                    
                    // Get allergens for this option value
                    const { data: allergenData } = await supabase
                        .from('option_value_allergen')
                        .select(`
                            allergen:allergen_id (
                                name
                            )
                        `)
                        .eq('value_id', value.value_id);
                    
                    value.allergens = (allergenData || []).map(a => a.allergen?.name).filter(Boolean);
                    
                    // Get price for this option value
                    const { data: priceData } = await supabase
                        .from('item_price')
                        .select('price_cents')
                        .eq('value_id', value.value_id)
                        .eq('is_active', true)
                        .limit(1);
                    
                    value.price = priceData?.[0] ? (priceData[0].price_cents / 100) : null;
                }
            }
        }
        
        res.json(customizations || []);
    } catch (error) {
        console.error('Error fetching customizations:', error);
        res.status(500).json({ error: 'Failed to fetch customizations', details: error.message });
    }
});

// Get all option values for a customization option (Schema 12_2 aligned)
app.get('/api/custom-options/:id/values', async (req, res) => {
    console.log(`🔧 GET /api/custom-options/${req.params.id}/values`);
    
    if (!supabase) {
        return res.json([]);
    }
    
    try {
        const optionId = req.params.id;
        
        // Get option values
        const { data: values, error } = await supabase
            .from('option_value')
            .select(`
                value_id,
                option_id,
                value_name,
                is_available,
                available_from,
                available_until,
                display_order,
                twelve_word_description,
                image_generation_description,
                generated_ingredient_list,
                menu_id,
                brand_id
            `)
            .eq('option_id', optionId)
            .eq('is_available', true)
            .order('display_order');
            
        if (error) throw error;
        
        // Enrich each value with related data
        for (const value of values || []) {
            // Get nutrition via option_value_nutrition junction table
            const { data: nutritionData } = await supabase
                .from('option_value_nutrition')
                .select(`
                    nutrition:nutrition_id (
                        nutrition_id,
                        calories,
                        protein_grams,
                        fat_grams,
                        saturated_fat_grams,
                        carbohydrates_grams,
                        sugar_grams,
                        fiber_grams,
                        sodium_mg,
                        cholesterol_mg,
                        is_verified
                    )
                `)
                .eq('value_id', value.value_id)
                .limit(1);
            
            value.nutrition = nutritionData?.[0]?.nutrition || null;
            
            // Get ingredients via option_value_ingredient junction table
            const { data: ingredientData } = await supabase
                .from('option_value_ingredient')
                .select(`
                    ingredient:ingredient_id (
                        ingredient_id,
                        name,
                        brand,
                        possible_allergens,
                        is_vegan,
                        is_vegetarian,
                        is_gluten_free
                    )
                `)
                .eq('value_id', value.value_id);
            
            value.ingredients = (ingredientData || [])
                .map(i => i.ingredient)
                .filter(Boolean);
            
            // Get allergens via option_value_allergen junction table
            const { data: allergenData } = await supabase
                .from('option_value_allergen')
                .select(`
                    allergen:allergen_id (
                        allergen_id,
                        name,
                        allergen_description
                    )
                `)
                .eq('value_id', value.value_id);
            
            value.allergens = (allergenData || [])
                .map(a => a.allergen)
                .filter(Boolean);
            
            // Get diets via option_value_diet junction table
            const { data: dietData } = await supabase
                .from('option_value_diet')
                .select(`
                    diet:diet_id (
                        diet_id,
                        diet_name,
                        description
                    )
                `)
                .eq('value_id', value.value_id);
            
            value.diets = (dietData || [])
                .map(d => d.diet)
                .filter(Boolean);
            
            // Get price from item_price table
            const { data: priceData } = await supabase
                .from('item_price')
                .select('price_cents, valid_from, valid_until')
                .eq('value_id', value.value_id)
                .eq('is_active', true)
                .order('updated_at', { ascending: false })
                .limit(1);
            
            value.price = priceData?.[0] ? {
                cents: priceData[0].price_cents,
                dollars: (priceData[0].price_cents / 100).toFixed(2),
                valid_from: priceData[0].valid_from,
                valid_until: priceData[0].valid_until
            } : null;
            
            // Get images via option_value_image junction table
            const { data: imageData } = await supabase
                .from('option_value_image')
                .select(`
                    image:image_id (
                        image_id,
                        image_url,
                        type,
                        alt_text,
                        is_generated
                    )
                `)
                .eq('value_id', value.value_id);
            
            value.images = (imageData || [])
                .map(i => i.image)
                .filter(Boolean);
        }
        
        res.json(values || []);
    } catch (error) {
        console.error('Error fetching option values:', error);
        res.status(500).json({ error: 'Failed to fetch option values', details: error.message });
    }
});

// Create a new option value
app.post('/api/custom-options/:id/values', async (req, res) => {
    console.log(`➕ POST /api/custom-options/${req.params.id}/values`, req.body);
    
    if (!supabase) {
        return res.status(503).json({ error: 'Supabase not configured' });
    }
    
    try {
        const { data: value, error } = await supabase
            .from('option_value')
            .insert({
                option_id: req.params.id,
                value_name: req.body.value_name,
                default_portion: req.body.default_portion,
                is_available: req.body.is_available !== undefined ? req.body.is_available : true,
                display_order: req.body.display_order || 0,
                twelve_word_description: req.body.twelve_word_description,
                nutrition_id: req.body.nutrition_id
            })
            .select()
            .single();
            
        if (error) throw error;
        
        res.status(201).json({
            success: true,
            value_id: value.value_id,
            message: 'Option value created successfully',
            data: value
        });
    } catch (error) {
        console.error('Error creating option value:', error);
        res.status(500).json({ error: 'Failed to create option value', details: error.message });
    }
});

// ========================================
// Image Endpoints
// ========================================

// Get images for a menu item
app.get('/api/menu-items/:id/images', async (req, res) => {
    console.log(`🖼️ GET /api/menu-items/${req.params.id}/images`);
    
    if (!supabase) {
        return res.json([]);
    }
    
    try {
        const { data: images, error } = await supabase
            .from('menu_item_image')
            .select(`
                menu_item_id,
                image_id,
                is_generated,
                is_verified,
                display_order,
                quality_rating,
                image:image(
                    image_id,
                    image_url,
                    type,
                    alt_text,
                    is_generated,
                    is_verified,
                    quality_rating
                )
            `)
            .eq('menu_item_id', req.params.id)
            .order('display_order');
            
        if (error) throw error;
        
        res.json(images || []);
    } catch (error) {
        console.error('Error fetching menu item images:', error);
        res.status(500).json({ error: 'Failed to fetch images', details: error.message });
    }
});

// Get images for a restaurant
app.get('/api/restaurants/:id/images', async (req, res) => {
    console.log(`🖼️ GET /api/restaurants/${req.params.id}/images`);
    
    if (!supabase) {
        return res.json([]);
    }
    
    try {
        const { data: images, error } = await supabase
            .from('restaurant_image')
            .select(`
                restaurant_id,
                image_id,
                is_exterior,
                is_interior,
                is_logo,
                is_restaurant_entrance,
                image:image(
                    image_id,
                    image_url,
                    type,
                    alt_text,
                    is_verified,
                    quality_rating
                )
            `)
            .eq('restaurant_id', req.params.id);
            
        if (error) throw error;
        
        res.json(images || []);
    } catch (error) {
        console.error('Error fetching restaurant images:', error);
        res.status(500).json({ error: 'Failed to fetch images', details: error.message });
    }
});

// Add image to menu item
app.post('/api/menu-items/:id/images', async (req, res) => {
    console.log(`➕ POST /api/menu-items/${req.params.id}/images`, req.body);
    
    if (!supabase) {
        return res.status(503).json({ error: 'Supabase not configured' });
    }
    
    try {
        // First create the image record
        const { data: image, error: imageError } = await supabase
            .from('image')
            .insert({
                image_url: req.body.image_url,
                type: req.body.type || 'food',
                alt_text: req.body.alt_text,
                is_generated: req.body.is_generated || false,
                is_food: true,
                quality_rating: req.body.quality_rating,
                is_verified: req.body.is_verified || false
            })
            .select()
            .single();
            
        if (imageError) throw imageError;
        
        // Link the image to the menu item
        const { data: menuItemImage, error: linkError } = await supabase
            .from('menu_item_image')
            .insert({
                menu_item_id: req.params.id,
                image_id: image.image_id,
                is_generated: req.body.is_generated || false,
                is_verified: req.body.is_verified || false,
                display_order: req.body.display_order || 0,
                quality_rating: req.body.quality_rating
            })
            .select()
            .single();
            
        if (linkError) throw linkError;
        
        res.status(201).json({
            success: true,
            image_id: image.image_id,
            message: 'Image added successfully',
            data: { image, menuItemImage }
        });
    } catch (error) {
        console.error('Error adding image:', error);
        res.status(500).json({ error: 'Failed to add image', details: error.message });
    }
});

// Search restaurants
app.get('/api/search', (req, res) => {
    console.log('🔍 GET /api/search', req.query);
    
    const query = (req.query.q || '').toLowerCase();
    const dietary = req.query.dietary || [];
    const tags = Array.isArray(dietary) ? dietary : [dietary];
    
    let results = mockRestaurants;
    
    // Filter by search query
    if (query) {
        results = results.filter(restaurant => {
            const nameMatch = restaurant.restaurant_name.toLowerCase().includes(query);
            const cuisineMatch = restaurant.cuisine.toLowerCase().includes(query);
            const menuMatch = restaurant.menus.some(menu =>
                menu.items.some(item =>
                    item.item_name.toLowerCase().includes(query) ||
                    (item.description && item.description.toLowerCase().includes(query))
                )
            );
            return nameMatch || cuisineMatch || menuMatch;
        });
    }
    
    // Filter by dietary tags
    if (tags.length > 0 && tags[0] !== '') {
        results = results.filter(restaurant =>
            restaurant.menus.some(menu =>
                menu.items.some(item =>
                    item.tags && item.tags.some(tag =>
                        tags.some(searchTag =>
                            tag.toLowerCase().includes(searchTag.toLowerCase())
                        )
                    )
                )
            )
        );
    }
    
    res.json(results);
});

// Get restaurant stats
app.get('/api/stats', (req, res) => {
    console.log('📈 GET /api/stats');
    
    const stats = {
        total_restaurants: mockRestaurants.length,
        total_menu_items: mockRestaurants.reduce((sum, r) =>
            sum + r.menus.reduce((menuSum, m) => menuSum + m.items.length, 0), 0
        ),
        verified_restaurants: mockRestaurants.filter(r => r.is_verified).length,
        cuisines: [...new Set(mockRestaurants.map(r => r.cuisine))],
        average_rating: (mockRestaurants.reduce((sum, r) => sum + r.rating, 0) / mockRestaurants.length).toFixed(1)
    };
    
    res.json(stats);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        restaurants_loaded: mockRestaurants.length,
        database: supabase ? 'supabase' : 'mock'
    });
});

// Debug endpoint to check Supabase tables
app.get('/api/debug/tables', async (req, res) => {
    console.log('🔧 GET /api/debug/tables');
    
    if (!supabase) {
        return res.json({ error: 'Supabase not configured' });
    }
    
    try {
        // Check counts in key tables
        const tables = ['restaurant', 'menu', 'menu_item', 'nutrition', 'ingredient', 'allergen', 'diet'];
        const counts = {};
        
        for (const table of tables) {
            try {
                const { data, error, count } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                
                if (error) {
                    counts[table] = { error: error.message };
                } else {
                    counts[table] = { count: count };
                }
            } catch (e) {
                counts[table] = { error: e.message };
            }
        }
        
        // Get sample restaurant data
        const { data: sampleRestaurants, error: restError } = await supabase
            .from('restaurant')
            .select('*')
            .limit(3);
        
        // Get sample menu data
        const { data: sampleMenus, error: menuError } = await supabase
            .from('menu')
            .select('*')
            .limit(3);
        
        // Get sample menu_item data
        const { data: sampleItems, error: itemError } = await supabase
            .from('menu_item')
            .select('*')
            .limit(3);
        
        res.json({
            supabase_connected: true,
            table_counts: counts,
            samples: {
                restaurants: sampleRestaurants || [],
                restaurants_error: restError?.message,
                menus: sampleMenus || [],
                menus_error: menuError?.message,
                menu_items: sampleItems || [],
                menu_items_error: itemError?.message
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// Enhanced Menu Item Endpoints (v3)
// ========================================

// GET /api/menu-items/:id - Get menu item with enhanced details
app.get('/api/menu-items/:id', async (req, res) => {
    console.log(`🍽️ GET /api/menu-items/${req.params.id}`);
    
    if (!supabase) {
        // Fallback to mock data
        for (const restaurant of mockRestaurants) {
            for (const menu of restaurant.menus) {
                const item = menu.items.find(i => i.menu_item_id === req.params.id);
                if (item) {
                    return res.json({
                        data: {
                            menu_item_id: item.menu_item_id,
                            display_name: item.item_name,
                            restaurant: restaurant.restaurant_name,
                            base_price: item.base_price,
                            calories_range: `${item.nutrition?.calories || 0}–${(item.nutrition?.calories || 0) + 200}`,
                            diets_possible: item.tags?.filter(t => ['vegan', 'vegetarian', 'gluten-free'].includes(t)) || [],
                            images: item.image_url ? [{ url: item.image_url, type: 'food', is_generated: false }] : [],
                            custom_options: []
                        }
                    });
                }
            }
        }
        return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    
    try {
        const menuItemId = req.params.id;

        // Get base menu item
        const { data: menuItem, error: itemError } = await supabase
            .from('menu_item')
            .select('*')
            .eq('menu_item_id', menuItemId)
            .single();

        if (itemError) throw itemError;

        // Get restaurant name
        const restaurant = await getRestaurantForMenuItem(menuItemId);

        // Get base price
        const basePrice = await getBasePrice(menuItemId);

        // Get nutrition
        const nutrition = await getNutritionForMenuItem(menuItemId);

        // Get customization options
        const { data: customizations, error: custError } = await supabase
            .from('menu_item_customization')
            .select(`
                *,
                custom_option:option_id (
                    option_id,
                    name,
                    option_type
                )
            `)
            .eq('menu_item_id', menuItemId)
            .order('display_order');

        // Get diets
        const diets = await getPossibleDiets(menuItemId);

        // Get images
        const { data: images, error: imgError } = await supabase
            .from('menu_item_image')
            .select(`
                *,
                image:image_id (
                    image_url,
                    type,
                    is_generated
                )
            `)
            .eq('menu_item_id', menuItemId)
            .order('display_order');

        // Calculate calories range
        const caloriesRange = getCaloriesRange(nutrition, customizations);

        // Format custom options
        const customOptions = (customizations || []).map(c => ({
            option_id: c.custom_option?.option_id,
            name: c.custom_option?.name,
            is_required: c.is_required,
            type: c.custom_option?.option_type
        }));

        // Format images
        const formattedImages = (images || []).map(img => ({
            url: img.image?.image_url,
            type: img.image?.type || 'food',
            is_generated: img.image?.is_generated || false
        }));

        res.json({
            data: {
                menu_item_id: parseInt(menuItemId),
                display_name: menuItem.display_name,
                restaurant: restaurant?.name || 'Unknown Restaurant',
                base_price: basePrice ? parseFloat(basePrice) : null,
                calories_range: caloriesRange,
                diets_possible: diets,
                images: formattedImages,
                custom_options: customOptions
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/menu-items/:id/configure - Configure a menu item with specific options
app.get('/api/menu-items/:id/configure', async (req, res) => {
    console.log(`⚙️ GET /api/menu-items/${req.params.id}/configure`);
    
    if (!supabase) {
        return res.status(503).json({ success: false, error: 'Supabase not configured for configuration endpoint' });
    }
    
    try {
        const menuItemId = req.params.id;
        const { options } = req.query; // Expected format: ?options=value_id1,value_id2,value_id3

        // Get base menu item
        const { data: menuItem, error: itemError } = await supabase
            .from('menu_item')
            .select('*')
            .eq('menu_item_id', menuItemId)
            .single();

        if (itemError) throw itemError;

        // Get base nutrition
        const baseNutrition = await getNutritionForMenuItem(menuItemId);

        // Get base price
        const basePrice = await getBasePrice(menuItemId);

        // Initialize totals
        let totalPrice = parseFloat(basePrice) || 0;
        let totalCalories = baseNutrition?.calories || 0;
        let totalProtein = parseFloat(baseNutrition?.protein_grams) || 0;
        let totalFat = parseFloat(baseNutrition?.fat_grams) || 0;
        let totalCarbs = parseFloat(baseNutrition?.carbohydrates_grams) || 0;

        let configuredName = menuItem.display_name;
        const breakdown = [
            { name: `Base ${menuItem.display_name}`, price: parseFloat(basePrice) || 0 }
        ];

        const dietSets = [];
        const allergensPresentSet = new Set();
        const allergensPossibleSet = new Set();

        // Get base diets
        const baseDiets = await getPossibleDiets(menuItemId);
        if (baseDiets.length > 0) {
            dietSets.push(new Set(baseDiets));
        }

        // Process selected options
        if (options) {
            const valueIds = options.split(',').map(id => id.trim()).filter(Boolean);

            for (const valueId of valueIds) {
                // Get option value details
                const { data: optionValues, error: valError } = await supabase
                    .from('option_value')
                    .select('*')
                    .eq('value_id', valueId)
                    .limit(1);

                if (!valError && optionValues && optionValues.length > 0) {
                    const optionValue = optionValues[0];
                    configuredName += ` + ${optionValue.value_name}`;

                    // Get nutrition for this option value
                    const { data: optionNutritionData, error: nutError } = await supabase
                        .from('option_value_nutrition')
                        .select(`
                            nutrition:nutrition_id (*)
                        `)
                        .eq('value_id', valueId)
                        .limit(1);

                    if (!nutError && optionNutritionData && optionNutritionData.length > 0) {
                        const optionNutrition = optionNutritionData[0];
                        if (optionNutrition?.nutrition) {
                            totalCalories += optionNutrition.nutrition.calories || 0;
                            totalProtein += parseFloat(optionNutrition.nutrition.protein_grams) || 0;
                            totalFat += parseFloat(optionNutrition.nutrition.fat_grams) || 0;
                            totalCarbs += parseFloat(optionNutrition.nutrition.carbohydrates_grams) || 0;
                        }
                    }

                    // Get price for this option value
                    const { data: optionPrices, error: priceError } = await supabase
                        .from('item_price')
                        .select('price_cents')
                        .eq('value_id', valueId)
                        .eq('is_active', true)
                        .limit(1);

                    const optionPriceValue = (optionPrices && optionPrices.length > 0) ? (optionPrices[0].price_cents / 100) : 0;
                    totalPrice += optionPriceValue;

                    breakdown.push({
                        name: optionValue.value_name,
                        price: parseFloat(optionPriceValue.toFixed(2))
                    });

                    // Get diets for this option value
                    const { data: optionDiets, error: dietError } = await supabase
                        .from('option_value_diet')
                        .select(`
                            diet:diet_id (
                                diet_name
                            )
                        `)
                        .eq('value_id', valueId);

                    if (!dietError && optionDiets) {
                        const dietNames = optionDiets.map(d => d.diet?.diet_name).filter(Boolean);
                        if (dietNames.length > 0) {
                            dietSets.push(new Set(dietNames));
                        }
                    }

                    // Get allergens for this option value
                    const { data: optionAllergens, error: allergError } = await supabase
                        .from('option_value_allergen')
                        .select(`
                            allergen:allergen_id (
                                name
                            )
                        `)
                        .eq('value_id', valueId);

                    if (!allergError && optionAllergens) {
                        optionAllergens.forEach(a => {
                            if (a.allergen?.name) {
                                allergensPresentSet.add(a.allergen.name);
                            }
                        });
                    }
                }
            }
        }

        // Calculate intersection of diets
        let compatibleDiets = [];
        if (dietSets.length > 0) {
            compatibleDiets = Array.from(dietSets[0]);
            for (let i = 1; i < dietSets.length; i++) {
                compatibleDiets = compatibleDiets.filter(diet => dietSets[i].has(diet));
            }
        }

        // Get possible allergens from ingredients
        const { data: ingredients, error: ingError } = await supabase
            .from('menu_item_ingredient')
            .select(`
                ingredient:ingredient_id (
                    possible_allergens
                )
            `)
            .eq('menu_item_id', menuItemId);

        if (!ingError && ingredients) {
            ingredients.forEach(ing => {
                if (ing.ingredient?.possible_allergens) {
                    const possibleAllergens = ing.ingredient.possible_allergens.split(',');
                    possibleAllergens.forEach(a => allergensPossibleSet.add(a.trim()));
                }
            });
        }

        // Get best image
        const { data: bestImages, error: imgError } = await supabase
            .from('menu_item_image')
            .select(`
                image:image_id (
                    image_url
                )
            `)
            .eq('menu_item_id', menuItemId)
            .order('quality_rating', { ascending: false })
            .order('display_order', { ascending: true })
            .limit(1);

        const bestImageUrl = (bestImages && bestImages.length > 0) ? bestImages[0].image?.image_url : null;

        res.json({
            data: {
                configured_item: configuredName,
                total_price: parseFloat(totalPrice.toFixed(2)),
                nutrition: {
                    calories: Math.round(totalCalories),
                    protein_grams: Math.round(totalProtein),
                    fat_grams: Math.round(totalFat),
                    carbs_grams: Math.round(totalCarbs)
                },
                diets: compatibleDiets,
                allergens_present: allergensPresentSet.size > 0 ? Array.from(allergensPresentSet) : ['none'],
                allergens_possible: Array.from(allergensPossibleSet),
                breakdown: breakdown,
                best_image: bestImageUrl
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/menu-items/:id/options/filter - Filter customization options
app.get('/api/menu-items/:id/options/filter', async (req, res) => {
    console.log(`🔎 GET /api/menu-items/${req.params.id}/options/filter`);
    
    if (!supabase) {
        return res.status(503).json({ success: false, error: 'Supabase not configured' });
    }
    
    try {
        const menuItemId = req.params.id;
        const { diet, exclude_allergens, max_calories, min_protein } = req.query;

        // Get all customization options for this menu item
        const { data: customizations, error: custError } = await supabase
            .from('menu_item_customization')
            .select(`
                *,
                custom_option:option_id (
                    option_id,
                    name,
                    option_type
                )
            `)
            .eq('menu_item_id', menuItemId)
            .order('display_order');

        if (custError) throw custError;

        const filteredOptions = [];

        for (const customization of customizations || []) {
            const optionId = customization.custom_option?.option_id;
            if (!optionId) continue;

            // Get option values for this customization
            const { data: optionValues, error: valError } = await supabase
                .from('option_value')
                .select('*')
                .eq('option_id', optionId)
                .eq('is_available', true);

            if (valError || !optionValues) continue;

            const filteredValues = [];

            for (const value of optionValues) {
                let passesFilter = true;

                // Filter by diet
                if (diet && passesFilter) {
                    const { data: valueDiets, error: dietError } = await supabase
                        .from('option_value_diet')
                        .select(`
                            diet:diet_id (
                                diet_name
                            )
                        `)
                        .eq('value_id', value.value_id);

                    if (!dietError && valueDiets) {
                        const dietNames = valueDiets.map(d => d.diet?.diet_name?.toLowerCase());
                        passesFilter = dietNames.includes(diet.toLowerCase());
                    } else {
                        passesFilter = false;
                    }
                }

                // Filter by allergen exclusions
                if (exclude_allergens && passesFilter) {
                    const excludedAllergens = exclude_allergens.split(',').map(a => a.trim().toLowerCase());
                    
                    const { data: valueAllergens, error: allergError } = await supabase
                        .from('option_value_allergen')
                        .select(`
                            allergen:allergen_id (
                                name
                            )
                        `)
                        .eq('value_id', value.value_id);

                    if (!allergError && valueAllergens) {
                        const allergenNames = valueAllergens.map(a => a.allergen?.name?.toLowerCase()).filter(Boolean);
                        const hasExcludedAllergen = allergenNames.some(name => 
                            excludedAllergens.some(excluded => name.includes(excluded))
                        );
                        passesFilter = !hasExcludedAllergen;
                    }
                }

                // Filter by max calories
                if (max_calories && passesFilter) {
                    const { data: nutritionData, error: nutError } = await supabase
                        .from('option_value_nutrition')
                        .select(`
                            nutrition:nutrition_id (
                                calories
                            )
                        `)
                        .eq('value_id', value.value_id)
                        .limit(1);

                    if (!nutError && nutritionData && nutritionData.length > 0 && nutritionData[0].nutrition?.calories) {
                        passesFilter = nutritionData[0].nutrition.calories <= parseInt(max_calories);
                    }
                }

                // Filter by min protein
                if (min_protein && passesFilter) {
                    const { data: nutritionData, error: nutError } = await supabase
                        .from('option_value_nutrition')
                        .select(`
                            nutrition:nutrition_id (
                                protein_grams
                            )
                        `)
                        .eq('value_id', value.value_id)
                        .limit(1);

                    if (!nutError && nutritionData && nutritionData.length > 0 && nutritionData[0].nutrition?.protein_grams) {
                        passesFilter = parseFloat(nutritionData[0].nutrition.protein_grams) >= parseFloat(min_protein);
                    } else {
                        passesFilter = false;
                    }
                }

                if (passesFilter) {
                    filteredValues.push(value);
                }
            }

            if (filteredValues.length > 0) {
                filteredOptions.push({
                    option_id: customization.custom_option.option_id,
                    name: customization.custom_option.name,
                    is_required: customization.is_required,
                    type: customization.custom_option.option_type,
                    filtered_values: filteredValues
                });
            }
        }

        res.json({
            success: true,
            menu_item_id: parseInt(menuItemId),
            filters_applied: {
                diet: diet || null,
                exclude_allergens: exclude_allergens || null,
                max_calories: max_calories || null,
                min_protein: min_protein || null
            },
            options: filteredOptions
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/menu-items/search - Advanced search with multiple filters
app.get('/api/menu-items/search', async (req, res) => {
    console.log('🔍 GET /api/menu-items/search', req.query);
    
    if (!supabase) {
        // Fallback to mock data search
        const { query } = req.query;
        let results = [];
        for (const restaurant of mockRestaurants) {
            for (const menu of restaurant.menus) {
                for (const item of menu.items) {
                    if (!query || item.item_name.toLowerCase().includes(query.toLowerCase())) {
                        results.push({
                            ...item,
                            restaurant_name: restaurant.restaurant_name
                        });
                    }
                }
            }
        }
        return res.json({ success: true, count: results.length, menu_items: results });
    }
    
    try {
        const { 
            query, 
            diet, 
            max_price, 
            min_protein, 
            max_calories,
            is_customizable,
            restaurant_id,
            restaurant_tags,
            limit = 50 
        } = req.query;

        let menuItemsQuery = supabase
            .from('menu_item')
            .select('*')
            .eq('is_active', true);

        // Text search
        if (query) {
            menuItemsQuery = menuItemsQuery.or(
                `display_name.ilike.%${query}%,item_description.ilike.%${query}%`
            );
        }

        // Customizable filter
        if (is_customizable !== undefined) {
            menuItemsQuery = menuItemsQuery.eq('is_customizable', is_customizable === 'true');
        }

        menuItemsQuery = menuItemsQuery.limit(parseInt(limit));

        const { data: menuItems, error: itemError } = await menuItemsQuery;

        if (itemError) throw itemError;

        // Apply additional filters
        const filteredItems = [];

        for (const item of menuItems || []) {
            let passesFilter = true;

            // Filter by restaurant
            if (restaurant_id && passesFilter) {
                const restaurant = await getRestaurantForMenuItem(item.menu_item_id);
                passesFilter = restaurant?.restaurant_id === parseInt(restaurant_id);
            }

            // Filter by restaurant tags
            if (restaurant_tags && passesFilter) {
                const restaurant = await getRestaurantForMenuItem(item.menu_item_id);
                if (restaurant?.restaurant_id) {
                    const requestedTags = restaurant_tags.split(',').map(t => t.trim().toLowerCase());
                    
                    const { data: restTags, error: tagError } = await supabase
                        .from('restaurant_tag')
                        .select(`
                            tag:tag_id (
                                tag_text
                            )
                        `)
                        .eq('restaurant_id', restaurant.restaurant_id);

                    if (!tagError && restTags && restTags.length > 0) {
                        const restaurantTagTexts = restTags
                            .map(rt => rt.tag?.tag_text?.toLowerCase())
                            .filter(Boolean);
                        passesFilter = requestedTags.some(reqTag => 
                            restaurantTagTexts.some(restTag => restTag.includes(reqTag))
                        );
                    } else {
                        passesFilter = false;
                    }
                } else {
                    passesFilter = false;
                }
            }

            // Filter by diet
            if (diet && passesFilter) {
                const diets = await getPossibleDiets(item.menu_item_id);
                passesFilter = diets.some(d => d.toLowerCase().includes(diet.toLowerCase()));
            }

            // Filter by max price
            if (max_price && passesFilter) {
                const price = await getBasePrice(item.menu_item_id);
                passesFilter = price && parseFloat(price) <= parseFloat(max_price);
            }

            // Filter by nutrition
            if ((min_protein || max_calories) && passesFilter) {
                const nutrition = await getNutritionForMenuItem(item.menu_item_id);
                
                if (nutrition) {
                    if (min_protein) {
                        passesFilter = passesFilter && parseFloat(nutrition.protein_grams) >= parseFloat(min_protein);
                    }
                    if (max_calories) {
                        passesFilter = passesFilter && nutrition.calories <= parseInt(max_calories);
                    }
                } else {
                    passesFilter = false;
                }
            }

            if (passesFilter) {
                // Enrich item data
                const nutrition = await getNutritionForMenuItem(item.menu_item_id);
                const price = await getBasePrice(item.menu_item_id);
                const restaurant = await getRestaurantForMenuItem(item.menu_item_id);
                
                filteredItems.push({
                    ...item,
                    nutrition: nutrition,
                    current_price: price ? parseFloat(price) : null,
                    restaurant_name: restaurant?.name || null
                });
            }
        }

        res.json({
            success: true,
            count: filteredItems.length,
            filters_applied: {
                query: query || null,
                diet: diet || null,
                max_price: max_price || null,
                min_protein: min_protein || null,
                max_calories: max_calories || null,
                is_customizable: is_customizable || null,
                restaurant_id: restaurant_id || null,
                restaurant_tags: restaurant_tags || null
            },
            menu_items: filteredItems
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/menu-items/:id/options/lowest-calorie-vegan - Find lowest calorie vegan & soy-free option
app.get('/api/menu-items/:id/options/lowest-calorie-vegan', async (req, res) => {
    console.log(`🌱 GET /api/menu-items/${req.params.id}/options/lowest-calorie-vegan`);
    
    if (!supabase) {
        return res.status(503).json({ success: false, error: 'Supabase not configured' });
    }
    
    try {
        const menuItemId = parseInt(req.params.id, 10);

        if (isNaN(menuItemId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid menu item ID'
            });
        }

        // Ensure the menu item exists and is active
        const { data: menuItem, error: menuItemError } = await supabase
            .from('menu_item')
            .select('menu_item_id, display_name, is_active')
            .eq('menu_item_id', menuItemId)
            .single();

        if (menuItemError || !menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        if (!menuItem.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Menu item is not active'
            });
        }

        // Fetch customization options
        const { data: customizationLinks, error: custError } = await supabase
            .from('menu_item_customization')
            .select('option_id')
            .eq('menu_item_id', menuItemId);

        if (custError) throw custError;
        const optionIds = customizationLinks?.map(c => c.option_id).filter(id => id !== null && id !== undefined) || [];

        if (optionIds.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No customization options found for this menu item'
            });
        }

        // Fetch option values with nutrition and diet data
        const { data: optionRows, error: optionsError } = await supabase
            .from('option_value')
            .select(`
                value_id,
                value_name,
                option_id,
                is_available,
                nutrition:option_value_nutrition(
                    nutrition_id,
                    nutrition:nutrition (
                        calories
                    )
                ),
                diet_link:option_value_diet(
                    diet(diet_name)
                ),
                allergen_link:option_value_allergen(
                    allergen(name)
                )
            `)
            .in('option_id', optionIds)
            .eq('is_available', true);

        if (optionsError) throw optionsError;

        // Filter for Vegan options
        const veganOptions = (optionRows || []).filter(ov => {
            const diets = ov.diet_link || [];
            return diets.some(link => link.diet?.diet_name?.toLowerCase() === 'vegan');
        });

        // Filter for soy-free options
        const soyFreeOptions = veganOptions.filter(ov => {
            const hasSoy = (ov.allergen_link || []).some(link => link.allergen?.name?.toLowerCase() === 'soy');
            return !hasSoy;
        });

        // Sort by calories ascending
        soyFreeOptions.sort((a, b) => {
            const calA = a.nutrition?.[0]?.nutrition?.calories ?? Infinity;
            const calB = b.nutrition?.[0]?.nutrition?.calories ?? Infinity;
            return calA - calB;
        });

        if (soyFreeOptions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No vegan, soy-free options found for this menu item'
            });
        }

        const bestOption = soyFreeOptions[0];
        const nutritionData = bestOption.nutrition?.[0];

        res.json({
            success: true,
            data: {
                menu_item_id: menuItem.menu_item_id,
                menu_item_name: menuItem.display_name,
                value_id: bestOption.value_id,
                value_name: bestOption.value_name,
                nutrition_id: nutritionData?.nutrition_id || null,
                calories: nutritionData?.nutrition?.calories || null,
                diet_name: bestOption.diet_link?.[0]?.diet?.diet_name || 'Vegan'
            }
        });
    } catch (error) {
        console.error('Endpoint error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message
        });
    }
});

// GET /api/menu-items/:id/images/all - Get all images for menu item + option values
app.get('/api/menu-items/:id/images/all', async (req, res) => {
    console.log(`🖼️ GET /api/menu-items/${req.params.id}/images/all`);
    
    if (!supabase) {
        return res.status(503).json({ success: false, error: 'Supabase not configured' });
    }
    
    try {
        const menuItemId = parseInt(req.params.id, 10);
        const { options } = req.query;

        if (isNaN(menuItemId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid menu item ID'
            });
        }

        // Ensure the menu item exists
        const { data: menuItem, error: menuItemError } = await supabase
            .from('menu_item')
            .select('menu_item_id, display_name, is_active')
            .eq('menu_item_id', menuItemId)
            .single();

        if (menuItemError || !menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        // Get menu item images
        const { data: menuItemImages, error: menuImgError } = await supabase
            .from('menu_item_image')
            .select(`
                display_order,
                is_generated,
                is_verified,
                quality_rating,
                image:image_id (
                    image_id,
                    image_url,
                    type,
                    alt_text,
                    is_generated,
                    quality_rating
                )
            `)
            .eq('menu_item_id', menuItemId)
            .order('display_order', { ascending: true });

        const formattedMenuItemImages = (menuItemImages || [])
            .filter(img => img.image)
            .map(img => ({
                image_id: img.image.image_id,
                image_url: img.image.image_url,
                type: img.image.type || 'food',
                alt_text: img.image.alt_text,
                is_generated: img.is_generated || img.image.is_generated || false,
                is_verified: img.is_verified || false,
                quality_rating: img.quality_rating || img.image.quality_rating,
                display_order: img.display_order,
                source: 'menu_item'
            }));

        // Get option value images if options are provided
        const optionValueImages = [];
        const optionValuesInfo = [];

        if (options) {
            const valueIds = options.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

            for (const valueId of valueIds) {
                const { data: optionValue, error: ovError } = await supabase
                    .from('option_value')
                    .select('value_id, value_name, option_id')
                    .eq('value_id', valueId)
                    .single();

                if (ovError || !optionValue) continue;

                optionValuesInfo.push({
                    value_id: optionValue.value_id,
                    value_name: optionValue.value_name
                });

                const { data: ovImages, error: ovImgError } = await supabase
                    .from('option_value_image')
                    .select(`
                        value_id,
                        image:image_id (
                            image_id,
                            image_url,
                            type,
                            alt_text,
                            is_generated,
                            quality_rating
                        )
                    `)
                    .eq('value_id', valueId);

                if (ovImgError) continue;

                const formattedOvImages = (ovImages || [])
                    .filter(img => img.image)
                    .map(img => ({
                        image_id: img.image.image_id,
                        image_url: img.image.image_url,
                        type: img.image.type || 'food',
                        alt_text: img.image.alt_text,
                        is_generated: img.image.is_generated || false,
                        quality_rating: img.image.quality_rating,
                        source: 'option_value',
                        value_id: valueId,
                        value_name: optionValue.value_name
                    }));

                optionValueImages.push(...formattedOvImages);
            }
        }

        // Combine and deduplicate images
        const allImages = [...formattedMenuItemImages, ...optionValueImages];
        const uniqueImages = [];
        const seenImageIds = new Set();
        for (const img of allImages) {
            if (!seenImageIds.has(img.image_id)) {
                seenImageIds.add(img.image_id);
                uniqueImages.push(img);
            }
        }

        res.json({
            success: true,
            data: {
                menu_item_id: menuItem.menu_item_id,
                menu_item_name: menuItem.display_name,
                option_values_requested: optionValuesInfo,
                images: {
                    total_count: uniqueImages.length,
                    menu_item_images: formattedMenuItemImages,
                    option_value_images: optionValueImages,
                    all_unique_images: uniqueImages
                },
                image_urls: uniqueImages.map(img => img.image_url).filter(Boolean)
            }
        });
    } catch (error) {
        console.error('Endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/menu-items/:id/debug - Diagnostic endpoint to check data relationships
app.get('/api/menu-items/:id/debug', async (req, res) => {
    console.log(`🔧 GET /api/menu-items/${req.params.id}/debug`);
    
    if (!supabase) {
        return res.status(503).json({ success: false, error: 'Supabase not configured for debug endpoint' });
    }
    
    try {
        const menuItemId = req.params.id;

        // Check if menu item exists
        const { data: menuItem, error: itemError } = await supabase
            .from('menu_item')
            .select('*')
            .eq('menu_item_id', menuItemId)
            .single();

        if (itemError) {
            return res.json({
                success: false,
                error: 'Menu item not found',
                menu_item_id: menuItemId
            });
        }

        // Check if menu exists
        let menus = [];
        let restaurants = [];
        const menuId = menuItem.menu_id;

        if (menuId) {
            const { data: menuData, error: menuError } = await supabase
                .from('menu')
                .select(`
                    *,
                    restaurant:restaurant_id (*)
                `)
                .eq('menu_id', menuId);
            
            menus = menuData || [];

            if (menuData && menuData.length > 0 && menuData[0].restaurant) {
                restaurants = [menuData[0].restaurant];
            }
        }

        // Check nutrition
        const { data: nutritionLinks, error: nutError } = await supabase
            .from('menu_item_nutrition')
            .select('nutrition_id')
            .eq('menu_item_id', menuItemId);

        // Check prices
        const { data: prices, error: priceError } = await supabase
            .from('item_price')
            .select('*')
            .eq('menu_item_id', menuItemId)
            .eq('is_active', true);

        // Check customizations
        const { data: customizations, error: custError } = await supabase
            .from('menu_item_customization')
            .select('*')
            .eq('menu_item_id', menuItemId);

        // Check diets
        const { data: diets, error: dietError } = await supabase
            .from('menu_item_diet')
            .select(`
                diet:diet_id (*)
            `)
            .eq('menu_item_id', menuItemId);

        // Check images
        const { data: images, error: imgError } = await supabase
            .from('menu_item_image')
            .select('*')
            .eq('menu_item_id', menuItemId);

        res.json({
            success: true,
            menu_item_id: menuItemId,
            menu_item: menuItem,
            relationships: {
                menu: {
                    menu_id: menuId || null,
                    has_menu: !!menuId,
                    menus: menus
                },
                restaurants: {
                    count: restaurants.length,
                    restaurants: restaurants
                },
                nutrition: {
                    count: nutritionLinks?.length || 0,
                    nutrition_ids: nutritionLinks?.map(n => n.nutrition_id) || [],
                    error: nutError?.message || null
                },
                prices: {
                    count: prices?.length || 0,
                    prices: prices || [],
                    error: priceError?.message || null
                },
                customizations: {
                    count: customizations?.length || 0,
                    error: custError?.message || null
                },
                diets: {
                    count: diets?.length || 0,
                    diets: diets || [],
                    error: dietError?.message || null
                },
                images: {
                    count: images?.length || 0,
                    error: imgError?.message || null
                }
            },
            recommendations: generateRecommendations(menuId, menus, restaurants, prices, nutritionLinks)
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// ========================================
// Error Handling
// ========================================

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ========================================
// Start Server
// ========================================

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log('\n🍽️  Yippee Backend Server v3');
        console.log('================================');
        console.log(`📋 Schema Version: 12_2`);
        console.log(`   - Direct menu_item.menu_id FK`);
        console.log(`   - Direct menu.restaurant_id FK`);
        console.log('================================');
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`📊 Mock restaurants loaded: ${mockRestaurants.length}`);
        console.log(`🍔 Total menu items: ${mockRestaurants.reduce((sum, r) => 
            sum + r.menus.reduce((menuSum, m) => menuSum + m.items.length, 0), 0
        )}`);
        console.log('\n📡 API Endpoints:');
        console.log('\n   🏪 Restaurants:');
        console.log('      GET  /api/all-restaurant-menus');
        console.log('      GET  /api/restaurants/:id');
        console.log('      GET  /api/restaurants/:id/images');
        console.log('\n   🍽️  Menu Items (Basic):');
        console.log('      GET  /api/menu-items/:id                    - Get item with full details');
        console.log('      GET  /api/menu-items/:id/nutrition');
        console.log('      GET  /api/menu-items/:id/images');
        console.log('      GET  /api/menu-items/:id/customizations');
        console.log('      POST /api/menu-items');
        console.log('      POST /api/menu-items/:id/images');
        console.log('      PUT  /api/menu-items/:id');
        console.log('      DELETE /api/menu-items/:id');
        console.log('\n   🆕 Enhanced Endpoints (v3):');
        console.log('      GET  /api/menu-items/:id/configure          - Configure with options');
        console.log('                                                    Query: ?options=value_id1,value_id2');
        console.log('      GET  /api/menu-items/:id/options/filter     - Filter options by diet/allergens');
        console.log('                                                    Query: ?diet=vegan&exclude_allergens=soy');
        console.log('                                                           &max_calories=500&min_protein=20');
        console.log('      GET  /api/menu-items/:id/options/lowest-calorie-vegan');
        console.log('                                                  - Find lowest cal vegan & soy-free');
        console.log('      GET  /api/menu-items/:id/images/all         - Get all images + option values');
        console.log('                                                    Query: ?options=value_id1,value_id2');
        console.log('      GET  /api/menu-items/search                 - Advanced search');
        console.log('                                                    Query: ?query=bowl&diet=vegan');
        console.log('                                                           &max_price=15&min_protein=20');
        console.log('                                                           &is_customizable=true');
        console.log('                                                           &restaurant_tags=mexican');
        console.log('\n   🔧 Diagnostic:');
        console.log('      GET  /api/menu-items/:id/debug              - Check all data relationships');
        console.log('\n   🎛️  Customizations:');
        console.log('      GET  /api/custom-options/:id/values');
        console.log('      POST /api/custom-options/:id/values');
        console.log('\n   🔍 Search & Stats:');
        console.log('      GET  /api/search?q=query&dietary=tag');
        console.log('      GET  /api/stats');
        console.log('      GET  /api/health');
        console.log('\n🗄️  Database: ' + (supabase ? 'Supabase ✅' : 'Mock Data (offline)'));
        console.log('🌐 Frontend: http://localhost:' + PORT);
        console.log('================================\n');
    });
}

// For Vercel serverless deployment
module.exports = app;

