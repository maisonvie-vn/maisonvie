---
name: Premium Glass CRM
colors:
  surface: '#fff8f3'
  surface-dim: '#e1d9cf'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2e8'
  surface-container: '#f6ece3'
  surface-container-high: '#f0e7dd'
  surface-container-highest: '#eae1d7'
  on-surface: '#1f1b15'
  on-surface-variant: '#4f4637'
  inverse-surface: '#343029'
  inverse-on-surface: '#f8efe5'
  outline: '#817665'
  outline-variant: '#d2c5b1'
  surface-tint: '#7b5800'
  primary: '#7b5800'
  on-primary: '#ffffff'
  primary-container: '#c89a3d'
  on-primary-container: '#4b3400'
  inverse-primary: '#f1bf5e'
  secondary: '#605e59'
  on-secondary: '#ffffff'
  secondary-container: '#e6e2db'
  on-secondary-container: '#66645f'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#a0a1a1'
  on-tertiary-container: '#363838'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdea6'
  primary-fixed-dim: '#f1bf5e'
  on-primary-fixed: '#271900'
  on-primary-fixed-variant: '#5d4200'
  secondary-fixed: '#e6e2db'
  secondary-fixed-dim: '#c9c6c0'
  on-secondary-fixed: '#1c1c18'
  on-secondary-fixed-variant: '#484742'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fff8f3'
  on-background: '#1f1b15'
  surface-variant: '#eae1d7'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 280px
  header-height: 72px
  container-padding: 32px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is centered on the concept of "Ethereal Luxury." It balances the high-end, traditional nature of bird’s nest products with a modern, high-performance CRM interface. The aesthetic marries **Minimalism** with **Glassmorphism**, creating a workspace that feels light, spacious, and premium.

**Target Audience:** High-net-worth management and professional sales teams.
**Emotional Response:** Trustworthy, organized, prestigious, and calm.

The visual signature relies on a "Frosted Golden Hour" look—using semi-transparent layers to let the warm cream background bleed through, accented by sharp, authoritative golden details. White space is treated as a luxury asset, ensuring the UI never feels cluttered despite the data-heavy nature of a CRM.

## Colors

The palette is a sophisticated blend of organic warmth and sterile precision.

- **Primary (#C89A3D):** A refined Gold/Amber used for call-to-actions, status indicators, and key highlights. It represents the premium nature of "Yến Sào."
- **Background (#F9F5EE):** A warm, parchment-like cream that serves as the canvas. It is softer on the eyes than pure white, enhancing the luxury feel.
- **Surface (Glass):** Semi-transparent White (`rgba(255, 255, 255, 0.65)`) with a high backdrop-blur (20px-30px).
- **Neutrals:** Grays are infused with a hint of brown/warmth to maintain harmony with the cream background, avoiding a cold, clinical tech-look.

## Typography

This design system utilizes **Inter** exclusively to provide a clean, systematic, and highly legible experience. 

The typographic hierarchy is structured to handle complex Vietnamese diacritics without crowding. Headlines use tighter letter-spacing and heavier weights to command authority. Body text maintains a generous line height (1.5x) to ensure readability during long management sessions. All labels and secondary metadata use an uppercase tracking style to distinguish them from interactive data points.

## Layout & Spacing

The layout follows a **Fixed Sidebar + Fixed Header** structure to facilitate rapid navigation within the CRM.

- **Sidebar:** A narrow, translucent panel fixed to the left. Navigation items are spaced generously to prevent accidental clicks.
- **Top Header:** A glass-morphic bar that contains the search, global notifications, and user profile.
- **Grid:** A 12-column fluid grid system sits within the main content area, which itself has a 32px safety margin.
- **Rhythm:** Spacing follows an 8px base unit. Component interiors typically use 16px or 24px padding to maintain the "airy" minimalist feel.
- **Responsive:** On tablet, the sidebar collapses into an icon-only rail or a hidden drawer. On mobile, the layout switches to a single-column stack with a bottom navigation bar.

## Elevation & Depth

Depth is achieved through **optical layering** rather than traditional heavy shadows.

1.  **Level 0 (Base):** The Cream background (#F9F5EE).
2.  **Level 1 (Glass Surfaces):** Used for main content cards and the sidebar. These have a 65% white opacity, 20px backdrop blur, and a 1px solid white stroke at 40% opacity to define the edge.
3.  **Level 2 (Popovers/Modals):** Floating elements that use a slightly higher opacity (80%) and a soft, wide-dispersion shadow (`0 20px 40px rgba(0,0,0,0.04)`) to simulate physical distance from the base.

The interaction of light through these layers creates a sense of "digital glass" that feels high-end and lightweight.

## Shapes

The design system uses **Rounded (0.5rem / 8px)** as its primary corner radius. This choice provides a friendly yet professional appearance.

- **Standard Elements:** 8px radius for buttons, input fields, and small containers.
- **GlassCards:** 16px (rounded-lg) to emphasize the "object-like" nature of the data containers.
- **Navigation Highlights:** 8px or pill-shaped for active states.

Consistent rounding across all glass surfaces ensures that the reflections and border highlights appear cohesive and modern.

## Components

### GlassCards
The primary container for all CRM data.
- **Style:** Background `rgba(255, 255, 255, 0.6)`, backdrop-filter `blur(12px)`, border `1px solid rgba(255, 255, 255, 0.3)`.
- **Usage:** Used for stats, customer profiles, and order details.

### Buttons
- **Primary:** Solid `#C89A3D` with white text. No shadow, flat and confident.
- **Secondary:** Transparent with a 1px Gold stroke.
- **Tertiary/Ghost:** Plain text with Gold color, used for "Hủy" (Cancel) or minor actions.

### Task Lists
- **Style:** Items are separated by subtle horizontal lines (`1px solid rgba(0,0,0,0.05)`).
- **Checkboxes:** Custom gold-filled square with a white checkmark when active.

### Line Charts (Báo cáo doanh thu)
- **Style:** High-contrast gold lines on a glass background. Use area gradients under the line that fade from `rgba(200, 154, 61, 0.2)` to transparent.

### Input Fields
- **Style:** Glass-morphic fields with a subtle 1px border. On focus, the border transitions to a solid 2px Gold stroke to provide clear feedback.

### Status Chips
- **Hoàn thành (Success):** Soft green background, dark green text.
- **Đang xử lý (Pending):** Soft gold background, dark gold text.
- **Đã hủy (Cancelled):** Soft red background, dark red text.
All chips use a 10% opacity background of their respective colors to keep the palette harmonious.