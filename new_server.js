// works
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files (CSS, JS, images) from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Serve the frontend HTML at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Keep the old inline HTML route commented out for reference
/*
app.get('/inline', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restaurant Menu Manager</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 300;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .main-content {
            padding: 30px;
        }

        .controls {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            flex-wrap: wrap;
            align-items: center;
        }

        .dropdown-container {
            flex: 1;
            min-width: 250px;
        }

        .dropdown-container label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }

        select, input, textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: white;
        }

        select:focus, input:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn {
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            color: #333;
        }

        .btn-danger {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            color: #333;
        }

        .restaurant-info {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .restaurant-info h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.8rem;
        }

        .restaurant-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }

        .detail-item {
            background: rgba(255, 255, 255, 0.7);
            padding: 12px;
            border-radius: 8px;
        }

        .detail-item strong {
            color: #667eea;
        }

        .menus-section {
            margin-top: 30px;
        }

        .menu-card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 25px;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .menu-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .menu-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .menu-header h3 {
            font-size: 1.4rem;
            font-weight: 600;
        }

        .menu-items {
            padding: 20px;
        }

        .menu-item {
            border: 2px solid #f0f0f0;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            transition: all 0.3s ease;
            background: #fafafa;
        }

        .menu-item:hover {
            border-color: #667eea;
            background: white;
            transform: translateX(5px);
        }

        .menu-item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }

        .menu-item-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }

        .menu-item-price {
            font-size: 1.3rem;
            font-weight: 700;
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
            padding: 5px 15px;
            border-radius: 20px;
        }

        .menu-item-description {
            color: #666;
            line-height: 1.5;
            margin-bottom: 15px;
        }

        .menu-item-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1000;
        }

        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
        }

        .modal-header h2 {
            color: #333;
            font-size: 1.6rem;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            padding: 5px;
        }

        .close-btn:hover {
            color: #333;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }

        .form-actions {
            display: flex;
            gap: 15px;
            justify-content: flex-end;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }

        .empty-state h3 {
            font-size: 1.5rem;
            margin-bottom: 15px;
            color: #999;
        }

        .nutrition-info {
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            padding: 15px;
            border-radius: 10px;
            margin-top: 15px;
        }

        .nutrition-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
            margin-top: 10px;
        }

        .nutrition-item {
            text-align: center;
            background: rgba(255, 255, 255, 0.7);
            padding: 8px;
            border-radius: 6px;
        }

        .nutrition-item strong {
            display: block;
            color: #e67e22;
            font-size: 1.1rem;
        }

        .nutrition-item span {
            color: #333;
            font-size: 0.9rem;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%);
            color: #2d5016;
            margin-left: 10px;
        }

        @media (max-width: 768px) {
            .controls {
                flex-direction: column;
            }

            .menu-item-header {
                flex-direction: column;
                gap: 10px;
            }

            .menu-item-actions {
                justify-content: flex-start;
            }

            .form-actions {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍽️ Restaurant Menu Manager</h1>
            <p>Manage your restaurant menus and menu items with ease</p>
            <span class="status-badge">✅ Connected to Database</span>
        </div>

        <div class="main-content">
            <div class="controls">
                <div class="dropdown-container">
                    <label for="restaurantSelect">Select Restaurant:</label>
                    <select id="restaurantSelect">
                        <option value="">Choose a restaurant...</option>
                    </select>
                </div>
                <button class="btn" onclick="loadRestaurants()">
                    🔄 Refresh
                </button>
                <button class="btn btn-secondary" onclick="openAddItemModal()">
                    ➕ Add Menu Item
                </button>
            </div>

            <div id="restaurantInfo" class="restaurant-info" style="display: none;">
                <h2 id="restaurantName"></h2>
                <div id="restaurantDetails" class="restaurant-details"></div>
            </div>

            <div id="menusSection" class="menus-section"></div>
        </div>
    </div>

    <!-- Modal for Add/Edit Menu Item -->
    <div id="itemModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Add Menu Item</h2>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <form id="itemForm">
                <div class="form-group">
                    <label for="itemName">Item Name:</label>
                    <input type="text" id="itemName" required>
                </div>
                <div class="form-group">
                    <label for="shortName">Short Name:</label>
                    <input type="text" id="shortName">
                </div>
                <div class="form-group">
                    <label for="itemDescription">Description:</label>
                    <textarea id="itemDescription" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="basePrice">Base Price ($):</label>
                    <input type="number" id="basePrice" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="portionSize">Portion Size:</label>
                    <input type="text" id="portionSize">
                </div>
                <div class="form-group">
                    <label for="mealType">Meal Type:</label>
                    <select id="mealType">
                        <option value="All Day">All Day</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn">💾 Save Item</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Global variables
        let restaurants = [];
        let selectedRestaurant = null;
        let editingItem = null;
        const API_BASE = '/api'; // Use relative URLs since we're serving from same server

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            loadRestaurants();
            setupEventListeners();
        });

        function setupEventListeners() {
            document.getElementById('restaurantSelect').addEventListener('change', handleRestaurantChange);
            document.getElementById('itemForm').addEventListener('submit', handleItemSubmit);
        }

        // Load restaurants from API
        async function loadRestaurants() {
            try {
                showLoading(true);
                const response = await fetch(\`\${API_BASE}/all-restaurant-menus\`);
                
                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }
                
                restaurants = await response.json();
                populateRestaurantDropdown();
                showLoading(false);
            } catch (error) {
                console.error('Error loading restaurants:', error);
                showError('Failed to load restaurants. Please check if the server is running.');
                showLoading(false);
            }
        }

        function populateRestaurantDropdown() {
            const select = document.getElementById('restaurantSelect');
            select.innerHTML = '<option value="">Choose a restaurant...</option>';
            
            restaurants.forEach((restaurant, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = restaurant.restaurant_name;
                select.appendChild(option);
            });
        }

        function handleRestaurantChange(event) {
            const selectedIndex = event.target.value;
            
            if (selectedIndex === '') {
                selectedRestaurant = null;
                hideRestaurantInfo();
                clearMenus();
                return;
            }

            selectedRestaurant = restaurants[selectedIndex];
            showRestaurantInfo();
            displayMenus();
        }

        function showRestaurantInfo() {
            const infoDiv = document.getElementById('restaurantInfo');
            const nameEl = document.getElementById('restaurantName');
            const detailsEl = document.getElementById('restaurantDetails');

            nameEl.textContent = selectedRestaurant.restaurant_name;
            
            detailsEl.innerHTML = \`
                <div class="detail-item">
                    <strong>Restaurant ID:</strong> \${selectedRestaurant.restaurant_id}
                </div>
                <div class="detail-item">
                    <strong>Total Menus:</strong> \${selectedRestaurant.menus.length}
                </div>
                <div class="detail-item">
                    <strong>Total Items:</strong> \${selectedRestaurant.menus.reduce((total, menu) => total + menu.items.length, 0)}
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong> \${selectedRestaurant.phone || 'Not available'}
                </div>
                <div class="detail-item">
                    <strong>Status:</strong> \${selectedRestaurant.status || 'Unknown'}
                </div>
            \`;

            infoDiv.style.display = 'block';
        }

        function hideRestaurantInfo() {
            document.getElementById('restaurantInfo').style.display = 'none';
        }

        function displayMenus() {
            const menusSection = document.getElementById('menusSection');
            
            if (!selectedRestaurant || selectedRestaurant.menus.length === 0) {
                menusSection.innerHTML = \`
                    <div class="empty-state">
                        <h3>No Menus Found</h3>
                        <p>This restaurant doesn't have any menus yet.</p>
                    </div>
                \`;
                return;
            }

            let menusHTML = '';
            selectedRestaurant.menus.forEach(menu => {
                menusHTML += \`
                    <div class="menu-card">
                        <div class="menu-header">
                            <h3>\${menu.menu_name}</h3>
                            <span>\${menu.items.length} items</span>
                        </div>
                        <div class="menu-items">
                            \${menu.items.length === 0 ? 
                                '<p style="text-align: center; color: #999; padding: 20px;">No items in this menu</p>' :
                                menu.items.map(item => createMenuItemHTML(item, menu)).join('')
                            }
                        </div>
                    </div>
                \`;
            });

            menusSection.innerHTML = menusHTML;
        }

        function createMenuItemHTML(item, menu) {
            return \`
                <div class="menu-item">
                    <div class="menu-item-header">
                        <div>
                            <div class="menu-item-title">\${item.item_name}</div>
                            <div class="menu-item-description">\${item.description || 'No description available'}</div>
                        </div>
                        <div class="menu-item-price">$\${parseFloat(item.base_price || 0).toFixed(2)}</div>
                    </div>
                    <div class="menu-item-actions">
                        <button class="btn btn-secondary" onclick="editMenuItem('\${item.menu_item_id}', '\${menu.menu_id}')">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteMenuItem('\${item.menu_item_id}')">
                            🗑️ Delete
                        </button>
                        <button class="btn" onclick="showNutritionInfo('\${item.menu_item_id}')">
                            📊 Nutrition
                        </button>
                    </div>
                </div>
            \`;
        }

        function clearMenus() {
            document.getElementById('menusSection').innerHTML = '';
        }

        // Modal functions
        function openAddItemModal() {
            if (!selectedRestaurant) {
                alert('Please select a restaurant first.');
                return;
            }

            editingItem = null;
            document.getElementById('modalTitle').textContent = 'Add Menu Item';
            document.getElementById('itemForm').reset();
            document.getElementById('itemModal').style.display = 'block';
        }

        function editMenuItem(itemId, menuId) {
            // Find the item in the current restaurant's menus
            let foundItem = null;
            let foundMenu = null;

            for (const menu of selectedRestaurant.menus) {
                const item = menu.items.find(i => i.menu_item_id === itemId);
                if (item) {
                    foundItem = item;
                    foundMenu = menu;
                    break;
                }
            }

            if (!foundItem) {
                alert('Item not found.');
                return;
            }

            editingItem = { ...foundItem, menu_id: menuId };
            
            document.getElementById('modalTitle').textContent = 'Edit Menu Item';
            document.getElementById('itemName').value = foundItem.item_name || '';
            document.getElementById('shortName').value = foundItem.short_name || '';
            document.getElementById('itemDescription').value = foundItem.description || '';
            document.getElementById('basePrice').value = foundItem.base_price || '';
            document.getElementById('portionSize').value = foundItem.portion_size || '';
            document.getElementById('mealType').value = foundItem.meal_type || 'All Day';
            
            document.getElementById('itemModal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('itemModal').style.display = 'none';
            editingItem = null;
        }

        function handleItemSubmit(event) {
            event.preventDefault();
            
            const formData = {
                display_name: document.getElementById('itemName').value,
                short_name: document.getElementById('shortName').value,
                item_description: document.getElementById('itemDescription').value,
                base_price: parseFloat(document.getElementById('basePrice').value),
                portion_size: document.getElementById('portionSize').value,
                meal_type: document.getElementById('mealType').value,
                restaurant_id: selectedRestaurant.restaurant_id
            };

            if (editingItem) {
                updateMenuItem(editingItem.menu_item_id, formData);
            } else {
                createMenuItem(formData);
            }
        }

        // API calls for menu item management
        async function createMenuItem(itemData) {
            try {
                const response = await fetch(\`\${API_BASE}/menu-items\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(itemData)
                });

                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }

                const result = await response.json();
                
                // Refresh the restaurant data to show the new item
                await loadRestaurants();
                
                // Reselect the same restaurant to update the display
                const restaurantSelect = document.getElementById('restaurantSelect');
                const currentIndex = restaurantSelect.value;
                if (currentIndex !== '') {
                    selectedRestaurant = restaurants[currentIndex];
                    displayMenus();
                }

                closeModal();
                showSuccess('Menu item added successfully!');
            } catch (error) {
                console.error('Error creating menu item:', error);
                showError('Failed to create menu item: ' + error.message);
            }
        }

        async function updateMenuItem(itemId, itemData) {
            try {
                const response = await fetch(\`\${API_BASE}/menu-items/\${itemId}\`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(itemData)
                });

                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }

                // Refresh the restaurant data to show the updated item
                await loadRestaurants();
                
                // Reselect the same restaurant to update the display
                const restaurantSelect = document.getElementById('restaurantSelect');
                const currentIndex = restaurantSelect.value;
                if (currentIndex !== '') {
                    selectedRestaurant = restaurants[currentIndex];
                    displayMenus();
                }

                closeModal();
                showSuccess('Menu item updated successfully!');
            } catch (error) {
                console.error('Error updating menu item:', error);
                showError('Failed to update menu item: ' + error.message);
            }
        }

        async function deleteMenuItem(itemId) {
            if (!confirm('Are you sure you want to delete this menu item?')) {
                return;
            }

            try {
                const response = await fetch(\`\${API_BASE}/menu-items/\${itemId}\`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }

                // Refresh the restaurant data to remove the deleted item
                await loadRestaurants();
                
                // Reselect the same restaurant to update the display
                const restaurantSelect = document.getElementById('restaurantSelect');
                const currentIndex = restaurantSelect.value;
                if (currentIndex !== '') {
                    selectedRestaurant = restaurants[currentIndex];
                    displayMenus();
                }

                showSuccess('Menu item deleted successfully!');
            } catch (error) {
                console.error('Error deleting menu item:', error);
                showError('Failed to delete menu item: ' + error.message);
            }
        }

        async function showNutritionInfo(itemId) {
            try {
                const response = await fetch(\`\${API_BASE}/menu-items/\${itemId}/nutrition\`);
                
                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }
                
                const nutrition = await response.json();
                displayNutritionModal(nutrition);
            } catch (error) {
                console.error('Error fetching nutrition info:', error);
                showError('Failed to load nutrition information: ' + error.message);
            }
        }

        function displayNutritionModal(nutrition) {
            const nutritionHTML = \`
                <div class="modal" id="nutritionModal" style="display: block;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Nutrition Information - \${nutrition.display_name}</h2>
                            <button class="close-btn" onclick="closeNutritionModal()">&times;</button>
                        </div>
                        <div class="nutrition-info">
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <strong>\${nutrition.calories || 0}</strong>
                                    <span>Calories</span>
                                </div>
                                <div class="nutrition-item">
                                    <strong>\${nutrition.protein_grams || 0}g</strong>
                                    <span>Protein</span>
                                </div>
                                <div class="nutrition-item">
                                    <strong>\${nutrition.fat_grams || 0}g</strong>
                                    <span>Fat</span>
                                </div>
                                <div class="nutrition-item">
                                    <strong>\${nutrition.carbohydrates_grams || 0}g</strong>
                                    <span>Carbs</span>
                                </div>
                                <div class="nutrition-item">
                                    <strong>\${nutrition.fiber_grams || 0}g</strong>
                                    <span>Fiber</span>
                                </div>
                                <div class="nutrition-item">
                                    <strong>\${nutrition.sodium_mg || 0}mg</strong>
                                    <span>Sodium</span>
                                </div>
                            </div>
                            \${nutrition.is_verified ? 
                                '<p style="margin-top: 15px; color: #27ae60; font-weight: 600;">✅ Verified Nutrition Data</p>' :
                                '<p style="margin-top: 15px; color: #f39c12; font-weight: 600;">⚠️ Nutrition data not verified</p>'
                            }
                        </div>
                    </div>
                </div>
            \`;
            
            document.body.insertAdjacentHTML('beforeend', nutritionHTML);
        }

        function closeNutritionModal() {
            const modal = document.getElementById('nutritionModal');
            if (modal) {
                modal.remove();
            }
        }

        // Utility functions
        function showLoading(show) {
            const select = document.getElementById('restaurantSelect');
            if (show) {
                select.disabled = true;
                select.innerHTML = '<option value="">Loading restaurants...</option>';
            } else {
                select.disabled = false;
            }
        }

        function showSuccess(message) {
            // Simple alert for now - you could implement a toast notification
            alert('✅ ' + message);
        }

        function showError(message) {
            // Simple alert for now - you could implement a toast notification
            alert('❌ ' + message);
        }

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            const modal = document.getElementById('itemModal');
            if (event.target === modal) {
                closeModal();
            }
        });
    </script>
</body>
</html>`);
});
*/

