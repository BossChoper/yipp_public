# Yippee App - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Open the Application

Navigate to the public folder and open `app.html`:

```bash
cd database_testing/public
open app.html
```

Or serve it through your backend server if running.

### Step 2: Start Exploring

The app opens on the **Map View** by default. Use the navigation tabs to explore:

- 🗺️ **Map** - Discover restaurants near you
- 📋 **Restaurant List** - Browse all restaurants with filters
- 💬 **Socials** - See what others are sharing
- 👤 **User** - Set your preferences and favorites

### Step 3: Try Key Features

#### Search & Filter
1. Use the global search bar to find restaurants or dishes
2. Click **🎛️ Filters** to open dietary and nutritional filters
3. Select preferences like "Vegan", "High Protein", etc.
4. Use **✕ Clear** to reset all filters

#### Browse Restaurants
1. Click any restaurant card to view details
2. Scroll through the menu items
3. Use the sticky search bar to find specific dishes
4. Try the quick filter presets: "Vegan Only", "High Protein", etc.

#### Menu Item Actions
Each menu item has multiple actions:

- **📊 Show Nutrition** - View and edit ingredients, see nutrition facts
- **🎯 Make It** - Auto-customize based on your preferences
- **🌍 Translate** - Get order scripts in different languages
- **❤️ Like** - Save items you love
- **🔖 Bookmark** - Mark items to try later
- **🛒 Add to Cart** - Build your shopping list
- **➕ Expand** - See more photos, descriptions, and comments

#### Shopping List
1. Add items from different restaurants to your cart
2. Click the **🛒** icon (appears when you have items)
3. View items grouped by restaurant
4. See total prices per restaurant
5. Export or clear your list

#### User Profile
1. Go to the **User** tab
2. Click **✏️ Edit Profile** to set your name
3. Configure dietary preferences
4. Set notification preferences
5. Click **💾 Save Preferences**

## 🎨 UI Features Highlights

### Tag System
- Each item shows up to 3 tags
- Hover over **+N** button to see more tags
- Color-coded for quick identification:
  - 🟢 Green = Vegan/Vegetarian
  - 🔴 Red = Meat-based
  - 🌸 Pink = High Protein
  - 🫒 Olive = Plant Protein

### Expandable Cards
- Click **➕** on any menu item to expand
- See additional images, full description, ingredients
- Read user comments and ratings
- Collapse by clicking **➕** again

### Smart Customization
- **Make It** button auto-selects options matching your preferences
- See exactly what's selected and why
- Use **↩️ Undo** if you want to change
- Real-time price updates as you customize

### Disclaimers
- Important safety information displayed clearly
- Click "Collapse" to minimize after reading
- Contact info easily accessible with copy buttons

## 🔧 Configuration

### Backend API
The app expects your backend at `http://localhost:3000/api`

If your server runs on a different port, edit `app.js`:

```javascript
const CONFIG = {
    API_BASE: 'http://localhost:YOUR_PORT/api',
    MAX_VISIBLE_TAGS: 3,
    POSTS_PER_PAGE: 10,
};
```

### Customization
- **Tag limits**: Change `MAX_VISIBLE_TAGS` in config
- **Social posts**: Change `POSTS_PER_PAGE` in config
- **Colors**: Edit CSS variables in `app-styles.css`
- **Mock data**: Modify functions in `app.js`

## 📱 Mobile View

The app is fully responsive! Try it on mobile:

1. Open on your phone's browser, or
2. Use browser dev tools (F12) → Device toolbar (Ctrl+Shift+M)
3. Select a mobile device preset

Mobile optimizations:
- Collapsible navigation
- Touch-friendly buttons
- Swipeable content (ready for enhancement)
- Optimized spacing and layouts

## 🎯 Common Tasks

### Add a Restaurant to Favorites
1. Go to restaurant details
2. Click ❤️ on the restaurant name
3. Check User → Favorites to see saved items

### Build a Custom Meal
1. Find a customizable menu item (has "Make It" button)
2. Click **🎯 Make It**
3. Select your dietary preferences
4. Review auto-selected options
5. Click **✅ Apply**

### Share on Social
1. Go to Socials tab
2. Type in the composer box
3. Click **📝 Post**
4. Like, repost, or quote others' posts

### Upload New Data (Admin)
1. Navigate to Admin tab (may need to enable)
2. Select upload type (Restaurant/Menu/Item)
3. Drop files or click to browse
4. Add AI prompt for analysis (optional)
5. Click **🤖 Analyze with AI**
6. Review and edit parsed data
7. Click **✅ Submit to Database**

## 🐛 Troubleshooting

### No Restaurants Loading
- Check if backend server is running
- Verify API endpoint in browser: `http://localhost:3000/api/all-restaurant-menus`
- Check browser console for errors (F12)

### Filters Not Working
- Click **✕ Clear Filters** to reset
- Refresh the page
- Check if restaurants have tags in database

### Shopping Cart Not Showing
- Add at least one item to cart
- Badge appears automatically when items added
- Check browser console for JavaScript errors

### Modals Not Opening
- Check browser console for errors
- Ensure JavaScript is enabled
- Try refreshing the page

### Styles Not Loading
- Verify `app-styles.css` is in same folder as `app.html`
- Check browser console for 404 errors
- Clear browser cache (Ctrl+Shift+R)

## 💡 Tips & Tricks

1. **Keyboard Shortcuts**
   - `Escape` - Close any open modal

2. **Quick Filtering**
   - Use preset buttons for instant filtering
   - Combine multiple dietary preferences

3. **Price Budgeting**
   - Use price range slider in filters
   - Check shopping list for totals before ordering

4. **Discover New Foods**
   - Browse social timeline for recommendations
   - Like popular items to save for later

5. **Contact Restaurants**
   - One-click copy phone/email from details
   - Use translate feature for foreign restaurants

## 📊 Features Summary

✅ **Implemented**
- Global search with filters
- Restaurant list with sorting
- Restaurant details with menus
- Expandable menu items
- Tag system (3 visible + more)
- Nutrition modal with editing
- Auto-customization (Make It)
- Translation feature
- Shopping list by restaurant
- Social timeline
- User profile and preferences
- Image generation placeholder
- Disclaimers with collapse
- Contact info with copy
- Responsive design
- Accessibility features

🔜 **Coming Soon**
- Real Google Maps integration
- Live image generation
- Push notifications
- Payment processing
- Advanced analytics
- Dark mode
- Offline support

## 📞 Support

For questions or issues:
1. Check the full README.md
2. Review UI/UX guidelines document
3. Check browser console for error messages
4. Contact development team

---

**Happy exploring! 🍽️**

Enjoy discovering great food with Yippee!


