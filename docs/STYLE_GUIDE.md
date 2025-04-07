# GigGatek Style Guide

This document outlines the design system and style guidelines for the GigGatek ecommerce platform. Following these guidelines will ensure visual consistency, improve user experience, and streamline development.

## Brand Identity

### Logo

- The GigGatek logo consists of a minimalist tech-themed symbol paired with the GigGatek wordmark
- Logo should be displayed at the appropriate size (50px height in header)
- Adequate space should be maintained around the logo (minimum padding of 10px)
- Never stretch or distort the logo
- Use SVG format when possible for optimal scaling

### Typography

#### Primary Font: Roboto

- **Regular (400)**: Used for body text, descriptions, and general content
- **Medium (500)**: Used for subheadings, product titles, and emphasis
- **Bold (700)**: Used for main headings, buttons, and important elements

#### Font Sizes

- H1: 32px (2rem) - Main page headings
- H2: 24px (1.5rem) - Section headings
- H3: 20px (1.25rem) - Subsection headings
- Body: 16px (1rem) - General text
- Small: 14px (0.875rem) - Secondary text, footnotes
- XS: 12px (0.75rem) - Legal text, fine print

#### Line Heights

- Headings: 1.2
- Body text: 1.6
- Buttons and form elements: 1.5

### Color Palette

#### Primary Colors

- **Primary Blue**: `#007bff`
  - Text on white: Passes WCAG AA for large text only
  - Use for primary buttons, links, and accents
  - Hover state: `#0056b3` (darker variant)

- **Secondary Grey**: `#343a40`
  - Text on white: Passes WCAG AAA
  - Use for header, footer, text, and secondary buttons
  - Hover state: `#23272b` (darker variant)

#### Accent Colors

- **Green (Success/Rent)**: `#28a745`
  - Use for rent-to-own elements, success messages, and positive indicators
  - Hover state: `#218838` (darker variant)

- **Warning Yellow**: `#ffc107`
  - Use for warnings, alerts, and important notifications
  - Hover state: `#e0a800` (darker variant)

- **Danger Red**: `#dc3545`
  - Use for errors, destructive actions, and critical alerts
  - Hover state: `#c82333` (darker variant)

#### Neutral Colors

- **White**: `#ffffff`
  - Use for backgrounds, cards, and text on dark backgrounds

- **Light Grey**: `#f8f9fa`
  - Use for backgrounds, disabled states, and subtle differences

- **Medium Grey**: `#6c757d`
  - Use for secondary text, borders, and less important elements

- **Dark Grey**: `#343a40`
  - Use for main text, headings, and high-contrast elements

#### Color Usage Guidelines

- Maintain adequate color contrast (WCAG AA minimum)
- Use colors consistently across the platform
- Limit accent colors to specific functional meanings
- Use color to support meaning, not as the only indicator

### Spacing System

Based on a 4px grid system:

- **XS**: 4px (0.25rem)
- **S**: 8px (0.5rem)
- **M**: 16px (1rem)
- **L**: 24px (1.5rem)
- **XL**: 32px (2rem)
- **XXL**: 48px (3rem)
- **XXXL**: 64px (4rem)

Apply these spacing units consistently for margins, padding, and layout gaps.

## Components

### Buttons

#### Primary Button

- Background: Primary Blue (`#007bff`)
- Text: White (`#ffffff`)
- Padding: 10px 20px (0.625rem 1.25rem)
- Border: None
- Border-radius: 5px (0.3125rem)
- Font-weight: Bold
- Hover: Darker shade (`#0056b3`), slight transform
- Focus: Blue outline (`box-shadow: 0 0 0 3px rgba(0,123,255,0.5)`)
- Disabled: Opacity 0.65, no hover effects

```css
.btn-primary {
    display: inline-block;
    background-color: #007bff;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-primary:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
}

.btn-primary:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0,123,255,0.5);
}

.btn-primary:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
}
```

#### Secondary Button

- Background: `#6c757d`
- Text: White (`#ffffff`)
- Other properties match primary button
- Hover: `#5a6268`

#### Success/Action Button (Rent)

