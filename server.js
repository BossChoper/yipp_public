const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

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
    
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});