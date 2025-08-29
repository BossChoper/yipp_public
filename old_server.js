import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// -----------------------
// ROUTES
// -----------------------

// Get all restaurants with images
app.get("/restaurants", async (req, res) => {
    const { data, error } = await supabase
      .from("restaurants")
      .select(`
        restaurant_id,
        restaurant_name,
        description,
        images (
          image_id,
          image_url,
          alt_text
        )
      `)
      .limit(20);
  
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // List customization options + option values for a menu item (vegan filter)
app.get("/menu-items/:id/customizations", async (req, res) => {
    const { id } = req.params; // e.g. CHIP-1
  
    // Step 1: Get all options linked to the menu item
    const { data, error } = await supabase
  .from("menu_item_customizations")
  .select(`
    option_id,
    custom_options (
      option_name,
      option_description,
      option_type
    ),
    option_values (
      value_id,
      value_name,
      generated_ingredient_list,
      option_value_ingredients (
        ingredients (
          ingredient_name,
          contains_meat,
          contains_dairy,
          contains_egg,
          contains_fish,
          contains_shellfish,
          contains_poultry,
          contains_honey,
          contains_animal_product
        )
      )
    )
  `)
  .eq("menu_item_id", id);

  
    if (customErr) return res.status(500).json({ error: customErr.message });
  
    // Step 2: Filter vegan values (no animal product flags)
    const veganCustomizations = customizations.map(c => {
      const veganValues = c.option_values.filter(v => {
        // If any ingredient contains animal product → exclude
        if (!v.option_value_ingredients || v.option_value_ingredients.length === 0) return true; // assume vegan if no ingredient link
        return v.option_value_ingredients.every(ovi => {
          const ing = ovi.ingredients;
          return !(
            ing.contains_meat ||
            ing.contains_dairy ||
            ing.contains_egg ||
            ing.contains_fish ||
            ing.contains_shellfish ||
            ing.contains_poultry ||
            ing.contains_honey ||
            ing.contains_animal_product
          );
        });
      });
      return {
        option_id: c.option_id,
        option_name: c.custom_options.option_name,
        option_type: c.custom_options.option_type,
        values: veganValues.map(v => ({
          value_id: v.value_id,
          value_name: v.value_name
        }))
      };
    });
  
    res.json(veganCustomizations);
  });
  

// Get all images for a restaurant
app.get("/restaurants/:id/images", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("images")
    .select("image_id, image_url, alt_text, is_food, is_restaurant")
    .eq("restaurant_id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Upload an image entry (metadata; actual file handled via Supabase Storage)
app.post("/images", async (req, res) => {
  const { image_url, restaurant_id, menu_item_id, alt_text, is_food, is_restaurant } = req.body;

  const { data, error } = await supabase
    .from("images")
    .insert([{ image_url, restaurant_id, menu_item_id, alt_text, is_food, is_restaurant }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// -----------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