- Background: Green (`#28a745`)
- Text: White (`#ffffff`)
- Other properties match primary button
- Hover: `#218838`

#### Danger Button

- Background: Red (`#dc3545`)
- Text: White (`#ffffff`)
- Other properties match primary button
- Hover: `#c82333`

#### Button Sizes

- Small: Padding 5px 10px, Font-size 14px
- Regular: Padding 10px 20px, Font-size 16px
- Large: Padding 12px 25px, Font-size 18px

### Forms

#### Text Inputs

- Height: 45px
- Padding: 10px 12px
- Border: 1px solid `#ced4da`
- Border-radius: 4px
- Focus: Border color `#007bff`, box-shadow
- Error: Border color `#dc3545`

```css
.form-control {
    display: block;
    width: 100%;
    height: 45px;
    padding: 10px 12px;
    font-size: 16px;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 4px;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
    border-color: #007bff;
    outline: 0;
    box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
}

.form-control.error {
    border-color: #dc3545;
}
```

#### Form Labels

- Font-weight: Bold
- Margin-bottom: 8px
- Color: `#343a40`

#### Form Groups

- Margin-bottom: 20px

#### Validation Messages

- Success: Green text (`#28a745`)
- Error: Red text (`#dc3545`)
- Font-size: 14px
- Margin-top: 5px

### Cards

#### Product Card

- Background: White (`#ffffff`)
- Border: 1px solid `#dee2e6` or none with shadow
- Border-radius: 8px
- Padding: 15px
- Box-shadow: `0 2px 5px rgba(0,0,0,0.1)`
- Hover: Slight elevation effect

```css
.product-card {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    padding: 15px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.product-card img {
    width: 100%;
    height: 200px;
    object-fit: contain;
    margin-bottom: 15px;
}

.product-card h3 {
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 10px;
    color: #343a40;
}

.product-card .price {
    font-weight: bold;
    font-size: 20px;
    color: #343a40;
    margin-bottom: 15px;
}

.product-card .rent-price {
    font-size: 14px;
    color: #28a745;
    margin-bottom: 15px;
}
```

#### Info Card

- Similar to product card but with different padding and content styling
- Used for promotional content, testimonials, etc.

### Tables

- Border-collapse: Collapse
- Width: 100%
- Cell padding: 12px 15px
- Header background: `#007bff`
- Header text color: White (`#ffffff`)
- Zebra striping: Even rows `#f8f9fa`
- Hover effect: Light blue background (`#f1f8ff`)
- Border: 1px solid `#dee2e6`

```css
table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
}

th, td {
    padding: 12px 15px;
    text-align: left;
    border: 1px solid #dee2e6;
}

th {
    background-color: #007bff;
    color: #ffffff;
    font-weight: 500;
}

tr:nth-child(even) {
    background-color: #f8f9fa;
}

tr:hover {
    background-color: #f1f8ff;
}
```

### Notifications

#### Alert Components

- Padding: 12px 20px
- Border-radius: 4px
- Border-left: 4px solid (status color)
- Margin-bottom: 20px

```css
.alert {
    padding: 12px 20px;
    border-radius: 4px;
    margin-bottom: 20px;
    position: relative;
}

.alert-success {
    background-color: #d4edda;
    border-left: 4px solid #28a745;
    color: #155724;
}

.alert-warning {
    background-color: #fff3cd;
    border-left: 4px solid #ffc107;
    color: #856404;
}

.alert-danger {
    background-color: #f8d7da;
    border-left: 4px solid #dc3545;
    color: #721c24;
}

.alert-info {
    background-color: #d1ecf1;
    border-left: 4px solid #17a2b8;
    color: #0c5460;
}
```

#### Toast Notifications

- Position: Top-right
- Width: 300px
- Padding: 15px
- Border-radius: 4px
- Box-shadow: `0 3px 10px rgba(0,0,0,0.15)`
- Animation: Slide in from right, fade out

## Layout

### Grid System