// API ENDPOINTS START HERE

// Endpoint 1: Retrieve all restaurant menus
app.get('/api/all-restaurant-menus', async (req, res) => {
  try {
    // Use raw SQL for complex join query
    const { data, error } = await supabase
      .from('restaurant')
      .select(`
        restaurant_id,
        name,
        description,
        phone,
        website,
        status,
        dining_status,
        menu (
          menu_id,
          menu_name,
          menu_item (
            menu_item_id,
            display_name,
            short_name,
            item_description,
            base_price,
            portion_size,
            meal_type,
            availability,
            is_customizable
          )
        )
      `)
      .eq('is_active', true) // Only active restaurants
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
      description: restaurant.description,
      phone: restaurant.phone,
      website: restaurant.website,
      status: restaurant.status,
      dining_status: restaurant.dining_status,
      menus: restaurant.menu.map(menu => ({
        menu_id: menu.menu_id,
        menu_name: menu.menu_name,
        items: menu.menu_item.filter(item => item.is_active !== false).map(item => ({
          menu_item_id: item.menu_item_id,
          item_name: item.display_name,
          short_name: item.short_name,
          description: item.item_description,
          base_price: item.base_price,
          portion_size: item.portion_size,
          meal_type: item.meal_type,
          availability: item.availability,
          is_customizable: item.is_customizable
        }))
      }))
    }));

    res.json(restaurants);
  } catch (err) {
    console.error('Error fetching restaurant menus:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Endpoint 2: Create a new menu item
app.post('/api/menu-items', async (req, res) => {
  try {
    const {
      display_name,
      short_name,
      item_description,
      base_price,
      portion_size,
      meal_type = 'All Day',
      menu_id,
      restaurant_id
    } = req.body;

    // Validate required fields
    if (!display_name || !base_price || (!menu_id && !restaurant_id)) {
      return res.status(400).json({ 
        error: 'Missing required fields: display_name, base_price, and either menu_id or restaurant_id' 
      });
    }

    let targetMenuId = menu_id;

    // If no menu_id provided, get the first active menu for the restaurant
    if (!targetMenuId && restaurant_id) {
      const { data: menuData, error: menuError } = await supabase
        .from('menu')
        .select('menu_id')
        .eq('restaurant_id', restaurant_id)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (menuError || !menuData) {
        return res.status(404).json({ error: 'No active menu found for this restaurant' });
      }

      targetMenuId = menuData.menu_id;
    }

    // Generate a unique menu item ID
    const menu_item_id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert the new menu item
    const { data, error } = await supabase
      .from('menu_item')
      .insert([{
        menu_item_id,
        display_name,
        short_name: short_name || display_name,
        item_description,
        base_price: parseFloat(base_price),
        portion_size,
        meal_type,
        menu_id: targetMenuId,
        item_type: 'Food', // Default type
        is_active: true,
        availability: 'Available'
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: 'Menu item created successfully',
      menu_item: data
    });

  } catch (err) {
    console.error('Error creating menu item:', err.message);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
});

// Endpoint 3: Update a menu item
app.put('/api/menu-items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const {
      display_name,
      short_name,
      item_description,
      base_price,
      portion_size,
      meal_type,
      availability = 'Available'
    } = req.body;

    // Validate that the item exists
    const { data: existingItem, error: checkError } = await supabase
      .from('menu_item')
      .select('menu_item_id')
      .eq('menu_item_id', itemId)
      .single();

    if (checkError || !existingItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Prepare update object with only provided fields
    const updateData = {};
    if (display_name !== undefined) updateData.display_name = display_name;
    if (short_name !== undefined) updateData.short_name = short_name;
    if (item_description !== undefined) updateData.item_description = item_description;
    if (base_price !== undefined) updateData.base_price = parseFloat(base_price);
    if (portion_size !== undefined) updateData.portion_size = portion_size;
    if (meal_type !== undefined) updateData.meal_type = meal_type;
    if (availability !== undefined) updateData.availability = availability;
    
    updateData.updated_at = new Date().toISOString();

    // Update the menu item
    const { data, error } = await supabase
      .from('menu_item')
      .update(updateData)
      .eq('menu_item_id', itemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      message: 'Menu item updated successfully',
      menu_item: data
    });

  } catch (err) {
    console.error('Error updating menu item:', err.message);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
});

// Endpoint 4: Delete a menu item
app.delete('/api/menu-items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    // Validate that the item exists
    const { data: existingItem, error: checkError } = await supabase
      .from('menu_item')
      .select('menu_item_id, display_name')
      .eq('menu_item_id', itemId)
      .single();

    if (checkError || !existingItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Instead of hard delete, we'll soft delete by setting is_active to false
    const { data, error } = await supabase
      .from('menu_item')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('menu_item_id', itemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      message: 'Menu item deleted successfully',
      deleted_item: {
        menu_item_id: itemId,
        display_name: existingItem.display_name
      }
    });

  } catch (err) {
    console.error('Error deleting menu item:', err.message);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
});

// Endpoint 5: Get nutrition information for a menu item
app.get('/api/menu-items/:itemId/nutrition', async (req, res) => {
  try {
    const { itemId } = req.params;

    // Get menu item with nutrition information
    const { data, error } = await supabase
      .from('menu_item')
      .select(`
        menu_item_id,
        display_name,
        nutrition (
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
      .eq('menu_item_id', itemId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // If no nutrition data exists, return default/empty nutrition info
    const nutritionInfo = data.nutrition || {
      calories: 0,
      protein_grams: 0,
      fat_grams: 0,
      saturated_fat_grams: 0,
      carbohydrates_grams: 0,
      sugar_grams: 0,
      fiber_grams: 0,
      sodium_mg: 0,
      cholesterol_mg: 0,
      is_verified: false
    };

    res.json({
      menu_item_id: data.menu_item_id,
      display_name: data.display_name,
      ...nutritionInfo
    });

  } catch (err) {
    console.error('Error fetching nutrition info:', err.message);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
});

// Endpoint 6: Retrieve menu items with "protein" custom option
app.get('/api/protein-custom-menu-items', async (req, res) => {
  try {
    // Find the "protein" custom option
    const { data: optionData, error: optionError } = await supabase
      .from('custom_option')
      .select('option_id')
      .ilike('name', '%protein%')
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

    // Process option values
    const optionValues = optionsData.map(option => ({
      value_id: option.value_id,
      value_name: option.value_name,
      protein_grams: option.nutrition?.protein_grams || 0,
      is_vegan: option.option_value_diet.some(ovd =>
        ovd.diet.diet_name.toLowerCase() === 'vegan'
      )
    }));

    // Sort: vegan first, then by protein content
    const vegans = optionValues
      .filter(ov => ov.is_vegan)
      .sort((a, b) => b.protein_grams - a.protein_grams);
    const nonVegans = optionValues
      .filter(ov => !ov.is_vegan)
      .sort((a, b) => b.protein_grams - a.protein_grams);
    const sortedOptions = vegans.length > 0 ? [vegans[0], ...nonVegans] : nonVegans;

    // Get menu items with protein customization
    const { data: customizationData } = await supabase
      .from('menu_item_customization')
      .select('menu_item_id')
      .eq('option_id', optionId);

    const menuItemIds = customizationData.map(item => item.menu_item_id);

    if (menuItemIds.length === 0) {
      return res.json([]);
    }

    const { data: itemsData, error: itemsError } = await supabase
      .from('menu_item')
      .select(`
        menu_item_id,
        display_name,
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
      .in('menu_item_id', menuItemIds);

    if (itemsError) {
      throw itemsError;
    }

    // Transform menu items data
    const menuItems = itemsData.map(item => ({
      menu_item_id: item.menu_item_id,
      display_name: item.display_name,
      short_name: item.short_name,
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

// Endpoint 7: Return protein options with portions
app.get('/api/protein-options-with-portions', async (req, res) => {
  try {
    const { data: proteinOption, error: proteinError } = await supabase
      .from('custom_option')
      .select('option_id')
      .ilike('name', '%protein%')
      .single();

    if (proteinError || !proteinOption) {
      return res.status(404).json({ error: 'Protein option not found' });
    }

    const optionId = proteinOption.option_id;

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

    const { data: portionsData, error: portionsError } = await supabase
      .from('custom_portion')
      .select(`
        portion_id,
        portion (
          portion_id,
          portion_type,
          nutrition_multiplier
        )
      `)
      .eq('option_id', optionId);

    if (portionsError) throw portionsError;

    const multipliers = {
      single: 1,
      half: 0.5,
      double: 2
    };

    const portions = portionsData.map(p => {
      const type = p.portion?.portion_type?.toLowerCase() || 'single';
      const multiplier = p.portion?.nutrition_multiplier || multipliers[type] || 1;
      
      return {
        portion_id: p.portion_id,
        portion_type: type,
        multiplier: multiplier
      };
    });

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

// Endpoint 8: Create a new restaurant
app.post('/api/restaurants', async (req, res) => {
  try {
    const {
      name,
      description,
      phone,
      website,
      is_chain = false,
      status = 'Open',
      dining_status = 'Both'
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Restaurant name is required' });
    }

    const restaurant_id = `rest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from('restaurant')
      .insert([{
        restaurant_id,
        name,
        description,
        phone,
        website,
        is_chain,
        status,
        dining_status,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: data
    });

  } catch (err) {
    console.error('Error creating restaurant:', err.message);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Restaurant Menu Manager running on http://localhost:${port}`);
  console.log('📋 Available endpoints:');
  console.log('  🌐 GET  / (Frontend Interface)');
  console.log('  📊 GET  /api/all-restaurant-menus');
  console.log('  ➕ POST /api/menu-items');
  console.log('  ✏️  PUT  /api/menu-items/:itemId');
  console.log('  🗑️  DELETE /api/menu-items/:itemId');
  console.log('  🍎 GET  /api/menu-items/:itemId/nutrition');
  console.log('  🥩 GET  /api/protein-custom-menu-items');
  console.log('  📏 GET  /api/protein-options-with-portions');
  console.log('  🏪 POST /api/restaurants');
  console.log('');
  console.log('✅ Frontend and API ready!');
});