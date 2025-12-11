1. MUST-FIX (Blocker / High Priority)
Menu & Item Interaction
Tags on menu items are currently non-functional → Make tags clickable → Clicking a tag filters the menu to show all items with the same tag
Menu Item Expanded Card redesign → Remove the + button entirely → Make the entire card hoverable → Clicking anywhere on the card opens the expanded section
Add “Make it” button on item cards for items tagged with “customizable” or “buildable”
Move restaurant_tags section below restaurant_description
Add menu selector dropdown on restaurant page → Include an “All Items” option that shows every menu item (including is_active = false / unavailable items)
Restaurant Page Layout & Information
If a restaurant has multiple locations (restaurant_location > 1) → remove contact information from the main header
Make the Locations section collapsible
Add a new “Contact” collapsible section → Add “Contact” header → Make it expandable/collapsible → Include the Local Map widget inside this section
Filtering & Navigation
Add a Filter button to the Restaurant List page
Nutrition Modal
Nutrition modal must display: → All customization_options linked to the menu_item (via menu_item_customization lookup) → Currently assigned option_values
Allow users to select/deselect option_values via checkboxes → Nutrition calculation updates in real-time based on checked options
Expanded Item Section
For items tagged “customizable”, show example meal builds below the Nutrition Facts section
Ratings (Recently Added to DB)
Restaurants can have multiple ratings from different sources (Yelp, Google, etc.)
Display ratings in order defined by display_order
First rating shows on the restaurant card
On the full restaurant page, make ratings clickable → show full rating value + source_name (from source_id lookup)
Any other ratings shown in list
2. NICE-TO-HAVE (Lower Priority)
Translation
Move the Translate button so it only appears on the Shopping List page (show at top of page)
(Optional) Consider a universal translate button on other pages later
Restaurant Page – User Actions
Add Like / Dislike button
Add Save / Bookmark button
(Later) Possibly rename “Like” → “Favorite”
Search & Placeholder Improvements
Menu Search bar placeholder text ideas: → “Search by price” → “Search by diet” → “Search by nutrition” → “Search by tags” → “Search by customization”
