# AI Law Wizard - Design System Documentation

This document serves as the definitive guide for maintaining visual and interaction consistency across the AI Law Wizard application. All new components and features must adhere to these design system rules.

---

## 🎨 Color System

### Color Architecture

The application uses an **OKLCH-based color system** with CSS variables for consistent theming and dark mode support. All colors are defined in `src/app/globals.css`.

### Primary Colors

#### Light Mode

```css
--primary: oklch(0.589 0.2267 310.2668) /* Professional purple/magenta */
  --primary-foreground: oklch(1 0 0) /* White text on primary */;
```

#### Dark Mode

```css
--primary: oklch(0.6518 0.1925 311.1274) /* Brighter primary for dark mode */
  --primary-foreground: oklch(1 0 0) /* White text */;
```

**Usage Rules:**

- Use `bg-primary` for primary buttons, active states, and key actions
- Use `text-primary` for primary text accents and links
- Never use raw color values - always use CSS variables

### Semantic Colors

#### Background Colors

```css
--background: oklch(0.994 0 0) /* Pure white (light mode) */
  --foreground: oklch(0 0 0) /* Pure black text (light mode) */
  --card: oklch(0.994 0 0) /* Card backgrounds */ --muted: oklch(0.9702 0 0)
  /* Subtle backgrounds */;
```

#### Secondary Colors

```css
--secondary: oklch(0.9113 0.0109 280.4626) /* Light secondary backgrounds */
  --secondary-foreground: oklch(0.1344 0 0) /* Dark text on secondary */;
```

#### Accent Colors

```css
--accent: oklch(0.8763 0.0508 286.5404) /* Accent backgrounds */
  --accent-foreground: oklch(0.4416 0.1844 273.4193) /* Accent text */;
```

#### Destructive/Error Colors

```css
--destructive: oklch(0.658 0.1116 44.0316) /* Error/delete actions */
  --destructive-foreground: oklch(1 0 0) /* White text on error */;
```

#### Border & Input Colors

```css
--border: oklch(0.8953 0.011 297.6062) /* Borders */ --input: oklch(0.9401 0 0)
  /* Input backgrounds */ --ring: oklch(0 0 0) /* Focus rings */;
```

### Professional Blue Theme (Additional)

For specific UI elements like badges, headers, and professional accents:

```css
/* Primary Blue (Trustworthy, Professional) */
Blue-700: #1e40af
Blue-600: #2563eb

/* Success Green (Active Status) */
Green-500: #10b981
Green-600: #059669

/* Warning Amber (Attention) */
Amber-600: #d97706

/* Error Red (Critical) */
Red-500: #dc2626

/* Neutral Gray (Supporting Text) */
Slate-500: #64748b
Slate-600: #475569
Slate-900: #1e293b
```

**Usage:**

- Use professional blue (`blue-700`, `blue-600`) for headers, icons, and trust-building elements
- Use success green for positive actions and active states
- Use neutral grays for secondary text and muted content
- Use semantic CSS variables (`--primary`, `--destructive`) for theme-aware components

---

## 📐 Typography

### Font Families

```css
--font-sans:
  Alatsi, ui-sans-serif, sans-serif, system-ui --font-serif: Abyssinica SIL,
  ui-serif, serif --font-mono: IBM Plex Mono, monospace;
```

**Usage:**

- **Sans-serif (default)**: Body text, UI elements, buttons
- **Serif**: Optional for formal legal documents or special typography
- **Monospace**: Case numbers, IDs, code blocks, technical data

### Font Sizes

Follow Tailwind's standard sizing:

- `text-xs`: 12px - Captions, labels, metadata
- `text-sm`: 14px - Secondary text, descriptions
- `text-base`: 16px - Default body text
- `text-lg`: 18px - Subheadings
- `text-xl`: 20px - Section headings
- `text-2xl`: 24px - Page titles
- `text-3xl`: 30px - Hero headings
- `text-4xl+`: Large display text

### Letter Spacing

```css
--tracking-normal: 0.025em
  --tracking-tighter: calc(var(--tracking-normal) - 0.05em)
  --tracking-tight: calc(var(--tracking-normal) - 0.025em)
  --tracking-wide: calc(var(--tracking-normal) + 0.025em)
  --tracking-wider: calc(var(--tracking-normal) + 0.05em)
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
```

**Usage:**

- Default letter spacing is applied globally via `body` element
- Use tighter spacing for headings if needed
- Use wider spacing for uppercase labels or badges

### Font Weights

- `font-normal`: 400 - Body text
- `font-semibold`: 600 - Important labels, buttons
- `font-bold`: 700 - Headings, emphasis

---

## 📏 Spacing System

### Standard Spacing Scale

