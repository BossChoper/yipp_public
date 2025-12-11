### Global / Cross-Page Requirements
1. All tags (global tags and restaurant-specific tags) must be clickable.
2. Clicking any tag must instantly filter the current list to show only items/restaurants that share that exact tag.
3. Tags must visually indicate active filter state (e.g., highlighted, pill with remove "x").
4. Multiple tags can be active simultaneously (AND filtering).
5. Clear all active tag filters with a single "Clear filters" button or by clicking active tags again.

### Restaurant Card
1. Tags on restaurant cards must be restaurant-specific tags only (not global tags).
2. Display separate like/dislike counts for YouTube videos instead of a single combined score.
   - Show two distinct buttons/icons: Likes ↑ and Dislikes ↓
   - Show exact counts next to each (e.g., "1.2K ↑ 89 ↓")
   - Users can only like OR dislike (not both) — toggling one removes the other.
3. Remove previous combined Reddit/Twitter score display.

### Restaurant Modal
1. Location cards (individual location entries) must appear below the main restaurant tag area in the modal.
2. Clicking a location card should either:
   - Scroll/zoom the embedded map to that location, or
   - Open respective restaurant_location modal
3. Keep the "Nutrition Modal" as a separate modal triggered from menu items.

### Menu Item → Nutrition Modal
1. Move the verification disclaimer ("Nutrition info is user-submitted and may not be accurate") to the very top of the Nutrition modal (above the nutrient table).
2. Make the disclaimer more prominent (bold, colored background, or bordered alert style).
3. Remove sticky element on menu search bar

### Search & Filtering Experience
1. Add visual feedback when filters are active (e.g., filtered tag pills above the restaurant grid).
2. Persist active tag filters when navigating between restaurant list and individual restaurant modal (and back).

### Accessibility & Polish
1. All clickable tags must have proper hover/focus states and be keyboard-navigable.
2. Ensure like/dislike buttons have clear active states and tooltips on hover.
3. Add loading states/skeletons when filtering large lists.

### Technical / Design Consistency
1. Use consistent tag styling across global tags, restaurant tags, and active filter pills.
2. Standardize modal header/footer layout between Restaurant Modal and Nutrition Modal.
3. Use YouTube’s official like/dislike icon set (thumbs up/down) for authenticity.

### Priority Order (Recommended for Next Iteration)
**Must-Have (MVP for Iteration 2):**
- Clickable tags with filtering (global + restaurant-specific)
- Separate YouTube likes/dislikes with toggle behavior
- Location cards in Restaurant Modal
- Nutrition disclaimer moved to top of Nutrition modal

**Should-Have:**
- Active filter pills + "Clear all" button
- Filter persistence across views
- Visual feedback and loading states

**Nice-to-Have:**
- Map integration with location card click
- Keyboard navigation for tags
