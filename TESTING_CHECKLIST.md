# End-to-End Testing Checklist

This document provides a comprehensive checklist for manually testing all user flows and requirements of the Ingredients-to-Recipe application.

## Prerequisites
- Backend server running on http://localhost:8000
- Frontend server running on http://localhost:3000
- PostgreSQL database running with seeded data
- Clean browser session (clear cookies/cache)

## Test Flow 1: Ingredient Input → Recipe Search → Recipe Detail → Add to Favorites

**Requirements Tested**: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 6.1, 6.2, 6.3, 6.4

### Steps:
1. **Register a new user**
   - [ ] Navigate to http://localhost:3000
   - [ ] Click "Register" or navigate to registration page
   - [ ] Enter email: `testuser@example.com`
   - [ ] Enter password: `TestPass123!`
   - [ ] Click "Register" button
   - [ ] Verify successful registration and redirect to login or home

2. **Login**
   - [ ] If not automatically logged in, navigate to login page
   - [ ] Enter email: `testuser@example.com`
   - [ ] Enter password: `TestPass123!`
   - [ ] Click "Login" button
   - [ ] Verify successful login and redirect to home page

3. **Test ingredient autocomplete**
   - [ ] Click on the ingredient input field
   - [ ] Type "chi" (at least 2 characters)
   - [ ] Verify autocomplete dropdown appears within 300ms
   - [ ] Verify "chicken" appears in suggestions
   - [ ] Click on "chicken" to select it
   - [ ] Verify "chicken" appears in selected ingredients list

4. **Add multiple ingredients**
   - [ ] Type "ric" in the input field
   - [ ] Select "rice" from autocomplete
   - [ ] Type "tom" in the input field
   - [ ] Select "tomato" from autocomplete
   - [ ] Verify all three ingredients (chicken, rice, tomato) are displayed

5. **Remove an ingredient**
   - [ ] Click the remove/X button on "tomato"
   - [ ] Verify "tomato" is removed from the list
   - [ ] Verify "chicken" and "rice" remain

6. **Search for recipes**
   - [ ] Click "Get Recipes" or "Search" button
   - [ ] Verify loading indicator appears
   - [ ] Verify redirect to recipe results page
   - [ ] Verify recipes are displayed within 3 seconds
   - [ ] Verify each recipe card shows: name, image, cooking time, description
   - [ ] Verify match percentage is displayed for each recipe

7. **View recipe detail**
   - [ ] Click on the first recipe card
   - [ ] Verify redirect to recipe detail page
   - [ ] Verify recipe name and image are displayed
   - [ ] Verify ingredient list shows available vs missing ingredients
   - [ ] Verify step-by-step instructions are displayed
   - [ ] Verify cooking time, difficulty, and serving size are shown
   - [ ] Verify rating component is visible

8. **Add recipe to favorites**
   - [ ] Click the heart/favorite button
   - [ ] Verify button changes state (filled heart or color change)
   - [ ] Verify success message/toast appears
   - [ ] Navigate to user profile or favorites page
   - [ ] Verify the recipe appears in favorites list

---

## Test Flow 2: Recipe Detail → Add Missing Ingredients to Shopping List

**Requirements Tested**: 3.1, 3.2, 7.1, 7.2, 7.3, 7.4, 7.5

### Steps:
1. **Navigate to a recipe with missing ingredients**
   - [ ] From home page, search for recipes with only "chicken"
   - [ ] Click on a recipe that requires additional ingredients
   - [ ] Verify recipe detail page loads
   - [ ] Verify some ingredients are marked as "missing" or "not available"

2. **Add missing ingredients to shopping list**
   - [ ] Locate the "Add to Shopping List" button
   - [ ] Click the button
   - [ ] Verify success message appears
   - [ ] Verify button state changes or shows confirmation

3. **View shopping list**
   - [ ] Navigate to user profile or shopping list page
   - [ ] Verify shopping list is displayed
   - [ ] Verify missing ingredients from the recipe appear in the list
   - [ ] Verify each item shows ingredient name, quantity, and unit

4. **Remove item from shopping list**
   - [ ] Click remove/delete button on one item
   - [ ] Verify item is removed from the list
   - [ ] Verify remaining items are still displayed

