/**
 * Yippee App - Main JavaScript
 * Implements UI/UX Guidelines
 * Schema Version: 12_2 aligned
 */

// Configuration
const CONFIG = {
    API_BASE: 'http://localhost:3000/api',
    MAX_VISIBLE_TAGS: 3,
    POSTS_PER_PAGE: 10,
};

// Helper to normalize restaurant data from API (handles both mock and Supabase formats)
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

// Global State
const state = {
    currentPage: 'map',
    restaurants: [],
    selectedRestaurant: null,
    selectedMenuItem: null,
    shoppingCart: [],
    userProfile: {
        name: 'Guest User',
        location: null,
        favorites: [],
        preferences: {
            dietary: [],
            notifications: {}
        }
    },
    filters: {
        dietary: [],
        nutritional: [],
        allergens: [],
        priceRange: 100
    },
    activeTags: [], // For clickable tag filtering
    socialPosts: [],
    postsLoaded: 0
};

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadUserProfile();
    loadRestaurants();
    setupEventListeners();
    generateMockSocialPosts();
});

function initializeApp() {
    console.log('🍽️ Yippee App Initialized');
    updateShoppingCartBadge();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            navigateToPage(page);
        });
    });
    
    // Global Search
    document.getElementById('globalSearch').addEventListener('input', debounce(handleGlobalSearch, 300));
    document.querySelector('.search-btn').addEventListener('click', handleSearchClick);
    
    // Filters
    document.getElementById('filterToggle').addEventListener('click', toggleFilters);
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);
    document.getElementById('priceRange').addEventListener('input', updatePriceRangeDisplay);
    
    // Filter checkboxes
    document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleFilterChange);
    });
    
    // Clear all filters button (tag filters)
    const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
    if (clearAllFiltersBtn) {
        clearAllFiltersBtn.addEventListener('click', clearAllTagFilters);
    }
    
    // Keyboard navigation for tags
    document.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('clickable-tag') && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            const tag = e.target.dataset.tag;
            if (tag) handleTagClick(tag);
        }
    });
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', handleViewToggle);
    });
    
    // Sort
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    // Load More Posts
    const loadMoreBtn = document.getElementById('loadMorePosts');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreSocialPosts);
    }
    
    // Modal close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Shopping List
    const shoppingListIcon = document.getElementById('shoppingListIcon');
    if (shoppingListIcon) {
        shoppingListIcon.addEventListener('click', openShoppingList);
    }
}

// ========================================
// Navigation
// ========================================

function navigateToPage(pageName) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.page === pageName) {
            tab.classList.add('active');
        }
    });
    
    // Update page content
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        state.currentPage = pageName;
        
        // Page-specific initialization
        if (pageName === 'restaurant-list') {
            renderRestaurantList();
        } else if (pageName === 'socials') {
            renderSocialTimeline();
        } else if (pageName === 'user') {
            renderUserProfile();
        } else if (pageName === 'map') {
            renderMapView();
        }
    }
}

// ========================================
// API Calls
// ========================================

async function loadRestaurants() {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/all-restaurant-menus`);
        if (response.ok) {
            const rawData = await response.json();
            // Normalize data to handle both mock and Supabase schema formats
            state.restaurants = rawData.map(normalizeRestaurant);
            renderRestaurantList();
            renderMapView();
            console.log(`✅ Loaded ${state.restaurants.length} restaurants`);
            console.log('📊 Sample restaurant:', state.restaurants[0]);
        }
    } catch (error) {
        console.error('Error loading restaurants:', error);
        showNotification('Failed to load restaurants', 'error');
    }
}

async function loadRestaurantDetails(restaurantId) {
    try {
        const restaurant = state.restaurants.find(r => r.restaurant_id === restaurantId);
        if (restaurant) {
            state.selectedRestaurant = restaurant;
            openRestaurantModal(restaurant);
        }
    } catch (error) {
        console.error('Error loading restaurant details:', error);
        showNotification('Failed to load restaurant details', 'error');
    }
}

async function loadMenuItemNutrition(menuItemId) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/menu-items/${menuItemId}/nutrition`);
        if (response.ok) {
            const data = await response.json();
            // Handle new schema format where nutrition is nested
            return data.nutrition || data;
        }
    } catch (error) {
        console.error('Error loading nutrition:', error);
        return null;
    }
}

// Load full menu item details using new endpoint
async function loadMenuItemDetails(menuItemId) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/menu-items/${menuItemId}`);
        if (response.ok) {
            const result = await response.json();
            return result.data || result;
        }
    } catch (error) {
        console.error('Error loading menu item details:', error);
        return null;
    }
}

// Load customization options for a menu item
async function loadMenuItemCustomizations(menuItemId) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/menu-items/${menuItemId}/customizations`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error loading customizations:', error);
        return [];
    }
}

// Configure menu item with selected options
async function configureMenuItem(menuItemId, optionValueIds) {
    try {
        const optionsParam = optionValueIds.join(',');
        const response = await fetch(`${CONFIG.API_BASE}/menu-items/${menuItemId}/configure?options=${optionsParam}`);
        if (response.ok) {
            const result = await response.json();
            return result.data || result;
        }
    } catch (error) {
        console.error('Error configuring menu item:', error);
        return null;
    }
}

// ========================================
// Search & Filters
// ========================================

function handleGlobalSearch(event) {
    const query = event.target.value.toLowerCase();
    
    if (query.length < 2) {
        renderRestaurantList();
        return;
    }
    
    // Also use the backend search endpoint for better results
    searchMenuItems(query);
    
    // Local filter as fallback
    const filtered = state.restaurants.filter(restaurant => {
        const nameMatch = restaurant.restaurant_name?.toLowerCase().includes(query);
        const menuMatch = restaurant.menus?.some(menu => 
            menu.items?.some(item => 
                item.item_name?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query)
            )
        );
        return nameMatch || menuMatch;
    });
    
    renderRestaurantList(filtered);
}

