# Design System Document: The High-End Editorial Admin

## 1. Overview & Creative North Star: "The Crimson Authority"

This design system is not a mere utility; it is a high-performance editorial engine. Moving away from the generic "dashboard" aesthetic, we embrace **The Crimson Authority**—a North Star that prioritizes bold, intentional whitespace, high-contrast typography, and a commanding use of red to guide the eye. 

We break the "template" look by rejecting the rigid 1px border. Instead, we use **Tonal Depth** and **Asymmetric Balance**. This system treats data like a luxury magazine layout: information is grouped by proximity and subtle shifts in surface tone rather than being "caged" in boxes. The result is a layout that feels breathable, expensive, and authoritative.

---

## 2. Colors: Tonal Architecture

Our palette is anchored by the vibrant `primary` (#b70011), but its power is derived from the "No-Line" Rule.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. 
Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a sophisticated boundary that feels integrated, not forced.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine paper. 
- **Base Layer:** `surface` (#fff8f7) for the main application background.
- **Secondary Layer:** `surface-container-low` (#fff0ee) for sidebar navigation or secondary content zones.
- **Tertiary Layer:** `surface-container-highest` (#fbdbd7) for small interactive utility panels.
- **The "Hero" Surface:** `surface-container-lowest` (#ffffff) used for main content cards to create a "pop" against the warmer base.

### The "Glass & Gradient" Rule
To avoid a flat, "out-of-the-box" look:
- **Floating Elements:** Use `surface` with a 80% opacity and a `24px` backdrop-blur for modals and dropdowns.
- **Signature Textures:** For high-impact CTAs, use a subtle linear gradient: `primary` (#b70011) to `primary-container` (#dc2626) at a 135-degree angle. This adds a "soul" to the red that flat hex codes cannot achieve.

---

## 3. Typography: The Editorial Scale

We use **Inter** not just for legibility, but as a structural element. 

- **Display & Headlines:** Use `display-md` (2.75rem) for high-level metrics. Keep tracking tight (-0.02em) to maintain a "bold editorial" feel.
- **Title & Subtitles:** `title-lg` (1.375rem) should be used for section headers. Always pair these with generous top-padding to let the section "breathe."
- **Body & Labels:** `body-md` (0.875rem) is our workhorse. For labels (`label-md`), use `on-surface-variant` (#5c403c) to create a clear hierarchy between metadata and primary data.

**The Typographic Anchor:** Always align headline text with the start of your primary content grid. Use the high contrast between `on-background` (#281715) and the vibrant `primary` red to draw attention to "Live" or "Active" statuses.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are a last resort. We convey hierarchy through the **Layering Principle**.

- **Ambient Shadows:** When an element must float (e.g., a primary action menu), use an extra-diffused shadow: `offset: 0 12px, blur: 32px, color: rgba(40, 23, 21, 0.06)`. Note the use of our `on-surface` color in the shadow to keep it natural and "warm" rather than a dead grey.
- **The "Ghost Border" Fallback:** If a border is essential for accessibility in complex data tables, use `outline-variant` (#e6bdb8) at **20% opacity**. 100% opaque borders are forbidden.
- **Glassmorphism:** Use semi-transparent `surface_container_lowest` for floating headers. As the user scrolls, the content softly bleeds through, creating a sense of depth and continuity.

---

## 5. Components: Precision Primitives

### Buttons
- **Primary:** Gradient-filled (`primary` to `primary-container`), `ROUND_EIGHT` (0.5rem), white text.
- **Secondary:** `surface-container-high` background with `primary` text. No border.
- **Tertiary:** Transparent background, `primary` text, bold weight.

### Input Fields
- **Container:** `surface-container-low`.
- **Active State:** On focus, the background shifts to `surface-container-lowest` with a 2px `primary` bottom-indicator only. Avoid the "boxed-in" focus ring.

### Cards & Lists (The Divider-Less Rule)
- **Cards:** Never use a border. Use `surface-container-lowest` against a `surface` background. 
- **Lists:** Forbid divider lines. Use `16px` of vertical white space to separate list items. For hovering states, use a subtle shift to `surface-container-high`.

### Chips
- **Action Chips:** `primary-fixed` (#ffdad6) background with `on-primary-fixed` (#410002) text. This provides a soft, sophisticated alternative to high-vibrancy fills for secondary information.

---

## 6. Do’s and Don’ts

### Do
- **Do** use `primary` red for active states, icons, and primary CTAs only. 
- **Do** lean into the `ROUND_EIGHT` (0.5rem) corner radius for a modern, approachable feel.
- **Do** use `tertiary` (#005e8d) sparingly for informative or "Neutral" system updates (e.g., "Draft" or "Pending").

### Don't
- **Don't** use pure black (#000000). Use `on-surface` (#281715) for all high-contrast text.
- **Don't** use standard 1px borders. If you feel the need for a line, try using a 4px background color shift instead.
- **Don't** crowd the interface. If a screen feels busy, increase the whitespace between sections by 20%.

---

## 7. Signature Interaction: The Crimson Trace
When a user interacts with a navigational element, the "Active" state should not just be a color change. Use a `4px` vertical "pill" of `primary` red to the left of the item, combined with a subtle `primary-fixed` background tint. This "Crimson Trace" creates a consistent, high-end trail of movement throughout the admin experience.