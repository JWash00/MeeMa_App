# Meema Library Components — Contract (STRICT)

This folder implements the Meema Library v2 UI. The Library has a strict pixel contract. Any deviation is considered a visual regression unless explicitly approved.

## Principles
- Progressive disclosure: default cards show **only** outcome + trust + primary action.
- Metadata (provider/language/tags) is hidden by default and revealed on hover (desktop) or detail view.
- Cards are uniform height. The grid is capped at 3 columns.

---

## Pixel Contract (Non-negotiable)

### Layout
- Max content width: **1200px**
- Page padding: **32px desktop / 24px tablet / 16px mobile**
- Sidebar: **260px width**, **16px padding**
- Grid columns:
  - **>=1280px:** 3 columns
  - **900–1279px:** 2 columns
  - **<900px:** 1 column
- Grid gap: **20px**

### PromptCard v2
- Fixed height: **156px** (`min=max=156px`)
- Padding: **16px**
- Radius: **16px**
- Border: **1px rgba(255,255,255,0.08)**
- Default card content:
  - Title (16px/600, clamp-1)
  - Description (13px, opacity 72%, clamp-2)
  - Footer (36px): TrustBadge + Primary Action (+ favorite)
- Hover (desktop only):
  - translateY(-2px), 150ms ease-out
  - shadow: 0 6px 20px rgba(0,0,0,0.25)
  - metadata row (height 22px) appears between description and footer:
    - provider icon+label
    - language chip
    - max 2 tags (truncate; no wrap)

### TrustBadge
- Height: **20px**, padding **8px**, radius **999px**
- Font: **12px**, weight **500**
- Tooltip: width **240px**, font **12px**, delay **250ms**, max 3 lines

### Filter Drawer
- Width: **360px**
- Padding: **16px**
- Overlay opacity: **50%**
- Footer height: **56px**

### Motion
- No animation >150ms
- No bounce/elastic
- Only opacity + translateY allowed (buttons may scale; cards may not)

### Mobile overrides
- No hover metadata
- Card height remains 156px
- Primary action full-width
- Favorite hidden by default

---

## Files and Responsibilities

### `uiTokens.ts`
Single source of truth for pixel constants and motion constraints.
- No magic numbers elsewhere.
- If you need a new pixel value, add it here and document why.

### `PromptCard.tsx`
Renders a strict-height card with progressive metadata disclosure.
- Must never show tag clouds.
- Must never exceed 2 tags on hover metadata row.

### `TrustBadge.tsx`
Displays Basic/Verified/Gold trust levels with tooltip copy.

### `FilterDrawer.tsx`
Right drawer (or bottom sheet on mobile if implemented) for advanced filters.
- Drawer width must remain 360px on desktop.

### `LibraryViewTabs.tsx`
Segmented control: All / Use Cases / Modalities / Collections.

---

## Allowed Changes (Safe)
- Copy text changes (labels, placeholder text)
- Adding new filter types inside the drawer
- Adding new views in tabs (requires design review if it impacts layout)
- Updating tooltip copy (keep <=3 lines)

## Disallowed Changes (Requires Design Review)
- Card height/padding/radius changes
- Grid columns >3
- Persistent provider/language/tags on default card
- Introducing new bright/saturated colors inside cards
- Adding new always-visible UI rows above the grid

---

## Testing Hooks
Key elements must include these data attributes:
- `data-testid="library-grid"`
- `data-testid="prompt-card"`
- `data-testid="trust-badge"`
- `data-testid="filter-drawer"`
- `data-testid="library-tabs"`

---

## Visual Regression Policy
All PRs touching these components must run through:
- `docs/ui/library-visual-regression-checklist.md`

If you are unsure, ask for review before merging.
