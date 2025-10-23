UI/UX Guidelines
Tag Display:
Display up to 3 tags per menu item; additional tags (>3) are hidden under a circular "+" button that expands on click to show all tags.
Item Expansion:
Each menu item includes an expandable section containing an image carousel, long description, ingredients list, and nutritional information. Expand to include dynamic updates: When ingredients are edited in the Nutrition modal, update the description and nutrition in real-time via Nutritionix API integration.
Option Values:
Show option values (e.g., Steak, Tofu) in the main menu section and within the expanded item section for customizable items.
Short Descriptions:
Display concise short descriptions for menu items at first glance for quick user scanning. Enhance with tooltips: On hover or tap, show a preview of the long description to aid decision-making without full expansion.
Tag Coloring:
Assign distinct colors to tags for visual clarity and accessibility (ensuring WCAG 2.1 contrast ratios of at least 4.5:1):
Vegan: Good green (#22BB88 – a vibrant, eco-friendly green evoking freshness and plant-based appeal).*
Vegetarian: Lime/light green (#90EE90 – a soft, approachable green for non-meat diets).*
Meat-eater: Red (#FF0000 – a bold red to signify animal-based options).*
Protein: Reddish-pinkish (#FF69B4 – a energetic pink-red for general protein sources).*
Plant protein: Greenish-reddish (#6B8E23 – an olive green with subtle red undertones for plant-based proteins, blending vegan green with protein pink).*
Tag Prioritization:
Allergen and dietary tags appear first in any tag list for user safety and preference. Add sorting logic: Prioritize based on user app preferences (e.g., if "Vegan" is prioritized, show it prominently).
Layout Guidelines
Global Elements:
Include a global search bar at the top of the interface.
Place a filters button next to the search bar.
Feature top-level navigation tabs: Map, Restaurant List, User, Admin.
Display a Shopping List icon when items are saved, showing a summary of collected items from different restaurants for ordering. Expand with notifications: Alert users if items in the list have price changes or availability updates.
Pages
Home/Welcome (1)
Map(2)
Restaurant List (3)
User (4)
Socials (5)
Admin (6, Not Public)


User Screen (Build Profile):
Allow users to build a profile with:
Name
Main region/location
Foods/Restaurants:
Favorites
Likes
Dislikes
Preferences
App Preferences:
Filter restaurants by specific tags (e.g., Vegan, High-Protein; multiple tags supported).
Filter menu items by tags in searches and menus.
Prioritize specific tags in results.
Notification Preferences:
Option to reduce notification frequency.
Alerts based on proximity/location.
Alerts for specific restaurants or liked/favorited/bookmarked restaurants (multiple selections allowed).
Expand profile building: Include an onboarding wizard with step-by-step prompts to increase completion rates and integrate with social login for auto-filling basic info.
Socials Screen:
Default to a timeline view showing 10 posts at a time. Expand loading: Implement infinite scroll with a "Load More" button for better performance on long feeds.
Support post interactions: Post, Like, Bookmark/Save, Quote, Repost, Translate (via ellipsis).
Allow quoting of Menu Items, Option Values, Meal Builds, Restaurants, or Comments.
Include tags and a local search bar for filtering posts. Add engagement metrics: Display likes/reposts counts on posts to encourage interaction.
Search Screen Layout:
Organize results hierarchically: Restaurant > Menu Item > Option Values (if relevant).
Examples:
"High protein food near me":
Restaurant 1 (Chipotle): Burrito Bowl
Options: Steak, Cheese, Sour cream
Protein: 50g
"High protein $10":
Restaurant 1 (McDonalds):
Big Mac: $5
8pc Chicken Nuggets: $5
"Vegan High Protein with dessert $30":
Restaurant 1 (Vegan World):
Black Bean Burger: $10, Protein: 20g
Vegan Rice Bowl: $8, Option: Tofu (+$2, total $10)
Tofu Cheesecake: Quantity 2, Total $10, Protein: 12g
Expand search: Integrate geolocation for "near me" queries and allow sorting by price, protein, or user-prioritized tags.


Restaurant Details Layout:
Place the restaurant description at the top.
List location below the description.
Include phone and email contact details beneath the location.
Display a restaurant image carousel on the left.
Optionally include a local map on the right (skippable). Expand map: Use interactive maps (e.g., Google Maps API) with directions and hours if available.
Menu Layout:
Feature a local search bar at the top of the menu section.
Include dietary, allergen, tag filters, and nutritional sorting options below the search bar.
Show menu item images on the left of each item card.
Include buttons: "Show Nutrition" (opens modal with ingredients and stats), "Make It" (for customizable items), and "Translate" (generates order scripts).
Add an ellipsis (...) at the top-right corner of each card for additional actions.
Include icon buttons for Like and Bookmark.
Nutrition + Ingredient Modal:
Ingredients as an editable checklist (auto-checked; unchecking removes and updates nutrition via Nutritionix API).
Show customization option values.
Include a "Generate Image" button to create visuals of the customized item. Expand modal: Add save/share options for custom configurations.
Menu Item Expanded Card:
Expand via a "+" button on the main item card.
Display two additional item photos on the left, a longer description, ingredients list, and nutrition statistics.
Show user comments directly beneath the expanded section.
For customizable meals (tagged “customizable” or “meal-build”):
Display option values (e.g., Protein, Rice).
Option value cards include:
Image on the left.
Short description.
Tags.
Nutrition identifiers (e.g., 7g protein, 4g fiber) based on user preferences or randomly selected.
"Show Nutrition" icon button.
Expand comments: Allow sorting by recency or popularity, with moderation tools for admins.
Shopping List Screen *:
List saved items from restaurants, including edits and customizations.
Generate images of orders per restaurant using AI API (build prompts like “Generate an appetizing image of {item 1} with {option value}. Add {item 2}...”).
Show totals per restaurant (e.g., “McDonalds: Big Mac (no lettuce), Fries, Total: $10.75 without tax”).
Expand: Include order export to delivery apps or direct restaurant contact buttons.
Upload Screen *:
Allow uploading/updating restaurant, menu, or item data.
(FUTURE) Retrieve existing data from the database for selection.
Accept files: CSV, JSON, Image (PNG/JPEG), PDF; support manual editing.
Provide a prompt for analysis (e.g., “Restaurant is entirely vegan...”).
(FUTURE) Send to AI API (Groq, any model) to parse into JSON for form filling.
Analyzed data includes: Restaurant name/cuisine, menu categories/items with tags, descriptions, ingredients (sourced vs. assumed), nutrition (marked S/G).
Edit data before database upload.
Expand: Add validation checks for data consistency (e.g., ensure vegan restaurants have no meat tags) and preview mode before submission.
Button and Interaction Guidelines
Show Nutrition Button:
Opens a modal with nutritional data and an editable ingredients checklist (all items auto-checked; unchecking removes them from calculations).
Make It Button:
Automatically selects option values based on user preferences (e.g., Vegan, High-Protein, Low Calorie, High Fiber).
Available only for items tagged “customizable” or “meal-build”.
Supports combining multiple preferences; if not possible, display an error: “Cannot complete due to option unavailability.”
Expand: Log user preferences for analytics to suggest future customizations.
Translate Button *:
Generates an order script in chosen languages for any menu item.
Builds scripts based on selected items and customizations.
Generate Image Button *:
Available in Nutrition modal or Shopping List; generates images of edited items or full orders via AI API.
View generated images in a modal screen.
Modals Guidelines *
Sub-screens for interactions:
Ingredients + Nutrition from “Show Nutrition”.
Customization from “Make It”.
Translate language/script from “Translate”.
Expand modals: Ensure they are dismissible with keyboard shortcuts and support dark mode for consistency.
AI Context Guidelines *
Do not generate data for sourced items.
Follow restrictions (e.g., vegan restaurants must use vegan ingredients and tags).
Assign tags based on likely relevance (e.g., from word bank).
(FUTURE) Use Nutritionix API for nutrition calculations where applicable.
Expand: Implement fallback prompts if AI parsing fails, and log AI responses for debugging.
Miscellaneous Guidelines
Disclaimers:
Display in bold with an exclamation mark icon for visibility.
For unverified restaurants:
“Restaurant information and data is not verified by the restaurant. Always contact the restaurant for further information regarding allergens, dietary needs, location, price updates. Phone: {insert_phone}, Email: {insert_email}.”
For unverified menus:
“Menu information and data is not verified by the restaurant. Always contact the restaurant for further information regarding allergens, dietary needs, price updates. Phone: {insert_phone}, Email: {insert_email}.”
For generated ingredients/nutrition data:
“Food information including ingredients and nutrition is assumed and not verified by the restaurant. Always contact the restaurant for further information regarding allergens, dietary needs, nutritional data, ingredients. Phone: {insert_phone}, Email: {insert_email}.”
Expand: Make disclaimers collapsible after first view to reduce clutter.

Suggestions:
Tag Preview on Hover/Tap: Implement a hover (desktop) or tap (mobile) preview for tags hidden under the "+" button to allow quick viewing without full expansion, improving usability for users browsing multiple items.
Accessible Tag Colors: Ensure tag colors meet WCAG 2.1 contrast ratios (4.5:1 minimum). Suggested adjustments:
Vegan: #006400 (darker green).
Vegetarian: #98FB98 (bolder light green).
Meat-eater: #CC0000 (softer red).
Protein: #FF4040 (neutral red); plant protein: #6B8E23 (olive green). Add a color key in the app’s help section to explain tag meanings.
Image Carousel Navigation: Add clear navigation indicators (dots or arrows) to the image carousel in expanded item sections and restaurant details, with swipe support for mobile users.
Pinned Expanded Sections: Allow users to pin frequently viewed expanded menu item sections to avoid repetitive clicks, especially for frequent orders or favorite items.
Option Value Grouping: Group option values by category (e.g., Protein, Toppings, Sauces) in menu and expanded views to improve readability and decision-making.
Popular Option Highlights: Highlight popular or recommended option values (e.g., with a “Most Popular” badge) to guide users toward common choices.
Clear Filters Button: Add a “Clear Filters” button next to the global and menu search bar filters to allow users to reset search parameters quickly.
Collapsible Search Results: Use collapsible sections for search results (Restaurant > Menu Item > Options) to reduce visual clutter, especially for restaurants with extensive menus.
Restaurant Rating/Distance Indicators: Display star ratings or distance metrics next to restaurant names in search results to help users prioritize based on quality or proximity.
Copy Contact Info: Add a “Copy” button for phone and email in the restaurant details layout to enhance user convenience for contacting restaurants.
Toggleable Local Map: Include a toggle to show/hide the optional local map in the restaurant details layout to save screen space, especially on mobile devices.
Sticky Menu Search Bar: Implement sticky positioning for the menu section’s search bar and filters to keep them accessible while scrolling long menus.
Quick Filter Presets: Provide preset filter options (e.g., “Vegan Only,” “High Protein”) below the menu search bar to reduce setup time for common dietary preferences.
Real-Time Price Updates: Display a dynamic price update in the expanded card when users select option values for buildable meals to ensure transparency.
Nutrition Modal Enhancements: Allow users to save custom ingredient configurations in the “Show Nutrition” modal for future orders, streamlining repeat customizations.
Undo for Make It Button: Add an “Undo” option after applying “Make It” customizations to allow users to revert changes easily if they make a mistake.
Complementary Item Suggestions: When using the “Make It” button, suggest complementary items (e.g., sides, drinks) for buildable meals to encourage upselling and enhance user experience.
Socials Timeline Interactions: Add infinite scroll or a “Load More” button for the Socials Screen timeline to improve performance over loading only 10 posts at a time.
Post Filtering by Tags: Allow users to filter the Socials Screen timeline by tags (e.g., Vegan, High-Protein) using the local search bar to find relevant posts quickly.
Disclaimer Visibility: Display disclaimers in a collapsible banner with a prominent exclamation mark icon to ensure visibility without overwhelming the interface; allow users to dismiss them temporarily.
Additional Implementation Suggestions
API Template Validation: When requesting the API template, ensure it includes endpoints for:
Search (with dietary, nutritional, and price filters).
Menu item details (options, tags, nutrition).
Restaurant metadata (description, contact, images).
User profile data (preferences, favorites, notifications).
Socials timeline (posts, quotes, reposts). Verify support for real-time pricing and availability updates.
Performance Optimization: Lazy-load images in carousels and social posts to improve page load times, particularly for mobile users with slower connections.
User Profile Customization: Allow users to set a default view (e.g., Map, Restaurant List, Socials) when opening the app, based on their preferences in the User Screen.
Notification Customization Feedback: Provide a preview of notification settings (e.g., sample alert) when users configure preferences to ensure clarity on what they’ll receive.
Analytics for User Behavior: Track interactions with buttons (“Show Nutrition,” “Make It,” Like, Bookmark) and search queries to optimize UI based on usage patterns and improve result relevance.