// Use backend search endpoint
async function searchMenuItems(query) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/menu-items/search?query=${encodeURIComponent(query)}`);
        if (response.ok) {
            const result = await response.json();
            console.log(`🔍 Search results: ${result.count} items found`);
        }
    } catch (error) {
        console.log('Backend search not available, using local filter');
    }
}

function handleSearchClick() {
    const query = document.getElementById('globalSearch').value;
    if (query) {
        showNotification(`Searching for: ${query}`, 'info');
    }
}

function toggleFilters() {
    const filterPanel = document.getElementById('filterPanel');
    const isVisible = filterPanel.style.display !== 'none';
    filterPanel.style.display = isVisible ? 'none' : 'block';
}

function handleFilterChange(event) {
    const filterType = event.target.value;
    const isChecked = event.target.checked;
    
    if (event.target.closest('.filter-section h3')?.textContent.includes('Dietary')) {
        if (isChecked) {
            state.filters.dietary.push(filterType);
        } else {
            state.filters.dietary = state.filters.dietary.filter(f => f !== filterType);
        }
    } else if (event.target.closest('.filter-section h3')?.textContent.includes('Nutritional')) {
        if (isChecked) {
            state.filters.nutritional.push(filterType);
        } else {
            state.filters.nutritional = state.filters.nutritional.filter(f => f !== filterType);
        }
    } else if (event.target.closest('.filter-section h3')?.textContent.includes('Allergens')) {
        if (isChecked) {
            state.filters.allergens.push(filterType);
        } else {
            state.filters.allergens = state.filters.allergens.filter(f => f !== filterType);
        }
    }
    
    // Show/hide clear button
    const hasFilters = state.filters.dietary.length > 0 || 
                       state.filters.nutritional.length > 0 || 
                       state.filters.allergens.length > 0;
    document.getElementById('clearFilters').style.display = hasFilters ? 'block' : 'none';
    
    applyFilters();
}

function clearAllFilters() {
    state.filters = {
        dietary: [],
        nutritional: [],
        allergens: [],
        priceRange: 100
    };
    
    // Uncheck all checkboxes
    document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Reset price range
    document.getElementById('priceRange').value = 100;
    updatePriceRangeDisplay();
    
    document.getElementById('clearFilters').style.display = 'none';
    applyFilters();
}

function applyFilters() {
    // Filter restaurants based on active filters
    let filtered = [...state.restaurants];
    
    // Apply dietary filters
    if (state.filters.dietary.length > 0) {
        filtered = filtered.filter(restaurant => {
            return restaurant.menus?.some(menu =>
                menu.items?.some(item =>
                    state.filters.dietary.some(diet => 
                        item.tags?.some(tag => tag.toLowerCase().includes(diet.toLowerCase()))
                    )
                )
            );
        });
    }
    
    renderRestaurantList(filtered);
}

function updatePriceRangeDisplay() {
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    priceValue.textContent = `$0 - $${priceRange.value}`;
    state.filters.priceRange = parseInt(priceRange.value);
}

// ========================================
// Restaurant List Rendering
// ========================================

function renderRestaurantList(restaurants = state.restaurants) {
    const grid = document.getElementById('restaurantGrid');
    if (!grid) return;
    
    if (restaurants.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No restaurants found</h3>
                <p>Try adjusting your filters or search query.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = restaurants.map(restaurant => createRestaurantCard(restaurant)).join('');
    
    // Add click listeners
    grid.querySelectorAll('.restaurant-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            loadRestaurantDetails(restaurants[index].restaurant_id);
        });
    });
}

function createRestaurantCard(restaurant) {
    const tags = extractRestaurantTags(restaurant);
    const rating = Math.random() * 2 + 3; // Mock rating
    const distance = (Math.random() * 5).toFixed(1); // Mock distance
    
    // Mock YouTube-style like/dislike counts
    const likes = Math.floor(Math.random() * 2000) + 100;
    const dislikes = Math.floor(Math.random() * 100) + 5;
    
    return `
        <div class="restaurant-card" data-id="${restaurant.restaurant_id}">
            <div class="restaurant-card-image">
                ${restaurant.image_url ? `<img src="${restaurant.image_url}" alt="${restaurant.restaurant_name}">` : ''}
            </div>
            <div class="restaurant-card-content">
                <div class="restaurant-card-header">
                    <h3 class="restaurant-card-title">${restaurant.restaurant_name}</h3>
                    <div class="restaurant-rating">
                        ⭐ ${rating.toFixed(1)}
                    </div>
                </div>
                <p class="restaurant-card-description">${restaurant.description || 'Great food and atmosphere'}</p>
                <div class="restaurant-card-meta">
                    <span>📍 ${distance} mi</span>
                    <span>💵 $$</span>
                    <span>🍽️ ${getTotalItems(restaurant)} items</span>
                </div>
                <!-- YouTube-style Like/Dislike Counts -->
                <div class="restaurant-card-engagement">
                    <button class="like-btn" data-restaurant-id="${restaurant.restaurant_id}" onclick="event.stopPropagation(); handleRestaurantLike('${restaurant.restaurant_id}', this)" title="Like">
                        <span class="like-icon">👍</span>
                        <span class="like-count">${formatCount(likes)}</span>
                    </button>
                    <button class="dislike-btn" data-restaurant-id="${restaurant.restaurant_id}" onclick="event.stopPropagation(); handleRestaurantDislike('${restaurant.restaurant_id}', this)" title="Dislike">
                        <span class="dislike-icon">👎</span>
                        <span class="dislike-count">${formatCount(dislikes)}</span>
                    </button>
                </div>
                <div class="restaurant-card-tags">
                    ${renderClickableTags(tags, 'restaurant')}
                </div>
            </div>
        </div>
    `;
}

// Format counts like YouTube (e.g., 1.2K)
function formatCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

// Handle restaurant like (YouTube-style toggle)
function handleRestaurantLike(restaurantId, btn) {
    const card = btn.closest('.restaurant-card');
    const dislikeBtn = card.querySelector('.dislike-btn');
    
    // Toggle like state
    const isActive = btn.classList.toggle('active');
    
    // If liking, remove dislike
    if (isActive && dislikeBtn.classList.contains('active')) {
        dislikeBtn.classList.remove('active');
    }
    
    showNotification(isActive ? 'Liked! 👍' : 'Like removed', 'success');
}

// Handle restaurant dislike (YouTube-style toggle)
function handleRestaurantDislike(restaurantId, btn) {
    const card = btn.closest('.restaurant-card');
    const likeBtn = card.querySelector('.like-btn');
    
    // Toggle dislike state
    const isActive = btn.classList.toggle('active');
    
    // If disliking, remove like
    if (isActive && likeBtn.classList.contains('active')) {
        likeBtn.classList.remove('active');
    }
    
    showNotification(isActive ? 'Disliked 👎' : 'Dislike removed', 'info');
}

function extractRestaurantTags(restaurant) {
    const tags = new Set();
    restaurant.menus?.forEach(menu => {
        menu.items?.forEach(item => {
            item.tags?.forEach(tag => tags.add(tag));
        });
    });
    return Array.from(tags).slice(0, 5); // Limit to 5 tags
}

function getTotalItems(restaurant) {
    return restaurant.menus?.reduce((total, menu) => total + (menu.items?.length || 0), 0) || 0;
}

function renderTags(tags, maxVisible = CONFIG.MAX_VISIBLE_TAGS) {
    if (!tags || tags.length === 0) return '';
    
    const visibleTags = tags.slice(0, maxVisible);
    const hiddenTags = tags.slice(maxVisible);
    
    let html = visibleTags.map(tag => `<span class="tag ${getTagClass(tag)}">${tag}</span>`).join('');
    
    if (hiddenTags.length > 0) {
        html += `
            <span class="tag tag-more" title="${hiddenTags.join(', ')}">
                +${hiddenTags.length}
                <div class="hidden-tags">
                    ${hiddenTags.map(tag => `<span class="tag ${getTagClass(tag)}">${tag}</span>`).join('')}
                </div>
            </span>
        `;
    }
    
    return html;
}

// Render clickable tags with filtering capability
function renderClickableTags(tags, tagType = 'global', maxVisible = CONFIG.MAX_VISIBLE_TAGS) {
    if (!tags || tags.length === 0) return '';
    
    const visibleTags = tags.slice(0, maxVisible);
    const hiddenTags = tags.slice(maxVisible);
    
    let html = visibleTags.map(tag => {
        const isActive = state.activeTags.includes(tag.toLowerCase());
        return `<span class="tag clickable-tag ${getTagClass(tag)} ${isActive ? 'tag-active' : ''}" 
                      data-tag="${tag}" 
                      data-tag-type="${tagType}"
                      onclick="event.stopPropagation(); handleTagClick('${tag}')"
                      tabindex="0"
                      role="button"
                      aria-pressed="${isActive}">${tag}${isActive ? ' ✕' : ''}</span>`;
    }).join('');
    
    if (hiddenTags.length > 0) {
        html += `
            <span class="tag tag-more" title="${hiddenTags.join(', ')}">
                +${hiddenTags.length}
                <div class="hidden-tags">
                    ${hiddenTags.map(tag => {
                        const isActive = state.activeTags.includes(tag.toLowerCase());
                        return `<span class="tag clickable-tag ${getTagClass(tag)} ${isActive ? 'tag-active' : ''}" 
                                      data-tag="${tag}" 
                                      onclick="event.stopPropagation(); handleTagClick('${tag}')"
                                      tabindex="0"
                                      role="button">${tag}${isActive ? ' ✕' : ''}</span>`;
                    }).join('')}
                </div>
            </span>
        `;
    }
    
    return html;
}

// Handle tag click for filtering
function handleTagClick(tag) {
    const tagLower = tag.toLowerCase();
    const index = state.activeTags.indexOf(tagLower);
    
    if (index > -1) {
        // Remove tag from active filters
        state.activeTags.splice(index, 1);
    } else {
        // Add tag to active filters (AND filtering - multiple tags)
        state.activeTags.push(tagLower);
    }
    
    // Update active filters display
    updateActiveFiltersDisplay();
    
    // Apply filtering
    applyTagFilters();
}

// Update the active filters pills display
function updateActiveFiltersDisplay() {
    const container = document.getElementById('activeFiltersContainer');
    const pillsContainer = document.getElementById('activeFilterPills');
    
    if (!container || !pillsContainer) return;
    
    if (state.activeTags.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    pillsContainer.innerHTML = state.activeTags.map(tag => `
        <span class="filter-pill ${getTagClass(tag)}" data-tag="${tag}">
            ${tag}
            <button class="remove-filter-btn" onclick="handleTagClick('${tag}')" aria-label="Remove ${tag} filter">✕</button>
        </span>
    `).join('');
}

// Apply tag-based filtering
function applyTagFilters() {
    if (state.activeTags.length === 0) {
        renderRestaurantList();
        return;
    }
    
    // AND filtering: restaurant must have ALL active tags
    const filtered = state.restaurants.filter(restaurant => {
        const restaurantTags = extractRestaurantTags(restaurant).map(t => t.toLowerCase());
        return state.activeTags.every(activeTag => 
            restaurantTags.some(rTag => rTag.includes(activeTag) || activeTag.includes(rTag))
        );
    });
    
    renderRestaurantList(filtered);
}

// Clear all active tag filters
function clearAllTagFilters() {
    state.activeTags = [];
    updateActiveFiltersDisplay();
    applyTagFilters();
}

function getTagClass(tag) {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('vegan')) return 'vegan';
    if (tagLower.includes('vegetarian')) return 'vegetarian';
    if (tagLower.includes('meat')) return 'meat-eater';
    if (tagLower.includes('protein')) return tagLower.includes('plant') ? 'plant-protein' : 'protein';
    if (tagLower.includes('gluten')) return 'gluten-free';
    if (tagLower.includes('dairy')) return 'dairy-free';
    if (tagLower.includes('high-protein')) return 'high-protein';
    if (tagLower.includes('low-carb')) return 'low-carb';
    if (tagLower.includes('fiber')) return 'high-fiber';
    return '';
}

function handleViewToggle(event) {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const view = event.target.dataset.view;
    const grid = document.getElementById('restaurantGrid');
    
    if (view === 'list') {
        grid.style.gridTemplateColumns = '1fr';
    } else {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
    }
}

function handleSortChange(event) {
    const sortBy = event.target.value;
    let sorted = [...state.restaurants];
    
    switch (sortBy) {
        case 'distance':
            // Mock sort - in real app, would use geolocation
            sorted.sort(() => Math.random() - 0.5);
            break;
        case 'rating':
            sorted.sort(() => Math.random() - 0.5);
            break;
        case 'price-low':
            sorted.sort(() => Math.random() - 0.5);
            break;
        case 'price-high':
            sorted.sort(() => Math.random() - 0.5);
            break;
    }
    
    renderRestaurantList(sorted);
}

// ========================================
// Map View
// ========================================

function renderMapView() {
    const mapRestaurantList = document.getElementById('mapRestaurantList');
    if (!mapRestaurantList) return;
    
    mapRestaurantList.innerHTML = state.restaurants.slice(0, 10).map(restaurant => `
        <div class="restaurant-quick-card" onclick="loadRestaurantDetails('${restaurant.restaurant_id}')">
            <h4>${restaurant.restaurant_name}</h4>
            <p>${(Math.random() * 5).toFixed(1)} mi away</p>
        </div>
    `).join('');
}

// ========================================
// Restaurant Modal
// ========================================

function openRestaurantModal(restaurant) {
    const modal = document.getElementById('restaurantModal');
    
    // Populate restaurant info
    document.getElementById('modalRestaurantName').textContent = restaurant.restaurant_name;
    document.getElementById('modalRestaurantDescription').textContent = restaurant.description || 'A great dining experience awaits you.';
    document.getElementById('modalRestaurantAddress').textContent = restaurant.address || '123 Main St, City, State';
    document.getElementById('modalRestaurantPhone').textContent = restaurant.phone || '(555) 123-4567';
    document.getElementById('modalRestaurantEmail').textContent = restaurant.email || 'contact@restaurant.com';
    
    // Render restaurant-specific tags
    renderModalRestaurantTags(restaurant);
    
    // Render location cards
    renderLocationCards(restaurant);
    
    // Render menu items
    renderMenuItems(restaurant);
    
    // Show modal
    modal.classList.add('active');
}

// Render restaurant-specific tags in modal
function renderModalRestaurantTags(restaurant) {
    const tagsContainer = document.getElementById('modalRestaurantTags');
    if (!tagsContainer) return;
    
    const tags = extractRestaurantTags(restaurant);
    
    if (tags.length === 0) {
        tagsContainer.innerHTML = '<p class="empty-state">No tags available</p>';
        return;
    }
    
    tagsContainer.innerHTML = tags.map(tag => {
        const isActive = state.activeTags.includes(tag.toLowerCase());
        return `<span class="tag clickable-tag ${getTagClass(tag)} ${isActive ? 'tag-active' : ''}" 
                      data-tag="${tag}"
                      onclick="handleTagClick('${tag}')"
                      tabindex="0"
                      role="button"
                      aria-pressed="${isActive}">${tag}${isActive ? ' ✕' : ''}</span>`;
    }).join('');
}

// Render location cards in restaurant modal
function renderLocationCards(restaurant) {
    const container = document.getElementById('locationCardsContainer');
    if (!container) return;
    
    // Get locations from restaurant data or generate mock ones
    const locations = restaurant.locations || [
        {
            location_id: 'loc_1',
            name: 'Main Location',
            address: restaurant.address || '123 Main St, City, State 12345',
            phone: restaurant.phone || '(555) 123-4567',
            hours: 'Mon-Sun: 11am - 10pm',
            is_primary: true
        },
        {
            location_id: 'loc_2',
            name: 'Downtown Branch',
            address: '456 Downtown Ave, City, State 12345',
            phone: '(555) 987-6543',
            hours: 'Mon-Sat: 10am - 11pm',
            is_primary: false
        }
    ];
    
    if (locations.length === 0) {
        container.innerHTML = '<p class="empty-state">No location information available</p>';
        return;
    }
    
    container.innerHTML = locations.map(location => `
        <div class="location-card ${location.is_primary ? 'primary-location' : ''}" 
             data-location-id="${location.location_id}"
             onclick="handleLocationCardClick('${location.location_id}')"
             tabindex="0"
             role="button">
            <div class="location-card-header">
                <h4 class="location-name">${location.name} ${location.is_primary ? '<span class="primary-badge">Primary</span>' : ''}</h4>
            </div>
            <div class="location-card-body">
                <p class="location-address">📍 ${location.address}</p>
                <p class="location-phone">📞 ${location.phone}</p>
                <p class="location-hours">🕐 ${location.hours}</p>
            </div>
            <div class="location-card-actions">
                <button class="btn-secondary btn-sm" onclick="event.stopPropagation(); openLocationOnMap('${location.location_id}')">
                    🗺️ View on Map
                </button>
                <button class="btn-secondary btn-sm" onclick="event.stopPropagation(); getDirections('${location.address}')">
                    🧭 Directions
                </button>
            </div>
        </div>
    `).join('');
}

// Handle location card click
function handleLocationCardClick(locationId) {
    // Scroll/zoom to location on map or open location modal
    const localMap = document.getElementById('localMap');
    if (localMap) {
        localMap.style.display = 'block';
        localMap.innerHTML = `<div class="map-placeholder-small">Showing location: ${locationId}</div>`;
    }
    showNotification('Focusing on selected location', 'info');
}

// Open location on map
function openLocationOnMap(locationId) {
    showNotification('Opening location on map...', 'info');
    // In real app, would scroll/zoom the embedded map to this location
}

// Get directions to location
function getDirections(address) {
    // Open Google Maps directions in new tab
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
}

function renderMenuItems(restaurant) {
    const menuItemsList = document.getElementById('menuItemsList');
    if (!menuItemsList) return;
    
    let allItems = [];
    restaurant.menus?.forEach(menu => {
        if (menu.items) {
            allItems = [...allItems, ...menu.items.map(item => ({ ...item, menuName: menu.menu_name }))];
        }
    });
    
    if (allItems.length === 0) {
        menuItemsList.innerHTML = '<p class="empty-state">No menu items available</p>';
        return;
    }
    
    menuItemsList.innerHTML = allItems.map(item => createMenuItemCard(item)).join('');
    
    // Add event listeners
    setupMenuItemListeners();
}

function createMenuItemCard(item) {
    const tags = item.tags || [];
    const isCustomizable = tags.some(tag => tag.toLowerCase().includes('customizable') || tag.toLowerCase().includes('build'));
    
    return `
        <div class="menu-item-card" data-id="${item.menu_item_id}">
            <div class="menu-item-main">
                <div class="menu-item-image">
                    ${item.image_url ? `<img src="${item.image_url}" alt="${item.item_name}">` : ''}
                </div>
                <div class="menu-item-info">
                    <div class="menu-item-header">
                        <div>
                            <h4 class="menu-item-title">${item.item_name}</h4>
                            <p class="menu-item-description">${item.description || item.short_description || 'Delicious menu item'}</p>
                        </div>
                        <span class="menu-item-price">$${parseFloat(item.base_price || 0).toFixed(2)}</span>
                    </div>
                    <div class="menu-item-tags">
                        ${renderTags(tags)}
                    </div>
                    <div class="menu-item-actions">
                        <button class="btn-primary show-nutrition" data-id="${item.menu_item_id}">
                            📊 Show Nutrition
                        </button>
                        ${isCustomizable ? `
                            <button class="btn-primary make-it" data-id="${item.menu_item_id}">
                                🎯 Make It
                            </button>
                        ` : ''}
                        <button class="btn-secondary translate" data-id="${item.menu_item_id}">
                            🌍 Translate
                        </button>
                        <button class="btn-icon like-item" data-id="${item.menu_item_id}" title="Like">
                            ❤️
                        </button>
                        <button class="btn-icon bookmark-item" data-id="${item.menu_item_id}" title="Bookmark">
                            🔖
                        </button>
                        <button class="btn-icon add-to-cart" data-id="${item.menu_item_id}" title="Add to Cart">
                            🛒
                        </button>
                        <button class="btn-icon expand-item" data-id="${item.menu_item_id}" title="Expand">
                            ➕
                        </button>
                    </div>
                </div>
            </div>
            <div class="menu-item-expanded" id="expanded-${item.menu_item_id}">
                <!-- Expanded content loaded dynamically -->
            </div>
        </div>
    `;
}

function setupMenuItemListeners() {
    // Show Nutrition
    document.querySelectorAll('.show-nutrition').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNutritionModal(btn.dataset.id);
        });
    });
    
    // Make It
    document.querySelectorAll('.make-it').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showMakeItModal(btn.dataset.id);
        });
    });
    
    // Translate
    document.querySelectorAll('.translate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showTranslateModal(btn.dataset.id);
        });
    });
    
    // Like
    document.querySelectorAll('.like-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleLike(btn.dataset.id);
        });
    });
    
    // Bookmark
    document.querySelectorAll('.bookmark-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleBookmark(btn.dataset.id);
        });
    });
    
    // Add to Cart
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToShoppingCart(btn.dataset.id);
        });
    });
    
    // Expand
    document.querySelectorAll('.expand-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleExpandedItem(btn.dataset.id);
        });
    });
}

function toggleExpandedItem(itemId) {
    const expandedSection = document.getElementById(`expanded-${itemId}`);
    const isActive = expandedSection.classList.contains('active');
    
    if (isActive) {
        expandedSection.classList.remove('active');
        expandedSection.innerHTML = '';
    } else {
        expandedSection.classList.add('active');
        expandedSection.innerHTML = `
            <div class="expanded-content">
                <div class="expanded-images">
                    <img src="https://via.placeholder.com/200x90" alt="Item image 1">
                    <img src="https://via.placeholder.com/200x90" alt="Item image 2">
                </div>
                <div class="expanded-details">
                    <h4>Long Description</h4>
                    <p>This is a more detailed description of the menu item, including preparation methods, flavor profiles, and recommended pairings.</p>
                    
                    <div class="ingredients-list">
                        <h4>Ingredients</h4>
                        <ul>
                            <li>Fresh tomatoes</li>
                            <li>Organic lettuce</li>
                            <li>Premium cheese</li>
                            <li>Artisan bread</li>
                            <li>Secret sauce</li>
                        </ul>
                    </div>
                    
                    <div class="nutrition-display">
                        <h4>Nutrition Facts</h4>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <strong>450</strong>
                                <span>Calories</span>
                            </div>
                            <div class="nutrition-item">
                                <strong>25g</strong>
                                <span>Protein</span>
                            </div>
                            <div class="nutrition-item">
                                <strong>15g</strong>
                                <span>Fat</span>
                            </div>
                            <div class="nutrition-item">
                                <strong>40g</strong>
                                <span>Carbs</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="comments-section">
                <h4>Comments</h4>
                <div class="comment">
                    <div class="comment-header">
                        <span><strong>John D.</strong></span>
                        <span>2 days ago</span>
                    </div>
                    <p>Absolutely delicious! The flavors are incredible.</p>
                </div>
                <div class="comment">
                    <div class="comment-header">
                        <span><strong>Sarah M.</strong></span>
                        <span>1 week ago</span>
                    </div>
                    <p>Perfect portion size and very fresh ingredients.</p>
                </div>
            </div>
        `;
    }
}

// ========================================
// Modals
// ========================================

async function showNutritionModal(itemId) {
    const modal = document.getElementById('nutritionModal');
    const ingredientsList = document.getElementById('ingredientsList');
    const nutritionStats = document.getElementById('nutritionStats');
    
    // Show loading state
    ingredientsList.innerHTML = '<p>Loading ingredients...</p>';
    nutritionStats.innerHTML = '<p>Loading nutrition data...</p>';
    modal.classList.add('active');
    
    try {
        // Fetch real nutrition data from API
        const response = await fetch(`${CONFIG.API_BASE}/menu-items/${itemId}/nutrition`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        const nutrition = data.nutrition || data;
        const ingredients = data.ingredients || [];
        const allergens = data.allergens || [];
        
        // Render ingredients
        if (ingredients.length > 0) {
            ingredientsList.innerHTML = ingredients.map(ing => {
                const name = typeof ing === 'string' ? ing : ing.name;
                const isOptional = ing.is_optional || false;
                return `
                    <label class="ingredient-item">
                        <input type="checkbox" checked onchange="updateNutrition()" data-ingredient="${name}">
                        ${name}${isOptional ? ' (optional)' : ''}
                        ${ing.is_vegan ? ' 🌱' : ''}
                        ${ing.is_gluten_free ? ' 🌾✓' : ''}
                    </label>
                `;
            }).join('');
        } else {
            ingredientsList.innerHTML = '<p class="empty-state">No ingredient data available</p>';
        }
        
        // Render nutrition stats
        if (nutrition) {
            nutritionStats.innerHTML = `
                <div class="nutrition-grid">
                    <div class="nutrition-item">
                        <strong>${nutrition.calories || 0}</strong>
                        <span>Calories</span>
                    </div>
                    <div class="nutrition-item">
                        <strong>${nutrition.protein_grams || 0}g</strong>
                        <span>Protein</span>
                    </div>
                    <div class="nutrition-item">
                        <strong>${nutrition.fat_grams || 0}g</strong>
                        <span>Fat</span>
                    </div>
                    <div class="nutrition-item">
                        <strong>${nutrition.carbohydrates_grams || 0}g</strong>
                        <span>Carbs</span>
                    </div>
                    <div class="nutrition-item">
                        <strong>${nutrition.fiber_grams || 0}g</strong>
                        <span>Fiber</span>
                    </div>
                    <div class="nutrition-item">
                        <strong>${nutrition.sodium_mg || 0}mg</strong>
                        <span>Sodium</span>
                    </div>
                </div>
                ${allergens.length > 0 ? `
                    <div class="allergens-warning" style="margin-top: 1rem; padding: 0.5rem; background: #fff3cd; border-radius: 8px;">
                        <strong>⚠️ Allergens:</strong> ${allergens.map(a => a.name || a).join(', ')}
                    </div>
                ` : ''}
                ${data.diets && data.diets.length > 0 ? `
                    <div class="diets-info" style="margin-top: 0.5rem;">
                        <strong>Suitable for:</strong> ${data.diets.join(', ')}
                    </div>
                ` : ''}
            `;
        } else {
            nutritionStats.innerHTML = '<p class="empty-state">No nutrition data available</p>';
        }
    } catch (error) {
        console.error('Error loading nutrition:', error);
        // Fallback to mock data
        ingredientsList.innerHTML = `
            <label class="ingredient-item"><input type="checkbox" checked> Ingredient 1</label>
            <label class="ingredient-item"><input type="checkbox" checked> Ingredient 2</label>
        `;
        nutritionStats.innerHTML = '<p class="empty-state">Could not load nutrition data</p>';
    }
}

async function showMakeItModal(itemId) {
    const modal = document.getElementById('makeItModal');
    const autoSelectedOptions = document.getElementById('autoSelectedOptions');
    
    // Show loading state
    autoSelectedOptions.innerHTML = '<p>Loading customization options...</p>';
    modal.classList.add('active');
    
    // Store current item ID for later use
    modal.dataset.itemId = itemId;
    
    try {
        // Fetch customization options from API
        const response = await fetch(`${CONFIG.API_BASE}/menu-items/${itemId}/customizations`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const customizations = await response.json();
        
        if (customizations.length === 0) {
            autoSelectedOptions.innerHTML = '<p class="empty-state">No customization options available for this item</p>';
            return;
        }
        
        // Render customization options
        autoSelectedOptions.innerHTML = customizations.map(customization => {
            const option = customization.custom_option || customization;
            const values = option.option_values || [];
            
            return `
                <div class="customization-group" data-option-id="${option.option_id}">
                    <h4>${option.name}${customization.is_required ? ' *' : ''}</h4>
                    <p class="option-description">${option.option_description || ''}</p>
                    <div class="option-values-grid">
                        ${values.map(value => `
                            <div class="option-value-card" 
                                 data-value-id="${value.value_id}"
                                 onclick="toggleOptionValue(this)">
                                <div class="option-value-header">
                                    <div class="option-value-image"></div>
                                    <div class="option-value-info">
                                        <div class="option-value-name">${value.value_name}</div>
                                        <div class="option-value-tags">
                                            ${(value.diets || []).map(d => `<span class="tag">${d}</span>`).join('')}
                                        </div>
                                        <div class="option-value-nutrition">
                                            ${value.nutrition ? `
                                                <span>${value.nutrition.protein_grams || 0}g protein</span>
                                                <span>${value.nutrition.calories || 0} cal</span>
                                            ` : ''}
                                            ${value.price ? `<span>+$${value.price.toFixed(2)}</span>` : ''}
                                        </div>
                                        ${(value.allergens || []).length > 0 ? `
                                            <div class="option-allergens">⚠️ ${value.allergens.join(', ')}</div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading customizations:', error);
        autoSelectedOptions.innerHTML = `
            <div class="option-values-grid">
                <div class="option-value-card selected">
                    <div class="option-value-header">
                        <div class="option-value-image"></div>
                        <div class="option-value-info">
                            <div class="option-value-name">Default Option</div>
                            <div class="option-value-nutrition">
                                <span>Customization data unavailable</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Toggle option value selection
function toggleOptionValue(element) {
    element.classList.toggle('selected');
    updateConfigurationPreview();
}

// Update configuration preview with selected options
async function updateConfigurationPreview() {
    const modal = document.getElementById('makeItModal');
    const itemId = modal.dataset.itemId;
    
    // Get all selected option value IDs
    const selectedValues = Array.from(document.querySelectorAll('.option-value-card.selected'))
        .map(el => el.dataset.valueId)
        .filter(Boolean);
    
    if (selectedValues.length === 0) return;
    
    try {
        const configured = await configureMenuItem(itemId, selectedValues);
        if (configured) {
            console.log('📊 Configured item:', configured);
            // Could update a preview section here
        }
    } catch (error) {
        console.error('Error updating configuration:', error);
    }
}

function showTranslateModal(itemId) {
    const modal = document.getElementById('translateModal');
    const translationOutput = document.getElementById('translationOutput');
    
    translationOutput.innerHTML = `
        <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-md); margin-top: 1rem;">
            <p><strong>English:</strong> I would like to order the Veggie Burger with no onions, please.</p>
            <p style="margin-top: 1rem;"><strong>Spanish:</strong> Me gustaría pedir la Hamburguesa Vegetariana sin cebollas, por favor.</p>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// ========================================
// Shopping Cart
// ========================================

function addToShoppingCart(itemId) {
    // Find the item
    let foundItem = null;
    state.restaurants.forEach(restaurant => {
        restaurant.menus?.forEach(menu => {
            const item = menu.items?.find(i => i.menu_item_id === itemId);
            if (item) {
                foundItem = {
                    ...item,
                    restaurantId: restaurant.restaurant_id,
                    restaurantName: restaurant.restaurant_name
                };
            }
        });
    });
    
    if (foundItem) {
        state.shoppingCart.push(foundItem);
        updateShoppingCartBadge();
        showNotification(`Added ${foundItem.item_name} to cart`, 'success');
    }
}

function updateShoppingCartBadge() {
    const badge = document.getElementById('cartCount');
    const icon = document.getElementById('shoppingListIcon');
    
    if (state.shoppingCart.length > 0) {
        badge.textContent = state.shoppingCart.length;
        icon.style.display = 'block';
    } else {
        icon.style.display = 'none';
    }
}

function openShoppingList() {
    const modal = document.getElementById('shoppingListModal');
    const content = document.getElementById('shoppingListContent');
    
    if (state.shoppingCart.length === 0) {
        content.innerHTML = '<p class="empty-state">Your shopping list is empty</p>';
    } else {
        // Group by restaurant
        const grouped = {};
        state.shoppingCart.forEach(item => {
            if (!grouped[item.restaurantId]) {
                grouped[item.restaurantId] = {
                    name: item.restaurantName,
                    items: []
                };
            }
            grouped[item.restaurantId].items.push(item);
        });
        
        content.innerHTML = Object.values(grouped).map(restaurant => {
            const total = restaurant.items.reduce((sum, item) => sum + parseFloat(item.base_price || 0), 0);
            return `
                <div class="restaurant-order-group">
                    <div class="restaurant-order-header">
                        <h3>${restaurant.name}</h3>
                        <span>${restaurant.items.length} items</span>
                    </div>
                    <div class="order-items">
                        ${restaurant.items.map(item => `
                            <div class="order-item">
                                <span>${item.item_name}</span>
                                <span>$${parseFloat(item.base_price).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-total">
                        Total: $${total.toFixed(2)} (before tax)
                    </div>
                </div>
            `;
        }).join('');
    }
    
    modal.classList.add('active');
}

function clearShoppingList() {
    if (confirm('Clear all items from shopping list?')) {
        state.shoppingCart = [];
        updateShoppingCartBadge();
        closeModal('shoppingListModal');
        showNotification('Shopping list cleared', 'info');
    }
}

function exportShoppingList() {
    const data = JSON.stringify(state.shoppingCart, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yippee-shopping-list.json';
    a.click();
    showNotification('Shopping list exported', 'success');
}

// ========================================
// User Interactions
// ========================================

function handleLike(itemId) {
    showNotification('Item liked! ❤️', 'success');
}

function handleBookmark(itemId) {
    showNotification('Item bookmarked! 🔖', 'success');
}

// ========================================
// Social Features
// ========================================

function generateMockSocialPosts() {
    const mockPosts = [
        {
            id: 1,
            author: 'Sarah Chen',
            avatar: 'SC',
            time: '2 hours ago',
            content: 'Just tried the new vegan burger at Green Garden! 🌱 Absolutely amazing! The texture is perfect and it\'s packed with protein. Highly recommend!',
            likes: 24,
            reposts: 5,
            tags: ['vegan', 'high-protein']
        },
        {
            id: 2,
            author: 'Mike Rodriguez',
            avatar: 'MR',
            time: '5 hours ago',
            content: 'Found the perfect meal prep spot! Macro Bowl at Fit Eats has customizable bowls with exact macros listed. Game changer for my fitness goals! 💪',
            likes: 18,
            reposts: 3,
            tags: ['high-protein', 'meal-prep']
        },
        {
            id: 3,
            author: 'Emily Watson',
            avatar: 'EW',
            time: '1 day ago',
            content: 'Best gluten-free pizza I\'ve ever had at Italiano\'s! They take cross-contamination seriously and the crust is incredible. 🍕',
            likes: 31,
            reposts: 8,
            tags: ['gluten-free', 'italian']
        },
    ];
    
    state.socialPosts = mockPosts;
    state.postsLoaded = mockPosts.length;
}

function renderSocialTimeline() {
    const timeline = document.getElementById('socialTimeline');
    if (!timeline) return;
    
    timeline.innerHTML = state.socialPosts.map(post => createPostCard(post)).join('');
}

function createPostCard(post) {
    return `
        <div class="post-card">
            <div class="post-header">
                <div class="post-author">
                    <div class="author-avatar">${post.avatar}</div>
                    <div class="author-info">
                        <div class="author-name">${post.author}</div>
                        <div class="post-time">${post.time}</div>
                    </div>
                </div>
                <button class="btn-icon">⋯</button>
            </div>
            <div class="post-content">
                ${post.content}
            </div>
            ${post.tags ? `
                <div class="menu-item-tags">
                    ${post.tags.map(tag => `<span class="tag ${getTagClass(tag)}">${tag}</span>`).join('')}
                </div>
            ` : ''}
            <div class="post-actions">
                <button class="post-action-btn">❤️ ${post.likes} Likes</button>
                <button class="post-action-btn">🔁 ${post.reposts} Reposts</button>
                <button class="post-action-btn">💬 Comment</button>
                <button class="post-action-btn">🔖 Save</button>
            </div>
        </div>
    `;
}

function loadMoreSocialPosts() {
    // Mock loading more posts
    showNotification('Loading more posts...', 'info');
    setTimeout(() => {
        showNotification('No more posts to load', 'info');
    }, 1000);
}

// ========================================
// User Profile
// ========================================

function loadUserProfile() {
    const savedProfile = localStorage.getItem('yippeeUserProfile');
    if (savedProfile) {
        state.userProfile = JSON.parse(savedProfile);
    }
}

function renderUserProfile() {
    document.getElementById('userName').textContent = state.userProfile.name;
    document.getElementById('userLocation').textContent = state.userProfile.location || '📍 Location not set';
    
    // Render favorites
    const favoritesList = document.getElementById('favoritesList');
    if (state.userProfile.favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-state">No favorites yet. Start exploring!</p>';
    } else {
        favoritesList.innerHTML = state.userProfile.favorites.map(fav => `
            <div class="favorite-item">${fav.name}</div>
        `).join('');
    }
}

function editProfile() {
    const name = prompt('Enter your name:', state.userProfile.name);
    if (name) {
        state.userProfile.name = name;
        saveUserProfile();
        renderUserProfile();
    }
}

function savePreferences() {
    const defaultDiet = Array.from(document.getElementById('defaultDiet').selectedOptions).map(opt => opt.value);
    
    state.userProfile.preferences = {
        dietary: defaultDiet,
        notifications: {
            proximity: document.getElementById('notifProximity').checked,
            favorites: document.getElementById('notifFavorites').checked,
            price: document.getElementById('notifPrice').checked,
            reduced: document.getElementById('notifReduced').checked
        }
    };
    
    saveUserProfile();
    showNotification('Preferences saved!', 'success');
}

function saveUserProfile() {
    localStorage.setItem('yippeeUserProfile', JSON.stringify(state.userProfile));
}

// ========================================
// Modal Actions
// ========================================

function toggleLocalMap() {
    const map = document.getElementById('localMap');
    map.style.display = map.style.display === 'none' ? 'block' : 'none';
}

function copyText(type) {
    let text = '';
    if (type === 'phone') {
        text = document.getElementById('modalRestaurantPhone').textContent;
    } else if (type === 'email') {
        text = document.getElementById('modalRestaurantEmail').textContent;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification(`${type} copied to clipboard!`, 'success');
    });
}

function collapseDisclaimer(btn) {
    btn.closest('.disclaimer').classList.toggle('collapsed');
}

function toggleMenuFilters() {
    const filters = document.getElementById('menuFilters');
    filters.style.display = filters.style.display === 'none' ? 'block' : 'none';
}

function updateNutrition() {
    // Mock update - in real app would recalculate via API
    showNotification('Nutrition updated', 'info');
}

function generateItemImage() {
    const modal = document.getElementById('imageGenModal');
    const container = document.getElementById('generatedImageContainer');
    
    container.innerHTML = '<div class="loading-spinner"></div>';
    modal.classList.add('active');
    
    // Mock image generation
    setTimeout(() => {
        container.innerHTML = '<img src="https://via.placeholder.com/500x400" alt="Generated food image" style="width: 100%; border-radius: 10px;">';
    }, 2000);
}

function downloadImage() {
    showNotification('Image download started', 'success');
}

function saveCustomization() {
    showNotification('Configuration saved!', 'success');
    closeModal('nutritionModal');
}

function undoMakeIt() {
    showNotification('Changes reverted', 'info');
}

function applyMakeIt() {
    showNotification('Customization applied!', 'success');
    closeModal('makeItModal');
}

function copyTranslation() {
    const text = document.getElementById('translationOutput').textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Translation copied!', 'success');
    });
}

// ========================================
// Upload/Admin Functions
// ========================================

function processUpload() {
    showNotification('Processing with AI...', 'info');
    setTimeout(() => {
        document.getElementById('uploadPreview').style.display = 'block';
        document.getElementById('previewContent').innerHTML = `
            <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-md);">
                <h4>Parsed Data:</h4>
                <pre style="overflow-x: auto;">
{
  "restaurant_name": "Sample Restaurant",
  "cuisine": "American",
  "menu_items": [
    {
      "name": "Burger",
      "price": 12.99,
      "tags": ["meat-eater", "high-protein"]
    }
  ]
}
                </pre>
            </div>
        `;
        showNotification('AI analysis complete!', 'success');
    }, 2000);
}

function manualEntry() {
    document.getElementById('uploadPreview').style.display = 'block';
    document.getElementById('previewContent').innerHTML = `
        <form style="display: flex; flex-direction: column; gap: 1rem;">
            <input type="text" placeholder="Restaurant Name" style="padding: 0.5rem;">
            <input type="text" placeholder="Cuisine Type" style="padding: 0.5rem;">
            <textarea placeholder="Description" rows="3" style="padding: 0.5rem;"></textarea>
        </form>
    `;
}

function submitToDatabase() {
    showNotification('Submitting to database...', 'info');
    setTimeout(() => {
        showNotification('Data submitted successfully!', 'success');
        document.getElementById('uploadPreview').style.display = 'none';
    }, 1500);
}

// ========================================
// Utility Functions
// ========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    // Simple console log for now - could be replaced with toast notifications
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Could implement toast notification here
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    alert(`${emoji} ${message}`);
}

// ========================================
// Export for use in HTML
// ========================================

window.yippeeApp = {
    openShoppingList,
    closeModal,
    toggleLocalMap,
    copyText,
    collapseDisclaimer,
    toggleMenuFilters,
    updateNutrition,
    generateItemImage,
    downloadImage,
    saveCustomization,
    undoMakeIt,
    applyMakeIt,
    copyTranslation,
    processUpload,
    manualEntry,
    submitToDatabase,
    editProfile,
    savePreferences,
    exportShoppingList,
    clearShoppingList,
    // New API functions
    loadMenuItemDetails,
    loadMenuItemCustomizations,
    configureMenuItem,
    toggleOptionValue,
    updateConfigurationPreview,
    // Tag filtering functions
    handleTagClick,
    clearAllTagFilters,
    // Like/Dislike functions
    handleRestaurantLike,
    handleRestaurantDislike,
    // Location functions
    handleLocationCardClick,
    openLocationOnMap,
    getDirections
};

console.log('✅ Yippee App JavaScript Loaded');