5. **Verify persistence**
   - [ ] Refresh the page
   - [ ] Verify shopping list items persist
   - [ ] Logout and login again
   - [ ] Verify shopping list items still exist

---

## Test Flow 3: User Registration → Login → Rate Recipe

**Requirements Tested**: 6.1, 6.2, 10.1, 10.2, 10.3, 10.4, 10.5

### Steps:
1. **Register a new user**
   - [ ] Logout if currently logged in
   - [ ] Navigate to registration page
   - [ ] Enter email: `rater@example.com`
   - [ ] Enter password: `SecurePass456!`
   - [ ] Click "Register"
   - [ ] Verify successful registration

2. **Login with new credentials**
   - [ ] If not auto-logged in, go to login page
   - [ ] Enter email: `rater@example.com`
   - [ ] Enter password: `SecurePass456!`
   - [ ] Click "Login"
   - [ ] Verify successful login
   - [ ] Verify user is redirected to home page

3. **Find and view a recipe**
   - [ ] Search for recipes with "chicken" and "rice"
   - [ ] Click on any recipe to view details
   - [ ] Verify recipe detail page loads

4. **Rate the recipe (first time)**
   - [ ] Locate the rating component (star rating)
   - [ ] Click on the 5th star to give 5-star rating
   - [ ] Verify rating is submitted
   - [ ] Verify success message appears
   - [ ] Verify average rating updates to 5.0
   - [ ] Verify total ratings count shows 1 (or increases by 1)

5. **Update the rating**
   - [ ] Click on the 4th star to change rating to 4
   - [ ] Verify rating is updated
   - [ ] Verify average rating updates to 4.0
   - [ ] Verify total ratings count remains the same (not incremented)

6. **Verify rating persistence**
   - [ ] Refresh the page
   - [ ] Verify your 4-star rating is still displayed
   - [ ] Navigate away and come back to the recipe
   - [ ] Verify rating persists

---

## Test Flow 4: Filter Combinations with Recipe Search

**Requirements Tested**: 5.1, 5.2, 5.3, 5.4, 5.5

### Steps:
1. **Test cooking time filter**
   - [ ] Search for recipes with "chicken", "rice", "tomato"
   - [ ] On results page, locate cooking time filter
   - [ ] Select "Under 30 minutes" option
   - [ ] Verify results update automatically
   - [ ] Verify all displayed recipes have cooking time ≤ 30 minutes
   - [ ] Verify recipe count updates

2. **Test dietary preference filter - Vegetarian**
   - [ ] Clear previous search or start new search
   - [ ] Search with "tomato", "onion", "garlic"
   - [ ] Select "Vegetarian" checkbox
   - [ ] Verify results update
   - [ ] Verify all recipes are marked as vegetarian
   - [ ] Verify recipe count updates

3. **Test dietary preference filter - Vegan**
   - [ ] Keep previous ingredients
   - [ ] Uncheck "Vegetarian"
   - [ ] Check "Vegan" checkbox
   - [ ] Verify results update
   - [ ] Verify all recipes are marked as vegan
   - [ ] Verify recipe count updates

4. **Test combined filters**
   - [ ] Search with "rice", "vegetables"
   - [ ] Select "Under 45 minutes" for cooking time
   - [ ] Check "Vegetarian" checkbox
   - [ ] Verify results show only vegetarian recipes under 45 minutes
   - [ ] Verify recipe count reflects both filters

5. **Test clear filters**
   - [ ] Click "Clear Filters" button
   - [ ] Verify all filters are reset
   - [ ] Verify recipe results show all recipes again
   - [ ] Verify recipe count increases

6. **Test no results scenario**
   - [ ] Search with very specific ingredients
   - [ ] Apply restrictive filters (e.g., "Under 15 minutes" + "Vegan")
   - [ ] If no recipes match, verify "No recipes found" message appears
   - [ ] Verify message suggests removing filters or adding ingredients

---

## Error Scenarios and Edge Cases

**Requirements Tested**: 9.1, 9.2, 9.3, 9.4, 9.5

### Authentication Errors:
1. **Invalid login credentials**
   - [ ] Try to login with wrong password
   - [ ] Verify error message: "Invalid email or password"
   - [ ] Verify user is not logged in

