const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { processMenuWithGroq } = require('./menu-processor');
const dotenv = require('dotenv');

dotenv.config();

// Initialize
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.json());
// app.use(express.static(__dirname +'/public'));


// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ------------------------------------------------------------------------------------------------
// Frontend Web Application Endpoints

// Routes to HTML files
// Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'new_index.html'));
});

// Map Page
app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'map.html'));
});

// Restaurants List Page
app.get('/restaurants', (req, res) => {
  res.sendFile('public/restaurants.html', { root: __dirname });
});

// Restaurant Page
app.get('/restaurant/:id', (req, res) => {
  res.sendFile('public/resetaurant.html', { root: __dirname });
});

// Upload Page (Admin Only)
app.get('/upload', (req, res) => {
  res.sendFile('public/upload.html', { root: __dirname });
});


// ------------------------------------------------------------------------------------------------
// Backend API Endpoints + Admin Upload and Management Endpoints
app.post('/api/process-menu', async (req, res) => {
  console.log("Received menu process request");
})
//



// Endpoint 1: Retrieve all restaurant menus
app.get('/api/all-restaurant-menus', async (req, res) => {
  try {
    // Use raw SQL for complex join query
    const { data, error } = await supabase
      .from('restaurant')
      .select(`
        restaurant_id,
        name,
        menu (
          menu_id,
          menu_name,
          menu_item (
            menu_item_id,
            display_name,
            item_description,
            base_price
          )
        )
      `)
      .order('restaurant_id', { ascending: true })
      .order('menu_id', { foreignTable: 'menu', ascending: true })
      .order('menu_item_id', { foreignTable: 'menu.menu_item', ascending: true });

    if (error) {
      throw error;
    }

    // Transform data to match desired output structure
    const restaurants = data.map(restaurant => ({
      restaurant_id: restaurant.restaurant_id,
      restaurant_name: restaurant.name,
      menus: restaurant.menu.map(menu => ({
        menu_id: menu.menu_id,
        menu_name: menu.menu_name,
        items: menu.menu_item.map(item => ({
          menu_item_id: item.menu_item_id,
          item_name: item.display_name,
          description: item.item_description,
          base_price: item.base_price
        }))
      }))
    }));

    res.json(restaurants);
  } catch (err) {
    console.error('Error fetching restaurant menus:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Endpoint 2: Retrieve menu items with "protein" custom option, prioritizing vegan and sorting by protein
app.get('/api/protein-custom-menu-items', async (req, res) => {
  try {
    // Find the "protein" custom option
    const { data: optionData, error: optionError } = await supabase
      .from('custom_option')
      .select('option_id')
      .ilike('name', 'protein') // Case-insensitive match
      .single();

    if (optionError || !optionData) {
      return res.status(404).json({ error: 'Protein option not found' });
    }

    const optionId = optionData.option_id;

    // Get option values with vegan status and protein content
    const { data: optionsData, error: optionsError } = await supabase
      .from('option_value')
      .select(`
        value_id,
        value_name,
        nutrition (
          protein_grams
        ),
        option_value_diet (
          diet (
            diet_id,
            diet_name
          )
        )
      `)
      .eq('option_id', optionId);

    if (optionsError) {
      throw optionsError;
    }

    // Process option values to determine vegan status and protein content
    const optionValues = optionsData.map(option => ({
      value_id: option.value_id,
      value_name: option.value_name,
      protein_grams: option.nutrition?.protein_grams || 0,
      is_vegan: option.option_value_diet.some(ovd =>
        ovd.diet.diet_name.toLowerCase() === 'vegan'
      )
    }));

    // Sort: vegan first (if any), then by protein_grams descending
    const vegans = optionValues
      .filter(ov => ov.is_vegan)
      .sort((a, b) => b.protein_grams - a.protein_grams);
    const nonVegans = optionValues
      .filter(ov => !ov.is_vegan)
      .sort((a, b) => b.protein_grams - a.protein_grams);
    const sortedOptions = vegans.length > 0 ? [vegans[0], ...nonVegans] : nonVegans;

    // Get menu items with the "protein" custom option
    const { data: itemsData, error: itemsError } = await supabase
      .from('menu_item')
      .select(`
        menu_item_id,
        short_name,
        item_description,
        base_price,
        menu (
          menu_id,
          restaurant_id,
          restaurant (
            name
          )
        )
      `)
      .in('menu_item_id', (
        await supabase
          .from('menu_item_customization')
          .select('menu_item_id')
          .eq('option_id', optionId)
      ).data.map(item => item.menu_item_id));

    if (itemsError) {
      throw itemsError;
    }

    // Transform menu items data
    const menuItems = itemsData.map(item => ({
      menu_item_id: item.menu_item_id,
      display_name: item.short_name,
      description: item.item_description,
      base_price: item.base_price,
      menu_id: item.menu.menu_id,
      restaurant_id: item.menu.restaurant_id,
      restaurant_name: item.menu.restaurant.name,
      protein_options: sortedOptions
    }));

    res.json(menuItems);
  } catch (err) {
    console.error('Error fetching protein-custom menu items:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Endpoint 3: Return all protein options with adjusted nutrition for portions
app.get('/api/protein-options-with-portions', async (req, res) => {
  try {
    // Step 1: Get Protein option_id
    const { data: proteinOption, error: proteinError } = await supabase
      .from('custom_option')
      .select('option_id')
      .ilike('name', 'protein') // Case-insensitive match
      .single();

    if (proteinError || !proteinOption) {
      return res.status(404).json({ error: 'Protein option not found' });
    }

    const optionId = proteinOption.option_id;

    // Step 2: Get option values with nutrition + default_portion
    const { data: optionValues, error: valuesError } = await supabase
      .from('option_value')
      .select(`
        value_id,
        value_name,
        default_portion,
        nutrition (
          calories,
          protein_grams,
          fat_grams,
          saturated_fat_grams,
          carbohydrates_grams,
          sugar_grams,
          fiber_grams,
          sodium_mg,
          cholesterol_mg
        )
      `)
      .eq('option_id', optionId);

    if (valuesError) throw valuesError;

    // Step 3: Get available portions for this option (joined with portions table)
    const { data: portionsData, error: portionsError } = await supabase
      .from('custom_portion')
      .select(`
        portion_id,
        portion (
          portion_id,
          portion_type
        )
      `)
      .eq('option_id', optionId);

    if (portionsError) throw portionsError;

    // Map portion types to multipliers
    const multipliers = {
      single: 1,
      half: 0.5,
      double: 2
    };

    // Build portion objects with correct multipliers
    const portions = portionsData.map(p => {
      const type = p.portion?.portion_type?.toLowerCase() || 'single';
      return {
        portion_id: p.portion_id,
        portion_type: type,
        multiplier: multipliers[type] ?? 1 // default to 1 if unknown type
      };
    });

    // Step 4: Build the result with adjusted nutrition for each portion
    const result = optionValues.map(optionValue => {
      const baseNutrition = optionValue.nutrition || {};
      
      return {
        value_id: optionValue.value_id,
        value_name: optionValue.value_name,
        default_portion: optionValue.default_portion,
        base_nutrition: baseNutrition,
        available_portions: portions.map(portion => ({
          portion_id: portion.portion_id,
          portion_type: portion.portion_type,
          multiplier: portion.multiplier,
          adjusted_nutrition: {
            calories: Math.round((baseNutrition.calories || 0) * portion.multiplier),
            protein_grams: parseFloat(((baseNutrition.protein_grams || 0) * portion.multiplier).toFixed(2)),
            fat_grams: parseFloat(((baseNutrition.fat_grams || 0) * portion.multiplier).toFixed(2)),
            saturated_fat_grams: parseFloat(((baseNutrition.saturated_fat_grams || 0) * portion.multiplier).toFixed(2)),
            carbohydrates_grams: parseFloat(((baseNutrition.carbohydrates_grams || 0) * portion.multiplier).toFixed(2)),
            sugar_grams: parseFloat(((baseNutrition.sugar_grams || 0) * portion.multiplier).toFixed(2)),
            fiber_grams: parseFloat(((baseNutrition.fiber_grams || 0) * portion.multiplier).toFixed(2)),
            sodium_mg: Math.round((baseNutrition.sodium_mg || 0) * portion.multiplier),
            cholesterol_mg: Math.round((baseNutrition.cholesterol_mg || 0) * portion.multiplier)
          }
        }))
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching protein options with portions:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Not working; Endpoint 4: Retrieve all option values for a custom option
app.get('/api/custom-option-values/:optionId', async (req, res) => {
  try {
    const { optionId } = req.params;

    const { data: optionData, error: optionError } = await supabase
      .from('custom_option')
      .select('option_id, name')
      .eq('option_id', optionId)
      .single();

    if (optionError || !optionData) {
      return res.status(404).json({ error: 'Custom option not found' });
    }

    const { data: optionValues, error: valuesError } = await supabase
      .from('option_value')
      .select(`
        value_id,
        value_name,
        default_portion,
        nutrition (
          calories,
          protein_grams,
          fat_grams,
          saturated_fat_grams,
          carbohydrates_grams,
          sugar_grams,
          fiber_grams,
          sodium_mg,
          cholesterol_mg
        ),
        option_value_diet (
          diet (
            diet_id,
            diet_name
          )
        )
      `)
      .eq('option_id', optionId)
      .order('nutrition.protein_grams', { ascending: false, nullsLast: true });

    if (valuesError) {
      throw valuesError;
    }

    const result = optionValues.map(option => ({
      value_id: option.value_id,
      value_name: option.value_name,
      default_portion: option.default_portion,
      nutrition: option.nutrition || {},
      diets: option.option_value_diet.map(ovd => ({
        diet_id: ovd.diet.diet_id,
        diet_name: ovd.diet.diet_name
      }))
    }));

    res.json({
      option_id: optionData.option_id,
      option_name: optionData.name,
      option_values: result
    });
  } catch (err) {
    console.error('Error fetching custom option values:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Endpoint 5: Retrieve top 3 option values for toppings custom option
app.get('/api/toppings-option-values/:optionId', async (req, res) => {
  try {
    const { optionId } = req.params;

    const { data: optionData, error: optionError } = await supabase
      .from('custom_option')
      .select('option_id, name')
      .eq('option_id', optionId)
      .ilike('name', 'toppings')
      .single();

    if (optionError || !optionData) {
      return res.status(404).json({ error: 'Toppings option not found' });
    }

    const { data: optionValues, error: valuesError } = await supabase
      .from('option_value')
      .select(`
        value_id,
        value_name,
        default_portion,
        nutrition (
          calories,
          protein_grams,
          fat_grams,
          saturated_fat_grams,
          carbohydrates_grams,
          sugar_grams,
          fiber_grams,
          sodium_mg,
          cholesterol_mg
        ),
        option_value_diet (
          diet (
            diet_id,
            diet_name
          )
        )
      `)
      .eq('option_id', optionId)
      .order('nutrition.protein_grams', { ascending: false, nullsLast: true })
      .limit(3);

    if (valuesError) {
      throw valuesError;
    }

    const result = optionValues.map(option => ({
      value_id: option.value_id,
      value_name: option.value_name,
      default_portion: option.default_portion,
      nutrition: option.nutrition || {},
      diets: option.option_value_diet.map(ovd => ({
        diet_id: ovd.diet.diet_id,
        diet_name: ovd.diet.diet_name
      }))
    }));

    res.json({
      option_id: optionData.option_id,
      option_name: optionData.name,
      option_values: result
    });
  } catch (err) {
    console.error('Error fetching toppings option values:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Endpoint 6: Pick random option value and portion for a menu item
app.get('/api/random-option-value/:menuItemId', async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const { data: menuItemData, error: menuItemError } = await supabase
      .from('menu_item')
      .select('menu_item_id, display_name')
      .eq('menu_item_id', menuItemId)
      .single();

    if (menuItemError || !menuItemData) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const { data: customizationData, error: customizationError } = await supabase
      .from('menu_item_customization')
      .select(`
        option_id,
        custom_option (
          option_id,
          name
        )
      `)
      .eq('menu_item_id', menuItemId);

    if (customizationError) {
      throw customizationError;
    }

    if (!customizationData || customizationData.length === 0) {
      return res.status(404).json({ error: 'No custom options found for this menu item' });
    }

    const optionIds = customizationData.map(c => c.option_id);
    const { data: optionValuesData, error: optionValuesError } = await supabase
      .from('option_value')
      .select(`
        value_id,
        value_name,
        default_portion,
        option_id,
        nutrition (
          calories,
          protein_grams,
          fat_grams,
          saturated_fat_grams,
          carbohydrates_grams,
          sugar_grams,
          fiber_grams,
          sodium_mg,
          cholesterol_mg
        ),
        option_value_diet (
          diet (
            diet_id,
            diet_name
          )
        )
      `)
      .in('option_id', optionIds);

    if (optionValuesError) {
      throw optionValuesError;
    }

    if (!optionValuesData || optionValuesData.length === 0) {
      return res.status(404).json({ error: 'No option values found for the custom options' });
    }

    const randomOptionValue = optionValuesData[Math.floor(Math.random() * optionValuesData.length)];

    const { data: portionsData, error: portionsError } = await supabase
      .from('custom_portion')
      .select(`
        portion_id,
        portion (
          portion_id,
          portion_type
        )
      `)
      .eq('option_id', randomOptionValue.option_id);

    if (portionsError) {
      throw portionsError;
    }

    const availablePortionTypes = portionsData.map(p => p.portion?.portion_type?.toLowerCase() || 'single')
      .filter(type => ['single', 'double', 'half'].includes(type));

    if (!availablePortionTypes.length) {
      availablePortionTypes.push('single');
    }

    const randomPortionType = availablePortionTypes[Math.floor(Math.random() * availablePortionTypes.length)];

    const multipliers = {
      single: 1,
      half: 0.5,
      double: 2
    };

    const multiplier = multipliers[randomPortionType] ?? 1;
    const baseNutrition = randomOptionValue.nutrition || {};

    const optionName = customizationData.find(c => c.option_id === randomOptionValue.option_id)?.custom_option.name || 'Unknown';

    const result = {
      menu_item_id: menuItemData.menu_item_id,
      menu_item_name: menuItemData.display_name,
      option_id: randomOptionValue.option_id,
      option_name: optionName,
      option_value: {
        value_id: randomOptionValue.value_id,
        value_name: randomOptionValue.value_name,
        default_portion: randomOptionValue.default_portion,
        selected_portion: {
          portion_type: randomPortionType,
          multiplier: multiplier,
          adjusted_nutrition: {
            calories: Math.round((baseNutrition.calories || 0) * multiplier),
            protein_grams: parseFloat(((baseNutrition.protein_grams || 0) * multiplier).toFixed(2)),
            fat_grams: parseFloat(((baseNutrition.fat_grams || 0) * multiplier).toFixed(2)),
            saturated_fat_grams: parseFloat(((baseNutrition.saturated_fat_grams || 0) * multiplier).toFixed(2)),
            carbohydrates_grams: parseFloat(((baseNutrition.carbohydrates_grams || 0) * multiplier).toFixed(2)),
            sugar_grams: parseFloat(((baseNutrition.sugar_grams || 0) * multiplier).toFixed(2)),
            fiber_grams: parseFloat(((baseNutrition.fiber_grams || 0) * multiplier).toFixed(2)),
            sodium_mg: Math.round((baseNutrition.sodium_mg || 0) * multiplier),
            cholesterol_mg: Math.round((baseNutrition.cholesterol_mg || 0) * multiplier)
          }
        },
        diets: randomOptionValue.option_value_diet.map(ovd => ({
          diet_id: ovd.diet.diet_id,
          diet_name: ovd.diet.diet_name
        }))
      }
    };

    res.json(result);
  } catch (err) {
    console.error('Error fetching random option value:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Endpoint 7: Choose menu item and report ingredients with specified allergen
app.get('/api/menu-item-allergen/:menuItemId/:allergenId', async (req, res) => {
  try {
    const { menuItemId, allergenId } = req.params;

    const { data: menuItemData, error: menuItemError } = await supabase
      .from('menu_item')
      .select(`
        menu_item_id,
        display_name,
        item_description,
        base_price
      `)
      .eq('menu_item_id', menuItemId)
      .single();

    if (menuItemError || !menuItemData) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const { data: allergenData, error: allergenError } = await supabase
      .from('allergen')
      .select('allergen_id, name')
      .eq('allergen_id', allergenId)
      .single();

    if (allergenError || !allergenData) {
      return res.status(404).json({ error: 'Allergen not found' });
    }

    const { data: customizationData, error: customizationError } = await supabase
      .from('menu_item_customization')
      .select(`
        option_id,
        custom_option (
          option_id,
          name
        )
      `)
      .eq('menu_item_id', menuItemId);

    if (customizationError) {
      throw customizationError;
    }

    let optionValueResult = null;
    let optionName = null;

    if (customizationData && customizationData.length > 0) {
      const optionIds = customizationData.map(c => c.option_id);
      const { data: optionValuesData, error: optionValuesError } = await supabase
        .from('option_value')
        .select(`
          value_id,
          value_name,
          default_portion,
          option_id,
          nutrition (
            calories,
            protein_grams,
            fat_grams,
            saturated_fat_grams,
            carbohydrates_grams,
            sugar_grams,
            fiber_grams,
            sodium_mg,
            cholesterol_mg
          ),
          option_value_diet (
            diet (
              diet_id,
              diet_name
            )
          )
        `)
        .in('option_id', optionIds);

      if (optionValuesError) {
        throw optionValuesError;
      }

      if (optionValuesData && optionValuesData.length > 0) {
        const randomOptionValue = optionValuesData[Math.floor(Math.random() * optionValuesData.length)];
        optionName = customizationData.find(c => c.option_id === randomOptionValue.option_id)?.custom_option.name || 'Unknown';

        optionValueResult = {
          value_id: randomOptionValue.value_id,
          value_name: randomOptionValue.value_name,
          default_portion: randomOptionValue.default_portion,
          nutrition: randomOptionValue.nutrition || {},
          diets: randomOptionValue.option_value_diet.map(ovd => ({
            diet_id: ovd.diet.diet_id,
            diet_name: ovd.diet.diet_name
          }))
        };
      }
    }

    const { data: menuItemIngredients, error: menuItemIngredientsError } = await supabase
      .from('menu_item_ingredient')
      .select(`
        ingredient_id,
        ingredient (
          ingredient_id,
          name
        )
      `)
      .eq('menu_item_id', menuItemId);

    if (menuItemIngredientsError) {
      throw menuItemIngredientsError;
    }

    let optionValueIngredients = [];
    if (optionValueResult) {
      const { data: ovIngredients, error: ovIngredientsError } = await supabase
        .from('option_value_ingredient')
        .select(`
          ingredient_id,
          ingredient (
            ingredient_id,
            name
          )
        `)
        .eq('value_id', optionValueResult.value_id);

      if (ovIngredientsError) {
      throw ovIngredientsError;
      }
      optionValueIngredients = ovIngredients || [];
    }

    const allIngredientIds = [
      ...menuItemIngredients.map(i => i.ingredient_id),
      ...optionValueIngredients.map(i => i.ingredient_id)
    ];

    const { data: allergenIngredients, error: allergenIngredientsError } = await supabase
      .from('ingredient_allergen')
      .select(`
        ingredient_id,
        ingredient (
          name,
          possible_allergens
        )
      `)
      .eq('allergen_id', allergenId)
      .in('ingredient_id', allIngredientIds);

    if (allergenIngredientsError) {
      throw allergenIngredientsError;
    }

    const result = {
      menu_item: {
        menu_item_id: menuItemData.menu_item_id,
        display_name: menuItemData.display_name,
        item_description: menuItemData.item_description,
        base_price: menuItemData.base_price
      },
      allergen: {
        allergen_id: allergenData.allergen_id,
        allergen_name: allergenData.name
      },
      option_value: optionValueResult ? {
        option_name: optionName,
        ...optionValueResult
      } : null,
      ingredients_with_allergen: allergenIngredients.map(ai => ({
        ingredient_id: ai.ingredient_id,
        ingredient_name: ai.ingredient.name,
        possible_allergens: ai.ingredient.possible_allergens
      }))
    };

    res.json(result);
  } catch (err) {
    console.error('Error fetching menu item allergen ingredients:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Endpoint 8; Swap option value if it contains allergen
// Endpoint 8: Swap option value if it contains allergen
app.get('/api/swap-option-value-allergen/:menuItemId/:allergenId', async (req, res) => {
  try {
    const { menuItemId, allergenId } = req.params;

    const { data: menuItemData, error: menuItemError } = await supabase
      .from('menu_item')
      .select(`
        menu_item_id,
        display_name,
        item_description,
        base_price
      `)
      .eq('menu_item_id', menuItemId)
      .single();

    if (menuItemError || !menuItemData) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const { data: allergenData, error: allergenError } = await supabase
      .from('allergen')
      .select('allergen_id, name')
      .eq('allergen_id', allergenId)
      .single();

    if (allergenError || !allergenData) {
      return res.status(404).json({ error: 'Allergen not found' });
    }

    const { data: customizationData, error: customizationError } = await supabase
      .from('menu_item_customization')
      .select(`
        option_id,
        custom_option (
          option_id,
          name
        )
      `)
      .eq('menu_item_id', menuItemId);

    if (customizationError) {
      throw customizationError;
    }

    if (!customizationData || customizationData.length === 0) {
      return res.status(404).json({ error: 'No custom options found for this menu item' });
    }

    const optionIds = customizationData.map(c => c.option_id);
    const { data: optionValuesData, error: optionValuesError } = await supabase
      .from('option_value')
      .select(`
        value_id,
        value_name,
        default_portion,
        option_id,
        nutrition (
          calories,
          protein_grams,
          fat_grams,
          saturated_fat_grams,
          carbohydrates_grams,
          sugar_grams,
          fiber_grams,
          sodium_mg,
          cholesterol_mg
        ),
        option_value_diet (
          diet (
            diet_id,
            diet_name
          )
        )
      `)
      .in('option_id', optionIds);

    if (optionValuesError) {
      throw optionValuesError;
    }

    if (!optionValuesData || optionValuesData.length === 0) {
      return res.status(404).json({ error: 'No option values found for the custom options' });
    }

    const randomOptionValue = optionValuesData[Math.floor(Math.random() * optionValuesData.length)];
    const optionName = customizationData.find(c => c.option_id === randomOptionValue.option_id)?.custom_option.name || 'Unknown';

    const { data: optionValueIngredients, error: ovIngredientsError } = await supabase
      .from('option_value_ingredient')
      .select(`
        ingredient_id,
        ingredient (
          ingredient_id,
          name
        )
      `)
      .eq('value_id', randomOptionValue.value_id);

    if (ovIngredientsError) {
      throw ovIngredientsError;
    }

    const optionValueIngredientIds = optionValueIngredients.map(i => i.ingredient_id);
    const { data: allergenIngredients, error: allergenIngredientsError } = await supabase
      .from('ingredient_allergen')
      .select(`
        ingredient_id,
        ingredient (
          name,
          possible_allergens
        )
      `)
      .eq('allergen_id', allergenId)
      .in('ingredient_id', optionValueIngredientIds);

    if (allergenIngredientsError) {
      throw allergenIngredientsError;
    }

    let resultOptionValue = null;
    let swapped = false;
    let ingredientsWithAllergen = null;

    if (allergenIngredients && allergenIngredients.length > 0) {
      ingredientsWithAllergen = allergenIngredients.map(ai => ({
        ingredient_id: ai.ingredient_id,
        ingredient_name: ai.ingredient.name,
        possible_allergens: ai.ingredient.possible_allergens
      }));

      for (const optionValue of optionValuesData) {
        if (optionValue.value_id === randomOptionValue.value_id) continue;

        const { data: altIngredients, error: altIngredientsError } = await supabase
          .from('option_value_ingredient')
          .select('ingredient_id')
          .eq('value_id', optionValue.value_id);

        if (altIngredientsError) {
          throw altIngredientsError;
        }

        const altIngredientIds = altIngredients.map(i => i.ingredient_id);
        const { data: altAllergenCheck, error: altAllergenError } = await supabase
          .from('ingredient_allergen')
          .select('ingredient_id')
          .eq('allergen_id', allergenId)
          .in('ingredient_id', altIngredientIds);

        if (altAllergenError) {
          throw altAllergenError;
        }

        if (!altAllergenCheck || altAllergenCheck.length === 0) {
          resultOptionValue = {
            value_id: optionValue.value_id,
            value_name: optionValue.value_name,
            default_portion: optionValue.default_portion,
            nutrition: optionValue.nutrition || {},
            diets: optionValue.option_value_diet.map(ovd => ({
              diet_id: ovd.diet.diet_id,
              diet_name: ovd.diet.diet_name
            }))
          };
          swapped = true;
          optionName = customizationData.find(c => c.option_id === optionValue.option_id)?.custom_option.name || 'Unknown';
          break;
        }
      }
    } else {
      resultOptionValue = {
        value_id: randomOptionValue.value_id,
        value_name: randomOptionValue.value_name,
        default_portion: randomOptionValue.default_portion,
        nutrition: randomOptionValue.nutrition || {},
        diets: randomOptionValue.option_value_diet.map(ovd => ({
          diet_id: ovd.diet.diet_id,
          diet_name: ovd.diet.diet_name
        }))
      };
    }

    const result = {
      menu_item: {
        menu_item_id: menuItemData.menu_item_id,
        display_name: menuItemData.display_name,
        item_description: menuItemData.item_description,
        base_price: menuItemData.base_price
      },
      allergen: {
        allergen_id: allergenData.allergen_id,
        allergen_name: allergenData.name
      },
      original_option_value: {
        option_name: optionName,
        value_id: randomOptionValue.value_id,
        value_name: randomOptionValue.value_name,
        default_portion: randomOptionValue.default_portion,
        nutrition: randomOptionValue.nutrition || {},
        diets: randomOptionValue.option_value_diet.map(ovd => ({
          diet_id: ovd.diet.diet_id,
          diet_name: ovd.diet.diet_name
        })),
        ingredients_with_allergen: ingredientsWithAllergen || []
      },
      swapped_option_value: resultOptionValue ? {
        option_name: optionName,
        ...resultOptionValue
      } : null,
      message: !resultOptionValue && ingredientsWithAllergen ? 'No allergen-free option values available' : null
    };

    res.json(result);
  } catch (err) {
    console.error('Error swapping option value for allergen:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// endpoint 9; get menu item, generate order script
app.get('/api/order-script/:menuItemId', async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const { data: menuItemData, error: menuItemError } = await supabase
      .from('menu_item')
      .select(`
        menu_item_id,
        display_name,
        item_description,
        base_price,
        menu (
          menu_id,
          restaurant_id,
          restaurant (
            restaurant_id,
            name,
            location
          )
        )
      `)
      .eq('menu_item_id', menuItemId)
      .single();

    if (menuItemError || !menuItemData) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const { data: customizationData, error: customizationError } = await supabase
      .from('menu_item_customization')
      .select(`
        option_id,
        custom_option (
          option_id,
          name
        )
      `)
      .eq('menu_item_id', menuItemId);

    if (customizationError) {
      throw customizationError;
    }

    let customizations = [];
    if (customizationData && customizationData.length > 0) {
      const optionIds = customizationData.map(c => c.option_id);
      const { data: optionValuesData, error: optionValuesError } = await supabase
        .from('option_value')
        .select(`
          value_id,
          value_name,
          option_id
        `)
        .in('option_id', optionIds);

      if (optionValuesError) {
        throw optionValuesError;
      }

      if (optionValuesData && optionValuesData.length > 0) {
        const optionValuesByOption = optionIds.map(optionId => ({
          option_id: optionId,
          option_name: customizationData.find(c => c.option_id === optionId)?.custom_option.name || 'Unknown',
          values: optionValuesData.filter(ov => ov.option_id === optionId)
        }));

        customizations = optionValuesByOption.map(option => {
          const randomValue = option.values[Math.floor(Math.random() * option.values.length)];
          return {
            option_name: option.option_name,
            value_name: randomValue.value_name
          };
        });
      }
    }

    let script = `Hi, I would like to order ${menuItemData.display_name}.`;
    if (customizations.length > 0) {
      const customizationStrings = customizations.map(c => 
        ` My choice of ${c.option_name.toLowerCase()} is ${c.value_name.toLowerCase()}.`
      );
      script += customizationStrings.join('');
    } else {
      script += ' No customizations needed.';
    }
    script += ' Thank you!';

    const result = {
      restaurant: {
        restaurant_id: menuItemData.menu.restaurant.restaurant_id,
        name: menuItemData.menu.restaurant.name,
        location: menuItemData.menu.restaurant.location || 'Location not specified'
      },
      menu_item: {
        menu_item_id: menuItemData.menu_item_id,
        display_name: menuItemData.display_name,
        item_description: menuItemData.item_description,
        base_price: menuItemData.base_price
      },
      customizations: customizations,
      order_script: script
    };

    res.json(result);
  } catch (err) {
    console.error('Error generating order script:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Endpoint 10; generate order script, translate to another language using groq
app.get('/api/order-script-translated/:menuItemId/:language', async (req, res) => {
  try {
    const { menuItemId, language } = req.params;

    // Basic language code validation
    if (!language || typeof language !== 'string') {
      return res.status(400).json({ error: 'Invalid language code' });
    }

    // Verify the menu item exists and get restaurant details
    const { data: menuItemData, error: menuItemError } = await supabase
      .from('menu_item')
      .select(`
        menu_item_id,
        display_name,
        item_description,
        base_price,
        menu (
          menu_id,
          restaurant_id,
          restaurant (
            restaurant_id,
            name,
            location
          )
        )
      `)
      .eq('menu_item_id', menuItemId)
      .single();

    if (menuItemError || !menuItemData) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Get custom options linked to the menu item
    const { data: customizationData, error: customizationError } = await supabase
      .from('menu_item_customization')
      .select(`
        option_id,
        custom_option (
          option_id,
          name
        )
      `)
      .eq('menu_item_id', menuItemId);

    if (customizationError) {
      throw customizationError;
    }

    let customizations = [];
    if (customizationData && customizationData.length > 0) {
      const optionIds = customizationData.map(c => c.option_id);
      const { data: optionValuesData, error: optionValuesError } = await supabase
        .from('option_value')
        .select(`
          value_id,
          value_name,
          option_id
        `)
        .in('option_id', optionIds);

      if (optionValuesError) {
        throw optionValuesError;
      }

      if (optionValuesData && optionValuesData.length > 0) {
        const optionValuesByOption = optionIds.map(optionId => ({
          option_id: optionId,
          option_name: customizationData.find(c => c.option_id === optionId)?.custom_option.name || 'Unknown',
          values: optionValuesData.filter(ov => ov.option_id === optionId)
        }));

        customizations = optionValuesByOption.map(option => {
          const randomValue = option.values[Math.floor(Math.random() * option.values.length)];
          return {
            option_name: option.option_name,
            value_name: randomValue.value_name
          };
        });
      }
    }

    // Generate the order script in English
    let script = `Hi, I would like to order ${menuItemData.display_name}.`;
    if (customizations.length > 0) {
      const customizationStrings = customizations.map(c => 
        ` My choice of ${c.option_name.toLowerCase()} is ${c.value_name.toLowerCase()}.`
      );
      script += customizationStrings.join('');
    } else {
      script += ' No customizations needed.';
    }
    script += ' Thank you!';

    // Translate the script using Groq API
    let translatedScript;
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: 'Groq API key not configured' });
    }

    try {
      const response = await axios.post(
        'https://api.groq.com/v1/completions',
        {
          model: 'mixtral-8x7b-32768', // Adjust model as needed
          prompt: `Translate the following English text to ${language.toLowerCase()}: "${script}"`,
          max_tokens: 200
        },
        {
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      translatedScript = response.data.choices[0].text.trim();
    } catch (translationError) {
      return res.status(400).json({ error: `Translation error: ${translationError.message}` });
    }

    // Transform the result
    const result = {
      restaurant: {
        restaurant_id: menuItemData.menu.restaurant.restaurant_id,
        name: menuItemData.menu.restaurant.name,
        location: menuItemData.menu.restaurant.location || 'Location not specified'
      },
      menu_item: {
        menu_item_id: menuItemData.menu_item_id,
        display_name: menuItemData.display_name,
        item_description: menuItemData.item_description,
        base_price: menuItemData.base_price
      },
      customizations: customizations,
      order_script: {
        english: script,
        translated: {
          language: language.toLowerCase(),
          script: translatedScript
        }
      }
    };

    res.json(result);
  } catch (err) {
    console.error('Error generating translated order script:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Endpoint 11; Generate image for menu item wiht random option value using Pollinations.ai
app.get('/api/generate-menu-image/:menuItemId', async (req, res) => {
  try {
    const { menuItemId } = req.params;

    // Verify the menu item exists
    const { data: menuItemData, error: menuItemError } = await supabase
      .from('menu_item')
      .select('menu_item_id, display_name')
      .eq('menu_item_id', menuItemId)
      .single();

    if (menuItemError || !menuItemData) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Get custom options linked to the menu item
    const { data: customizationData, error: customizationError } = await supabase
      .from('menu_item_customization')
      .select(`
        option_id,
        custom_option (
          option_id,
          name
        )
      `)
      .eq('menu_item_id', menuItemId);

    if (customizationError) {
      throw customizationError;
    }

    let selectedOptionValue = null;
    let optionName = null;

    if (customizationData && customizationData.length > 0) {
      // Get all option values for the custom options
      const optionIds = customizationData.map(c => c.option_id);
      const { data: optionValuesData, error: optionValuesError } = await supabase
        .from('option_value')
        .select('value_id, value_name, option_id')
        .in('option_id', optionIds);

      if (optionValuesError) {
        throw optionValuesError;
      }

      if (optionValuesData && optionValuesData.length > 0) {
        // Randomly select one option value
        selectedOptionValue = optionValuesData[Math.floor(Math.random() * optionValuesData.length)];
        optionName = customizationData.find(c => c.option_id === selectedOptionValue.option_id)?.custom_option.name || 'Unknown';
      }
    }

    // If no option value found, use a default prompt
    // Needs to use image generation description (both menu item and option value)
    const valueName = selectedOptionValue ? selectedOptionValue.value_name : '';
    const prompt = valueName 
      ? `Appetizing image of ${menuItemData.display_name} featuring ${valueName}`
      : `Appetizing image of ${menuItemData.display_name}`;

    // Generate random seed for unique images
    const seed = Math.floor(Math.random() * 1000000);

    // Construct Pollinations.ai image URL
    const apiKey = process.env.POLLINATIONS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Pollinations API key not configured' });
    }

    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}&token=${apiKey}`;

    const result = {
      menu_item_id: menuItemData.menu_item_id,
      menu_item_name: menuItemData.display_name,
      option_name: optionName || null,
      option_value_name: valueName || null,
      prompt: prompt,
      image_url: imageUrl
    };

    res.json(result);
  } catch (err) {
    console.error('Error generating menu image:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});