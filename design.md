# The Design System: Editorial Precision for Hangul Tajawang

## 1. Overview & Creative North Star: "The Rhythmic Scholar"

This design system moves away from the clinical, "boxed-in" feel of traditional educational software. Instead, it adopts the Creative North Star of **"The Rhythmic Scholar."** This vision blends the playful fluidity of typing with the sophisticated structure of modern Korean editorial design.

We achieve this through **Intentional Asymmetry** and **Tonal Depth**. By leaning into high-contrast typography scales and overlapping layouts, we create a sense of forward motion—mirroring the speed and rhythm of a master typist. We bypass the "template" look by treating the UI as a series of physical layers rather than a flat grid, using soft light and color shifts to guide the user’s eye without the clutter of lines.

---

## 2. Color & Surface Philosophy

The palette is a sophisticated blend of vibrant blues and deep teals, supported by a rich range of surface tones that provide warmth and "soul."

### The "No-Line" Rule

To maintain a premium, high-end feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through:

- **Background Color Shifts:** A `surface-container-low` section sitting on a `surface` background.
- **Tonal Transitions:** Using subtle shifts in the surface hierarchy to denote change.

### Surface Hierarchy & Nesting

Treat the UI as a stack of fine paper. Each inner container should use a slightly higher or lower tier to define its importance:

- **Surface:** The base layer (f9f9ff).
- **Surface-Container-Lowest:** Used for the most elevated cards (ffffff).
- **Surface-Container-Highest:** Used for background accents or secondary "well" areas (dce2f3).

### The Glass & Gradient Rule

Floating elements (modals, active typing stats) should utilize **Glassmorphism**. Use semi-transparent surface colors with a `backdrop-blur` effect to allow the vibrant primary colors to bleed through, softening the layout.

- **Signature Texture:** For Hero sections and primary CTAs, apply a subtle linear gradient from `primary` (#004ac6) to `primary_container` (#2563eb) at a 135-degree angle.

---

## 3. Typography: Editorial Authority

The typography system uses **Plus Jakarta Sans** for high-impact display moments and **Inter** for functional reading. For Korean characters (Hangul), ensure a modern, high-legibility sans-serif is used with a tracking (letter-spacing) of -0.02em to maintain a tight, professional look.

- **Display-LG (3.5rem):** Reserved for "Flow State" milestones (e.g., reaching 100 WPM).
- **Headline-MD (1.75rem):** Used for lesson titles. The bold weight of Plus Jakarta Sans creates a confident, educational tone.
- **Title-SM (1rem):** The workhorse for metadata and user rankings.
- **Body-LG (1rem):** The primary typing text. Optimized for high legibility with a line-height of 1.6 to prevent eye fatigue.

---

## 4. Elevation & Depth: Tonal Layering

We avoid the "card-on-gray" cliché. Depth is achieved through **Tonal Layering**.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift without a shadow.
- **Ambient Shadows:** For floating elements like the "Typing Stats Pop-over," use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(21, 28, 39, 0.06);`. The shadow color is a tinted version of `on-surface` (#151c27).
- **The Ghost Border Fallback:** If a border is required for accessibility, use the `outline-variant` token (#c3c6d7) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Typing Area (The Arena)

- **Base:** A large `surface-container-lowest` area with an `xl` (1.5rem) roundedness.
- **Current Word:** Highlighted with a `secondary_container` background and `on_secondary_container` text.
- **Caret:** A 3px thick vertical bar using the `tertiary` (#784b00) color to ensure it stands out against the blue-heavy palette.

### Buttons & Interaction

- **Primary:** Gradient background (`primary` to `primary_container`), `full` roundedness. No shadow at rest; subtle `surface_tint` glow on hover.
- **Secondary:** `surface-container-high` background with `primary` text. Moves to `surface-container-highest` on hover.
- **Tertiary:** Pure text with `primary` color. Use for "Skip Lesson" or "View All."

### User Rankings (The Leaderboard)

- **Constraint:** **No Dividers.** Use vertical white space (`spacing-4`) and alternating background shifts between `surface` and `surface-container-low` to separate users.
- **Top 3:** Apply a `glassmorphism` effect with a `primary_fixed` tinted blur to denote prestige.

### Progress Tracking

- **The "Pulse" Indicator:** Use a circular progress ring with a `primary` stroke and `primary_fixed` background.
- **Chips:** For "Speed" or "Accuracy" badges, use `secondary_fixed` containers with `sm` (0.25rem) roundedness to keep them feeling modern and architectural.

### Input Fields

- **Default State:** `surface-container-highest` background, no border.
- **Focus State:** `outline` ghost border (20% opacity) and a subtle `surface_tint` inner glow.

---

## 6. Do’s and Don’ts

### Do

- **Do** use `20` (5rem) spacing for major section breaks to let the Hangul characters breathe.
- **Do** overlap images or text elements to break the "web page" feel and create a "magazine" layout.
- **Do** use the `tertiary` (amber/gold) color sparingly—only for high-value feedback like "Perfect Accuracy" or "New Personal Best."

### Don’t

- **Don't** use black (#000000). Use `on_surface` (#151c27) for text to maintain a premium softness.
- **Don't** use standard "Drop Shadows." If it looks like a 2010s app, the blur isn't high enough or the opacity is too high.
- **Don't** use vertical lines to separate navigation items. Use `spacing-6` and clear typographic weight shifts instead.
- **Don't** use `none` roundedness. Even the most professional elements should have at least a `sm` (0.25rem) radius to feel approachable and educational.