- Based on CSS Grid and Flexbox
- 12-column layout
- Gutter width: 30px
- Breakpoints:
  - XS: < 576px (Mobile)
  - SM: 576px - 767px (Mobile landscape)
  - MD: 768px - 991px (Tablet)
  - LG: 992px - 1199px (Desktop)
  - XL: ≥ 1200px (Large desktop)

### Container Sizes

- Default container width: 90% of viewport
- Max-width: 1200px
- Container margins: 0 auto (centered)

### Section Spacing

- Section padding: 60px 0
- Section margin-bottom: 60px
- Inner section spacing: 30px

## Responsive Design

### Mobile First Approach

- Begin development with mobile layouts
- Add complexity for larger screens with media queries
- Test on multiple device sizes

### Image Optimization

- Responsive images using `max-width: 100%`
- Appropriate image formats (WebP with fallbacks)
- Consider different image sizes for different viewports

### Text Sizing

- Use relative units (rem) for text
- Adjust heading sizes on smaller screens
- Minimum body text size of 16px for readability

### Touch Targets

- Minimum size for touch targets: 44px × 44px
- Adequate spacing between interactive elements
- Larger buttons on mobile

## Admin Interface

### Admin Color Scheme

- Primary: `#343a40` (dark grey)
- Secondary: `#007bff` (blue)
- Success: `#28a745` (green)
- Warning: `#ffc107` (yellow)
- Danger: `#dc3545` (red)
- Light BG: `#f8f9fa` (light grey)

### Admin Layout

- Sidebar navigation: 250px width
- Header height: 60px
- Content padding: 20px
- Table styling consistent with front-end but with more compact spacing
- Modal dialogs for forms and confirmations

### Admin Components

- Data tables with sorting, filtering, and pagination
- Form layouts with clear grouping and labeling
- Dashboard widgets with clean, minimal styling
- Status indicators using consistent color coding

## Animations and Transitions

### Usage Guidelines

- Keep animations subtle and purposeful
- Standard duration: 0.3s
- Standard easing: ease or ease-out
- Avoid animations that could cause motion sickness
- Respect user preferences (prefers-reduced-motion)

### Hover Effects

- Subtle scale or transform
- Color transitions
- Box-shadow changes

### Page Transitions

- Fade-in for content
- Smooth scrolling for anchors

## Accessibility

### Color Contrast

- Text must maintain a contrast ratio of at least 4.5:1 (WCAG AA)
- Large text (18pt+) must maintain a contrast ratio of at least 3:1
- UI components and graphics must maintain a contrast ratio of at least 3:1

### Focus Indicators

- Visible focus state for all interactive elements
- Do not remove outlines without providing alternatives
- Focus states should be distinctive and visible

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Logical tab order
- Skip-to-content link at the beginning of the page

### Screen Reader Support

- Proper use of semantic HTML
- ARIA attributes when necessary
- Alt text for images
- Form labels for all inputs

## Implementation Notes

- Use CSS variables for colors, spacing, and typography
- Implement via well-structured CSS files
- Consider component-based architecture if adopting a framework
- Prioritize responsive and accessible implementations

## Appendix: CSS Variables

```css
:root {
    /* Colors */
    --primary: #007bff;
    --primary-dark: #0056b3;
    --secondary: #343a40;
    --secondary-dark: #23272b;
    --success: #28a745;
    --success-dark: #218838;
    --warning: #ffc107;
    --warning-dark: #e0a800;
    --danger: #dc3545;
    --danger-dark: #c82333;
    --light: #f8f9fa;
    --medium: #6c757d;
    --dark: #343a40;
    --white: #ffffff;
    
    /* Typography */
    --font-family: 'Roboto', Arial, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;
    --font-size-xxl: 2rem;
    
    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-xxl: 3rem;
    
    /* Borders */
    --border-radius-sm: 0.25rem;
    --border-radius: 0.5rem;
    --border-radius-lg: 1rem;
    
    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
    --shadow: 0 2px 5px rgba(0,0,0,0.1);
    --shadow-lg: 0 5px 15px rgba(0,0,0,0.1);
    
    /* Transitions */
    --transition-duration: 0.3s;
    --transition-easing: ease;
}