2. **Duplicate registration**
   - [ ] Try to register with an existing email
   - [ ] Verify error message about duplicate email
   - [ ] Verify registration fails

3. **Unauthorized access**
   - [ ] Logout
   - [ ] Try to access favorites page directly
   - [ ] Verify redirect to login page or error message

### Input Validation Errors:
4. **Empty ingredient list**
   - [ ] Click "Get Recipes" without adding any ingredients
   - [ ] Verify error message: "Please add at least one ingredient"
   - [ ] Verify search does not proceed

5. **Invalid email format**
   - [ ] Try to register with "notanemail"
   - [ ] Verify email validation error
   - [ ] Verify registration fails

6. **Invalid rating value**
   - [ ] This should be prevented by UI (can't select invalid rating)
   - [ ] Verify only 1-5 stars are selectable

### Network Errors:
7. **Backend unavailable**
   - [ ] Stop the backend server
   - [ ] Try to search for recipes
   - [ ] Verify error message about connectivity issues
   - [ ] Verify user-friendly message (not technical details)

8. **Slow network simulation**
   - [ ] Use browser dev tools to throttle network to "Slow 3G"
   - [ ] Search for recipes
   - [ ] Verify loading indicator appears
   - [ ] Verify results load within reasonable time
   - [ ] Verify no timeout errors

---

## Mobile Responsiveness Testing

**Requirements Tested**: 4.1, 4.2, 4.3, 4.4

### Mobile (320px - 767px):
1. **Test at 320px width**
   - [ ] Open browser dev tools
   - [ ] Set viewport to 320px width
   - [ ] Navigate through all pages
   - [ ] Verify all content is readable
   - [ ] Verify no horizontal scrolling
   - [ ] Verify buttons are at least 44px × 44px
   - [ ] Verify ingredient input is usable
   - [ ] Verify recipe cards stack vertically

2. **Test at 375px width (iPhone)**
   - [ ] Set viewport to 375px width
   - [ ] Repeat all checks from 320px test
   - [ ] Verify filter panel is collapsible or scrollable

3. **Test touch interactions**
   - [ ] Use touch simulation in dev tools
   - [ ] Verify all buttons respond to touch
   - [ ] Verify autocomplete dropdown works with touch
   - [ ] Verify swipe gestures work (if implemented)

### Tablet (768px - 1023px):
4. **Test at 768px width**
   - [ ] Set viewport to 768px width
   - [ ] Verify layout adapts appropriately
   - [ ] Verify recipe cards display in 2-column grid
   - [ ] Verify navigation is accessible

### Desktop (1024px+):
5. **Test at 1024px width**
   - [ ] Set viewport to 1024px width
   - [ ] Verify full desktop layout
   - [ ] Verify recipe cards display in 3+ column grid
   - [ ] Verify all features are accessible

6. **Test at 1920px width**
   - [ ] Set viewport to 1920px width
   - [ ] Verify layout doesn't break
   - [ ] Verify content is centered or properly distributed
   - [ ] Verify no excessive whitespace

---

## Performance Testing

**Requirements Tested**: 2.4, 4.4

1. **Recipe search performance**
   - [ ] Search for recipes
   - [ ] Verify results appear within 3 seconds
   - [ ] Check browser console for any errors
   - [ ] Verify no memory leaks (check dev tools memory tab)

2. **Image loading**
   - [ ] Verify recipe images load progressively
   - [ ] Verify lazy loading works (images load as you scroll)
   - [ ] Verify placeholder images appear while loading

3. **Autocomplete performance**
   - [ ] Type quickly in ingredient input
   - [ ] Verify debouncing works (requests not sent on every keystroke)
   - [ ] Verify autocomplete responds within 300ms

4. **Mobile network performance**
   - [ ] Throttle network to 3G
   - [ ] Verify app loads within 5 seconds
   - [ ] Verify critical content loads first
   - [ ] Verify loading indicators appear

---

## Popular Recipes Feature

**Requirements Tested**: 8.1, 8.2, 8.3, 8.4

1. **Homepage popular recipes**
   - [ ] Navigate to homepage
   - [ ] Verify "Popular Recipes" section is displayed
   - [ ] Verify at least 6 recipes are shown
   - [ ] Verify each recipe shows: name, image, cooking time
   - [ ] Click on a popular recipe
   - [ ] Verify redirect to recipe detail page

2. **Popular recipes update**
   - [ ] View several recipes to increase their view count
   - [ ] Wait or refresh after some time
   - [ ] Verify popular recipes list updates (may need to clear cache)

---

## Complete Requirements Verification

### Requirement 1: Ingredient Input
- [ ] 1.1: Text input field provided ✓
- [ ] 1.2: Autocomplete with 2+ characters ✓
- [ ] 1.3: Ingredient selection and visible list ✓
- [ ] 1.4: Multiple ingredients can be added ✓
- [ ] 1.5: Ingredients can be removed ✓

### Requirement 2: Recipe Suggestions
- [ ] 2.1: Recipes retrieved with at least one ingredient ✓
- [ ] 2.2: Recipes displayed in grid/list format ✓
- [ ] 2.3: "No recipes found" message when appropriate ✓
- [ ] 2.4: Results within 3 seconds ✓
- [ ] 2.5: Available vs missing ingredients indicated ✓

### Requirement 3: Recipe Detail
- [ ] 3.1: Detailed recipe view on selection ✓
- [ ] 3.2: Ingredient list with visual distinction ✓
- [ ] 3.3: Step-by-step instructions ✓
- [ ] 3.4: Cooking time, difficulty, serving size ✓
- [ ] 3.5: Nutritional information (if available) ✓

### Requirement 4: Mobile Responsiveness
- [ ] 4.1: Responsive 320px - 1920px ✓
- [ ] 4.2: Touch-friendly controls (44px minimum) ✓
- [ ] 4.3: Readable on 320px width ✓
- [ ] 4.4: Loads within 5 seconds on 3G ✓

### Requirement 5: Filters
- [ ] 5.1: Cooking time filter controls ✓
- [ ] 5.2: Dietary preference filter controls ✓
- [ ] 5.3: Results update when filters applied ✓
- [ ] 5.4: Recipe count displayed ✓
- [ ] 5.5: Clear filters functionality ✓

### Requirement 6: User Accounts and Favorites
- [ ] 6.1: User registration with email/password ✓
- [ ] 6.2: User authentication ✓
- [ ] 6.3: Mark recipes as favorites (authenticated) ✓
- [ ] 6.4: Display list of favorites ✓
- [ ] 6.5: Favorites persist across sessions ✓

### Requirement 7: Shopping List
- [ ] 7.1: Add missing ingredients to shopping list ✓
- [ ] 7.2: Ingredients stored in shopping list ✓
- [ ] 7.3: View complete shopping list ✓
- [ ] 7.4: Remove items from shopping list ✓
- [ ] 7.5: Shopping list persists (authenticated) ✓

### Requirement 8: Popular Recipes
- [ ] 8.1: Popular recipes section on homepage ✓
- [ ] 8.2: At least 6 popular recipes displayed ✓
- [ ] 8.3: Click to view detailed recipe ✓
- [ ] 8.4: List updates based on metrics (daily) ✓

### Requirement 9: Error Handling
- [ ] 9.1: User-friendly error messages ✓
- [ ] 9.2: Empty ingredient list validation ✓
- [ ] 9.3: Connectivity error messages ✓
- [ ] 9.4: Actionable guidance in errors ✓
- [ ] 9.5: Detailed logging (backend) ✓

### Requirement 10: Recipe Ratings
- [ ] 10.1: Rating mechanism (1-5 stars, authenticated) ✓
- [ ] 10.2: Rating stored with user and recipe ✓
- [ ] 10.3: Average rating displayed ✓
- [ ] 10.4: Number of ratings displayed ✓
- [ ] 10.5: Update existing rating ✓

---

## Test Results Summary

**Date**: _______________
**Tester**: _______________
**Environment**: _______________

**Total Tests**: _____ / _____
**Passed**: _____
**Failed**: _____
**Blocked**: _____

### Critical Issues Found:
1. 
2. 
3. 

### Minor Issues Found:
1. 
2. 
3. 

### Notes:


---

## Sign-off

- [ ] All critical user flows tested and working
- [ ] All requirements verified
- [ ] Mobile responsiveness confirmed
- [ ] Error handling validated
- [ ] Performance acceptable

**Tester Signature**: _______________
**Date**: _______________