Follow Tailwind's spacing scale (4px base unit):

- `p-2`: 8px - Tight padding
- `p-3`: 12px - Compact padding
- `p-4`: 16px - Standard card padding
- `p-6`: 24px - Section padding
- `p-8`: 32px - Large section padding

### Common Patterns

```css
/* Card padding */
Card padding: p-4 (16px)

/* Section gaps */
Section gaps: gap-3 (12px) or gap-4 (16px)

/* Component margins */
Component margin: mb-2 (8px) for spacing between elements
Grid gap: gap-4 (16px) for grid layouts
```

### Responsive Spacing

```tsx
// Mobile-first approach
px-4 sm:px-6 lg:px-8 lg:px-12  // Horizontal padding scales with screen size
py-4 sm:py-6                    // Vertical padding scales
gap-3 md:gap-4                  // Grid gaps scale
```

---

## 🔲 Border Radius

```css
--radius: 1.4rem /* 22.4px - Primary border radius */;
```

### Border Radius Scale

- `rounded-sm`: `calc(var(--radius) - 4px)` - Small elements
- `rounded-md`: `calc(var(--radius) - 2px)` - Medium elements
- `rounded-lg`: `var(--radius)` - Cards, buttons (default)
- `rounded-xl`: ~1.75rem - Large cards, modals
- `rounded-full`: Perfect circles (badges, avatars)

**Usage:**

- Use `rounded-xl` for cards and major containers
- Use `rounded-lg` for buttons and inputs
- Use `rounded-full` for badges and circular avatars

---

## 🌫️ Shadows

### Shadow System

```css
--shadow-2xs:
  0px 2px 3px 0px hsl(0 0% 10.1961% / 0.08) --shadow-xs: 0px 2px 3px 0px
    hsl(0 0% 10.1961% / 0.08) --shadow-sm: 0px 2px 3px 0px
    hsl(0 0% 10.1961% / 0.16),
  0px 1px 2px -1px hsl(0 0% 10.1961% / 0.16) --shadow: Same as shadow-sm
    --shadow-md: 0px 2px 3px 0px hsl(0 0% 10.1961% / 0.16),
  0px 2px 4px -1px hsl(0 0% 10.1961% / 0.16) --shadow-lg: 0px 2px 3px 0px
    hsl(0 0% 10.1961% / 0.16),
  0px 4px 6px -1px hsl(0 0% 10.1961% / 0.16) --shadow-xl: 0px 2px 3px 0px
    hsl(0 0% 10.1961% / 0.16),
  0px 8px 10px -1px hsl(0 0% 10.1961% / 0.16) --shadow-2xl: 0px 2px 3px 0px
    hsl(0 0% 10.1961% / 0.4);
```

**Usage:**

- `shadow-sm`: Cards, subtle elevations
- `shadow-md`: Hover states, raised cards
- `shadow-lg`: Modals, dropdowns, prominent cards
- `shadow-xl`: Elevated modals, floating elements

---

## ✨ Glassmorphic Design Pattern

For modern, premium-feeling UI elements, use the glassmorphic pattern:

```tsx
className="backdrop-blur-md"
style={{
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid rgba(226, 232, 240, 0.5)',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
}}
```

**Applied To:**

- Hero stat cards
- Feature cards
- Role selection cards
- Comparison tables
- Premium UI elements

**Rules:**

- Use semi-transparent white backgrounds (0.9 opacity)
- Apply backdrop blur for depth
- Use subtle borders with low opacity
- Combine with gentle shadows

---

## 🎭 Component Patterns

### Buttons

#### Primary Button

```tsx
<button className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold shadow-sm transition-all duration-200">
  Button Text
</button>
```

**Sizes:**

- Standard: `py-3` (height ~40px)
- Compact: `h-9` or `h-10` (36px/40px)
- Large: `py-4` (height ~48px)

**States:**

- Default: `bg-primary`
- Hover: `hover:bg-primary/90`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- Loading: Show spinner, disable interaction

#### Secondary Button

```tsx
<button className="bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 rounded-xl font-semibold transition-all duration-200">
  Button Text
</button>
```

#### Destructive Button

```tsx
<button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground py-3 rounded-xl font-semibold transition-all duration-200">
  Delete
</button>
```

### Cards

#### Standard Card

```tsx
<Card className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
  {/* Card content */}
</Card>
```

#### Glassmorphic Card

```tsx
<div
  className="backdrop-blur-md rounded-xl p-4"
  style={{
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "1px solid rgba(226, 232, 240, 0.5)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  }}
>
  {/* Card content */}
</div>
```

**Card Padding:**

- Standard: `p-4` (16px)
- Compact: `p-3` (12px)
- Spacious: `p-6` (24px)

