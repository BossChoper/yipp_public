/**
 * Yippee Mock Backend Server
 * Provides API endpoints with Supabase integration
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const serverless = require('serverless-http');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  WARNING: Supabase credentials not found in environment variables!');
    console.warn('   Please create a .env file with SUPABASE_URL and SUPABASE_ANON_KEY');
    console.warn('   Falling back to mock data...\n');
}

const supabase = supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey)
    : null;

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

// Get all restaurants with menus
app.get('/api/all-restaurant-menus', async (req, res) => {
    console.log('📋 GET /api/all-restaurant-menus');
    
    if (!supabase) {
        return res.json(mockRestaurants);
    }
    
    try {
        // Get restaurants with their menus and menu items
        const { data: restaurants, error: restaurantError } = await supabase
            .from('restaurant')
            .select(`
                restaurant_id,
                name,
                description,
                phone,
                website,
                average_price,
                is_verified,
                menus:menu(
                    menu_id,
                    menu_name,
                    menu_type,
                    is_active,
                    menu_items:menu_item(
                        menu_item_id,
                        display_name,
                        three_word_alternative_name,
                        item_description,
                        twelve_word_description,
                        base_price,
                        portion_size,
                        meal_type,
                        is_active,
                        is_customizable,
                        nutrition:nutrition(*)
                    )
                )
            `)
            .eq('is_active', true);
            
        if (restaurantError) throw restaurantError;
        
        res.json(restaurants || []);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ error: 'Failed to fetch restaurants', details: error.message });
    }
});

// Get single restaurant
app.get('/api/restaurants/:id', async (req, res) => {
    console.log(`🏪 GET /api/restaurants/${req.params.id}`);
    
    if (!supabase) {
        const restaurant = mockRestaurants.find(r => r.restaurant_id === req.params.id);
        return restaurant ? res.json(restaurant) : res.status(404).json({ error: 'Restaurant not found' });
    }
    
    try {
        const { data: restaurant, error } = await supabase
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
                        ),
                        menu_item_allergens:menu_item_allergen(
                            allergen:allergen(*)
                        ),
                        menu_item_images:menu_item_image(
                            image:image(*)
                        )
                    )
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
        
        res.json(restaurant);
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({ error: 'Failed to fetch restaurant', details: error.message });
    }
});

// Get menu item nutrition
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
        const { data: menuItem, error } = await supabase
            .from('menu_item')
            .select(`
                display_name,
                nutrition:nutrition(*),
                menu_item_ingredients:menu_item_ingredient(
                    ingredient:ingredient(name)
                ),
                menu_item_allergens:menu_item_allergen(
                    allergen:allergen(name, allergen_description)
                )
            `)
            .eq('menu_item_id', req.params.id)
            .single();
            
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Menu item not found' });
            }
            throw error;
        }
        
        // Format the response
        const response = {
            item_name: menuItem.display_name,
            ...menuItem.nutrition,
            ingredients: menuItem.menu_item_ingredients?.map(mi => mi.ingredient.name) || [],
            allergens: menuItem.menu_item_allergens?.map(ma => ma.allergen.name) || []
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching nutrition:', error);
        res.status(500).json({ error: 'Failed to fetch nutrition data', details: error.message });
    }
});

// Create menu item
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
        // First create nutrition data if provided
        let nutritionId = null;
        if (req.body.nutrition) {
            const { data: nutritionData, error: nutritionError } = await supabase
                .from('nutrition')
                .insert({
                    calories: req.body.nutrition.calories,
                    protein_grams: req.body.nutrition.protein_grams,
                    fat_grams: req.body.nutrition.fat_grams,
                    carbohydrates_grams: req.body.nutrition.carbohydrates_grams,
                    fiber_grams: req.body.nutrition.fiber_grams,
                    sodium_mg: req.body.nutrition.sodium_mg,
                    sugar_grams: req.body.nutrition.sugar_grams,
                    saturated_fat_grams: req.body.nutrition.saturated_fat_grams,
                    cholesterol_mg: req.body.nutrition.cholesterol_mg
                })
                .select()
                .single();
                
            if (nutritionError) throw nutritionError;
            nutritionId = nutritionData.nutrition_id;
        }
        
        // Create the menu item
        const { data: menuItem, error: menuItemError } = await supabase
            .from('menu_item')
            .insert({
                menu_id: req.body.menu_id,
                display_name: req.body.display_name || req.body.item_name,
                three_word_alternative_name: req.body.short_name,
                item_description: req.body.item_description || req.body.description,
                twelve_word_description: req.body.twelve_word_description,
                base_price: req.body.base_price,
                portion_size: req.body.portion_size,
                meal_type: req.body.meal_type || 'All Day',
                item_type: req.body.item_type || 'Entree',
                is_customizable: req.body.is_customizable || false,
                nutrition_id: nutritionId
            })
            .select()
            .single();
            
        if (menuItemError) throw menuItemError;
        
        res.status(201).json({
            success: true,
            menu_item_id: menuItem.menu_item_id,
            message: 'Menu item created successfully',
            data: menuItem
        });
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'Failed to create menu item', details: error.message });
    }
});

// Update menu item
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
        const updateData = {};
        if (req.body.display_name) updateData.display_name = req.body.display_name;
        if (req.body.short_name) updateData.three_word_alternative_name = req.body.short_name;
        if (req.body.item_description) updateData.item_description = req.body.item_description;
        if (req.body.twelve_word_description) updateData.twelve_word_description = req.body.twelve_word_description;
        if (req.body.base_price) updateData.base_price = req.body.base_price;
        if (req.body.portion_size) updateData.portion_size = req.body.portion_size;
        if (req.body.meal_type) updateData.meal_type = req.body.meal_type;
        if (req.body.is_customizable !== undefined) updateData.is_customizable = req.body.is_customizable;
        if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active;
        
        updateData.updated_at = new Date().toISOString();
        
        const { data: menuItem, error } = await supabase
            .from('menu_item')
            .update(updateData)
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

// Get all customization options for a menu item
app.get('/api/menu-items/:id/customizations', async (req, res) => {
    console.log(`🎛️ GET /api/menu-items/${req.params.id}/customizations`);
    
    if (!supabase) {
        return res.json([]);
    }
    
    try {
        const { data: customizations, error } = await supabase
            .from('menu_item_customization')
            .select(`
                menu_item_id,
                option_id,
                is_required,
                display_order,
                option_type,
                custom_option:custom_option(
                    option_id,
                    name,
                    option_description,
                    portion_instructions,
                    is_active,
                    option_values:option_value(
                        value_id,
                        value_name,
                        default_portion,
                        is_available,
                        display_order,
                        twelve_word_description,
                        nutrition:nutrition(*)
                    )
                )
            `)
            .eq('menu_item_id', req.params.id)
            .order('display_order');
            
        if (error) throw error;
        
        res.json(customizations || []);
    } catch (error) {
        console.error('Error fetching customizations:', error);
        res.status(500).json({ error: 'Failed to fetch customizations', details: error.message });
    }
});

// Get all option values for a customization option
app.get('/api/custom-options/:id/values', async (req, res) => {
    console.log(`🔧 GET /api/custom-options/${req.params.id}/values`);
    
    if (!supabase) {
        return res.json([]);
    }
    
    try {
        const { data: values, error } = await supabase
            .from('option_value')
            .select(`
                value_id,
                value_name,
                default_portion,
                is_available,
                available_from,
                available_until,
                display_order,
                twelve_word_description,
                image_generation_description,
                nutrition:nutrition(*),
                option_value_ingredients:option_value_ingredient(
                    ingredient:ingredient(name, brand)
                ),
                option_value_allergens:option_value_allergen(
                    allergen:allergen(name, allergen_description)
                )
            `)
            .eq('option_id', req.params.id)
            .eq('is_available', true)
            .order('display_order');
            
        if (error) throw error;
        
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
        restaurants_loaded: mockRestaurants.length
    });
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
        console.log('\n🍽️  Yippee Mock Backend Server');
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
        console.log('\n   🍽️  Menu Items:');
        console.log('      GET  /api/menu-items/:id/nutrition');
        console.log('      GET  /api/menu-items/:id/images');
        console.log('      GET  /api/menu-items/:id/customizations');
        console.log('      POST /api/menu-items');
        console.log('      POST /api/menu-items/:id/images');
        console.log('      PUT  /api/menu-items/:id');
        console.log('      DELETE /api/menu-items/:id');
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

