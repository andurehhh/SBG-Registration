# UI Design System

## Visual Identity

Based on the official SBG Transition branding. The aesthetic is a **dark, grid-based, monospace builder** style — inspired by AWS's developer tooling and the SBG rebranding materials.

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `sbg-black` | `#0f1117` | Page backgrounds, deepest surfaces |
| `sbg-navy` | `#1a1f2e` | Cards, sidebars, nav, secondary surfaces |
| `sbg-navy-light` | `#252b3b` | Elevated cards, hover states on dark surfaces |
| `sbg-purple` | `#7C3AED` | Primary CTA buttons, active states, key accents |
| `sbg-purple-light` | `#8B5CF6` | Hover states, secondary accents, highlights |
| `sbg-purple-muted` | `#3b2f6e` | Subtle purple backgrounds, badge fills |
| `sbg-orange` | `#FF9900` | AWS logo only, secondary warm accent |
| `sbg-white` | `#FFFFFF` | Grid cells, high-contrast text, borders |
| `sbg-gray` | `#F2F3F3` | Light mode neutral backgrounds (avoid on dark) |
| `sbg-text` | `#E2E8F0` | Body text on dark backgrounds |
| `sbg-text-muted` | `#94A3B8` | Secondary/muted text on dark backgrounds |

### Usage Rules
- **Dark backgrounds are the default** — `sbg-black` for pages, `sbg-navy` for cards/panels
- **Purple is the primary action color** — replaces orange for buttons and active states
- **Orange is reserved for the AWS logo mark only**
- **White grid lines** are a core decorative motif — use as subtle background patterns
- Never use light gray (`sbg-gray`) as a page background in the main UI — it's only for light-mode fallbacks

---

## Typography

### Font: Space Mono
- **Source**: Google Fonts — `https://fonts.google.com/specimen/Space+Mono`
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap')`
- **Usage**: All headings, labels, badges, monospace data (student numbers, SBG IDs)

### Font: Inter
- **Source**: Google Fonts
- **Usage**: Body text, form inputs, paragraphs, descriptions — for readability at small sizes

### Type Scale Rules
- **Page titles / H1**: Space Mono, bold, white, large (2xl–4xl)
- **Section headings / H2–H3**: Space Mono, bold, white or purple
- **Labels / badges / metadata**: Space Mono, regular, muted
- **Body / descriptions**: Inter, regular, `sbg-text` (`#E2E8F0`)
- **Student numbers / SBG IDs / codes**: Space Mono, always monospace

---

## Grid Pattern

The grid is a **core visual motif** from the SBG branding. Apply it as:
- A subtle SVG background pattern on hero sections and dark panels
- White lines at low opacity (`opacity-5` to `opacity-10`) on dark backgrounds
- Purple accent squares scattered in the grid for visual interest

```css
/* Grid pattern SVG */
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='32' height='32' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 32 0 L 0 0 0 32' fill='none' stroke='white' stroke-width='0.5' opacity='0.15'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E");
```

---

## Component Rules

### Buttons
- **Primary**: Purple background (`sbg-purple`), white text, 8px radius
- **Hover**: `sbg-purple-light`
- **Outline**: Purple border, purple text, transparent background
- **Danger**: Red-600, white text
- **Ghost**: Transparent, white/muted text, subtle hover

### Cards / Panels
- Background: `sbg-navy` (`#1a1f2e`)
- Border: `1px solid rgba(255,255,255,0.08)` — subtle white border
- Border radius: 8px
- No drop shadows on dark surfaces — use border instead

### Inputs
- Background: `sbg-navy-light` (`#252b3b`)
- Border: `rgba(255,255,255,0.12)`
- Focus ring: Purple (`sbg-purple`)
- Text: white
- Placeholder: `sbg-text-muted`

### Badges / Status Pills
- Dark background variants — no light pastels
- Pending: purple-muted bg, purple text
- Approved: dark green bg, green text
- Inactive: dark gray bg, muted text
- Rejected: dark red bg, red text
- Removed: very muted, strikethrough

### Navigation / Sidebar
- Background: `sbg-black` (`#0f1117`)
- Active item: Purple background block
- Inactive items: Muted white text, purple hover

---

## Dark / Light Mode

- **Default**: Dark mode (`#0f1117` background)
- **Toggle**: Class-based — adding `light` to `<html>` switches to light mode
- **Persistence**: Saved to `localStorage` via `ThemeProvider`
- **Toggle component**: `<ThemeToggle />` — placed in every navbar and the admin sidebar
- **Grid pattern**: Present in both modes — white lines on dark, dark lines on light (via `--grid-stroke` CSS variable)
- **Purple accent**: Primary action color in both modes — buttons, active states, focus rings

## CSS Variables (semantic tokens)

All surfaces and text use CSS variables so they flip automatically:

| Variable | Dark | Light |
|---|---|---|
| `--color-bg` | `#0f1117` | `#f8f9fc` |
| `--color-surface` | `#1a1f2e` | `#ffffff` |
| `--color-surface-raised` | `#252b3b` | `#f0f2f8` |
| `--color-border` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` |
| `--color-text-primary` | `#E2E8F0` | `#0f1117` |
| `--color-text-secondary` | `#94A3B8` | `#4b5563` |

Use Tailwind utility classes: `bg-page`, `bg-surface`, `bg-surface-raised`, `text-primary`, `text-secondary`, `border-theme`

- **Dark-first**: All pages default to dark backgrounds
- **Grid motif**: Hero sections and key panels use the SVG grid background
- **High contrast**: White or near-white text on all dark surfaces
- **Monospace headings**: All titles use Space Mono for the "builder" feel
- **Purple accents**: Scattered purple blocks/squares echo the SBG slide design
- **8px border radius**: Consistent across all interactive elements
- **Heavy white space**: Generous padding inside cards and sections