### Badges

#### Standard Badge

```tsx
<Badge
  variant="outline"
  className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
>
  Label
</Badge>
```

#### Status Badges

- **Success**: `bg-green-50 text-green-700 border-green-200`
- **Warning**: `bg-amber-50 text-amber-700 border-amber-200`
- **Error**: `bg-red-50 text-red-700 border-red-200`
- **Info**: `bg-blue-50 text-blue-700 border-blue-200`

**Badge Sizes:**

- Small: `text-xs px-2 py-0.5`
- Default: `text-sm px-2.5 py-1`

### Input Fields

#### Standard Input

```tsx
<input
  className="w-full pl-10 pr-3 py-3 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-foreground"
  placeholder="Placeholder text"
/>
```

**Input Features:**

- Border: `border-2 border-input`
- Focus: `focus:ring-2 focus:ring-ring focus:border-transparent`
- Icon support: `pl-10` or `pl-12` with absolute positioned icons
- Error state: Red border, error message below

#### Input with Icon

```tsx
<div className="relative">
  <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
  <input className="w-full pl-10 ..." />
</div>
```

### Icons

**Standard Sizes:**

- Small: `w-4 h-4` (16px) - Inline with text
- Medium: `w-5 h-5` (20px) - Buttons, inputs
- Large: `w-6 h-6` (24px) - Headings, features
- Extra Large: `w-7 h-7` or `w-8 h-8` (28px/32px) - Hero sections

**Icon Colors:**

- Default: `text-muted-foreground`
- Primary: `text-primary`
- On colored backgrounds: `text-white` or `text-primary-foreground`

---

## 🎬 Animation & Motion

### Framer Motion Integration

The application uses Framer Motion for smooth animations.

### Common Animation Patterns

#### Page Transitions

```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {/* Content */}
</motion.div>
```

#### Staggered Animations

```tsx
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
>
  {/* Content */}
</motion.div>
```

#### Hover Effects

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="transition-all duration-200"
>
  Button
</motion.button>
```

#### Layout Animations

```tsx
<motion.div
  layoutId="uniqueId"
  className="..."
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
>
  {/* Animated element */}
</motion.div>
```

### Animation Guidelines

- **Duration**: 200-500ms for most interactions
- **Easing**: Use spring animations for natural feel, ease-out for transitions
- **Performance**: Prefer CSS transitions for simple hover effects
- **Accessibility**: Respect `prefers-reduced-motion` (consider adding this)

### Error Animations

```tsx
// Shake animation for errors
<motion.div
  animate={{ x: [0, -8, 8, -8, 8, 0] }}
  transition={{ duration: 0.5 }}
  className="bg-destructive/10 border-l-4 border-destructive"
>
  Error message
</motion.div>
```

---

## 📱 Responsive Design

### Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1400px /* Extra large desktop */
```

### Responsive Patterns

#### Grid Layouts

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

#### Hidden/Visible Elements

```tsx
// Mobile-only
<div className="md:hidden">Mobile content</div>

// Desktop-only
<div className="hidden md:block">Desktop content</div>

// Conditional display
<div className={selected ? "hidden md:block" : "block"}>
  Conditional content
</div>
```

#### Spacing Adjustments

```tsx
// Responsive padding
<div className="px-4 sm:px-6 lg:px-8 lg:px-12">

// Responsive gaps
<div className="gap-3 md:gap-4 lg:gap-6">
```

#### Touch Optimization

- Minimum touch target: 44x44px (h-11)
- Button heights: `h-10` (40px) or `h-12` (48px) for mobile
- Larger spacing on mobile for easier interaction

### Container Sizing

```css
Container padding: 2rem (32px)
Container max-width: 1400px (2xl breakpoint)
Container center: true
```

---

## 🌓 Dark Mode

The application supports dark mode via the `class` strategy in Tailwind.

### Dark Mode Colors

All color variables have dark mode variants defined in `.dark` class.

**Usage:**

- Toggle dark mode by adding/removing `dark` class to root element
- Colors automatically adapt via CSS variables
- Test all components in both light and dark modes

### Dark Mode Considerations

- Use semantic color tokens (e.g., `bg-card` not `bg-white`)
- Ensure sufficient contrast ratios (WCAG AA minimum)
- Test all interactive elements in dark mode
- Consider reduced saturation for dark mode backgrounds

---

## 🎯 Design Principles

### 1. Professional & Trustworthy

- Use professional blue as primary accent
- Clean, uncluttered layouts
- Consistent typography hierarchy
- Appropriate use of whitespace

### 2. Accessibility First

- Sufficient color contrast (WCAG AA)
- Keyboard navigation support
- Screen reader friendly
- Clear focus indicators

