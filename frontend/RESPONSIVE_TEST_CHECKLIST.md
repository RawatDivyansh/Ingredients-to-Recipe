# Responsive Design Test Checklist

## Test Environment Setup
- Use browser DevTools to test different viewport sizes
- Test on actual devices when possible
- Verify touch interactions work properly

## Breakpoint Testing

### Mobile (320px - 767px)

#### 320px Width (iPhone SE)
- [ ] Navigation bar displays properly with wrapped links
- [ ] All text is readable without horizontal scrolling
- [ ] Buttons are at least 44px × 44px (touch-friendly)
- [ ] Ingredient input field is accessible and doesn't zoom on iOS
- [ ] Recipe cards display in single column
- [ ] Filter panel is collapsible
- [ ] Images scale properly
- [ ] Recipe instructions are readable

#### 375px Width (iPhone 12/13)
- [ ] Layout adjusts properly
- [ ] All interactive elements are touch-friendly
- [ ] Content fits without horizontal scroll

#### 480px Width (Small Mobile)
- [ ] Recipe grid displays correctly
- [ ] Pagination controls are accessible
- [ ] Shopping list items are readable

#### 767px Width (Large Mobile)
- [ ] All mobile optimizations still apply
- [ ] Transition to tablet layout is smooth

### Tablet (768px - 1023px)

#### 768px Width (iPad Portrait)
- [ ] Recipe grid shows 2 columns
- [ ] Filter panel is always visible (not collapsible)
- [ ] Navigation is horizontal
- [ ] Touch targets remain adequate

#### 1023px Width (iPad Landscape)
- [ ] Layout transitions smoothly to desktop
- [ ] Recipe cards display in 2-3 columns
- [ ] All content is properly spaced

### Desktop (1024px+)

#### 1024px Width (Small Desktop)
- [ ] Recipe grid shows 3+ columns
- [ ] Filter panel is sticky on scroll
- [ ] Hover effects work on interactive elements
- [ ] Maximum content width is enforced (1200px)

#### 1920px Width (Full HD)
- [ ] Content is centered with max-width
- [ ] No excessive whitespace
- [ ] Images maintain quality

## Component-Specific Tests

### Navigation
- [ ] Mobile: Links wrap or stack vertically
- [ ] Tablet: Horizontal navigation
- [ ] Desktop: Full horizontal navigation with hover effects
- [ ] All nav links have min 44px touch targets on mobile

### Ingredient Input
- [ ] Mobile: Full width, 16px font size (prevents iOS zoom)
- [ ] Autocomplete suggestions are touch-friendly (min 48px height)
- [ ] Selected ingredients display as tags with touch-friendly remove buttons

### Recipe Cards
- [ ] Mobile: Single column, readable text
- [ ] Tablet: 2 columns
- [ ] Desktop: 3+ columns with hover effects
- [ ] Images load and scale properly at all sizes
- [ ] Match badges are visible and readable

### Filter Panel
- [ ] Mobile: Collapsible with toggle button (min 48px height)
- [ ] Tablet/Desktop: Always visible, sticky on scroll
- [ ] Radio buttons and checkboxes are touch-friendly (min 44px)
- [ ] Clear filters button is accessible

### Recipe Detail Page
- [ ] Mobile: Single column layout, readable instructions
- [ ] Tablet: Single column with better spacing
- [ ] Desktop: Two-column layout (ingredients | instructions)
- [ ] Back button is touch-friendly
- [ ] Rating stars are touch-friendly on mobile (min 44px)
- [ ] Shopping list button is full-width on mobile

### User Profile
- [ ] Mobile: Tabs are scrollable horizontally if needed
- [ ] Tab buttons are touch-friendly (min 48px height)
- [ ] Favorites and shopping list display properly

### Popular Recipes
- [ ] Mobile: Single column grid
- [ ] Tablet: 2 columns
- [ ] Desktop: 3+ columns
- [ ] Section title and subtitle are readable

## Touch Interaction Tests

### Mobile Touch Targets
- [ ] All buttons are minimum 44px × 44px
- [ ] Links have adequate padding for touch
- [ ] Form inputs are minimum 48px height
- [ ] Remove buttons on tags are touch-friendly
- [ ] Star ratings are touch-friendly

### Gestures
- [ ] Scrolling is smooth (webkit-overflow-scrolling: touch)
- [ ] No accidental horizontal scrolling
- [ ] Pull-to-refresh works (if implemented)
- [ ] Tap highlights are appropriate

## Performance Tests

### Mobile Network
- [ ] Page loads within 5 seconds on 3G
- [ ] Images are optimized and lazy-loaded
- [ ] CSS and JS are minified

### Rendering
- [ ] No layout shifts during load
- [ ] Smooth transitions between breakpoints
- [ ] No jank during scrolling

## Accessibility Tests

### Mobile Accessibility
- [ ] Text is readable without zooming (min 16px for inputs)
- [ ] Color contrast meets WCAG standards
- [ ] Touch targets don't overlap
- [ ] Focus indicators are visible

## Browser Compatibility

### Mobile Browsers
- [ ] Safari iOS (iPhone)
- [ ] Chrome Android
- [ ] Samsung Internet

### Desktop Browsers
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Known Issues
- Document any responsive issues found during testing
- Note any browser-specific quirks

## Test Results

### Mobile (320px)
- Status: ✅ PASS / ❌ FAIL
- Notes: 

### Mobile (375px)
- Status: ✅ PASS / ❌ FAIL
- Notes: 

### Mobile (480px)
- Status: ✅ PASS / ❌ FAIL
- Notes: 

### Mobile (767px)
- Status: ✅ PASS / ❌ FAIL
- Notes: 

### Tablet (768px)
- Status: ✅ PASS / ❌ FAIL
- Notes: 

### Tablet (1023px)
- Status: ✅ PASS / ❌ FAIL
- Notes: 

### Desktop (1024px)
- Status: ✅ PASS / ❌ FAIL
- Notes: 

### Desktop (1920px)
- Status: ✅ PASS / ❌ FAIL
- Notes: 

## Conclusion
- Overall responsive design status: 
- Critical issues: 
- Recommendations: 