### 3. Mobile-First Approach

- Design for mobile, enhance for desktop
- Touch-friendly targets (minimum 44px)
- Responsive breakpoints
- Progressive enhancement

### 4. Consistency

- Use design system tokens (CSS variables)
- Consistent spacing scale
- Unified component patterns
- Predictable interactions

### 5. Performance

- Optimize animations
- Use CSS transitions where possible
- Lazy load heavy components
- Minimize layout shifts

---

## 🚫 Anti-Patterns (What NOT to Do)

### ❌ Don't Use Raw Color Values

```tsx
// ❌ BAD
<div className="bg-[#1e40af]">

// ✅ GOOD
<div className="bg-primary">
```

### ❌ Don't Use Inline Styles for Colors

```tsx
// ❌ BAD
<div style={{ backgroundColor: '#f9fafb' }}>

// ✅ GOOD
<div className="bg-background">
```

### ❌ Don't Create Custom Spacing Values

```tsx
// ❌ BAD
<div className="p-[13px]">

// ✅ GOOD
<div className="p-3"> or <div className="p-4">
```

### ❌ Don't Skip Responsive Design

```tsx
// ❌ BAD
<div className="w-96">  {/* Fixed width */}

// ✅ GOOD
<div className="w-full md:w-96">
```

### ❌ Don't Override Theme Variables

```tsx
// ❌ BAD
<div className="rounded-lg" style={{ borderRadius: '8px' }}>

// ✅ GOOD
<div className="rounded-lg">
```

### ❌ Don't Mix Design Systems

- Don't use Material Design components alongside this system
- Don't use Bootstrap classes
- Stay consistent with Tailwind + shadcn/ui approach

---

## 📚 Component Library Reference

### shadcn/ui Components

The application uses shadcn/ui components. Always use these components instead of creating custom ones:

- `Button` - Use variants: default, destructive, outline, secondary, ghost, link
- `Card` - Container with proper styling
- `Badge` - Status indicators and labels
- `Input` - Form inputs (use with proper styling from patterns above)
- Additional components as needed

**Always check if a component exists before creating a custom one.**

---

## 🎨 Visual Hierarchy

### Heading Sizes

- **H1/Page Title**: `text-3xl` or `text-4xl` - Bold, prominent
- **H2/Section Title**: `text-2xl` - Clear section breaks
- **H3/Subsection**: `text-xl` - Subsections within sections
- **H4/Card Title**: `text-lg` - Card headings
- **Body**: `text-base` or `text-sm` - Default reading size

### Color Hierarchy

1. **Primary actions**: `bg-primary` - Most important actions
2. **Secondary actions**: `bg-secondary` - Less important
3. **Text hierarchy**: `text-foreground` > `text-muted-foreground` - Importance via contrast

---

## 🔍 Code Examples

### Complete Button Example

```tsx
<motion.button
  type="submit"
  disabled={isLoading}
  whileHover={{ scale: isLoading ? 1 : 1.02 }}
  whileTap={{ scale: isLoading ? 1 : 0.98 }}
  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? (
    <span className="flex items-center justify-center">
      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
      Loading...
    </span>
  ) : (
    "Submit"
  )}
</motion.button>
```

### Complete Card Example

```tsx
<Card className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
  <div className="flex items-center space-x-4 mb-4">
    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
      <Icon className="w-6 h-6 text-blue-700" />
    </div>
    <div>
      <h3 className="text-lg font-bold text-foreground">Card Title</h3>
      <p className="text-sm text-muted-foreground">Card description</p>
    </div>
  </div>
  <p className="text-sm text-foreground">Card content goes here.</p>
</Card>
```

---

## 📝 Maintenance & Updates

### When to Update This Document

- Adding new color tokens
- Introducing new component patterns
- Changing spacing scale
- Adding new animation patterns
- Major design system changes

### Version History

- **v1.0** - Initial design system documentation
  - Based on OKLCH color system
  - Professional blue theme
  - Glassmorphic design patterns
  - Framer Motion integration

---

## ✅ Checklist for New Components

When creating a new component, ensure:

- [ ] Uses CSS variable colors (not raw values)
- [ ] Follows spacing scale (p-4, gap-4, etc.)
- [ ] Uses consistent border radius (rounded-xl for cards)
- [ ] Includes hover states and transitions
- [ ] Is responsive (mobile-first)
- [ ] Works in both light and dark mode
- [ ] Uses semantic HTML
- [ ] Includes proper ARIA labels if interactive
- [ ] Follows animation guidelines (if animated)
- [ ] Uses existing shadcn/ui components when possible

---

**Last Updated**: 2024
**Maintained By**: Development Team
