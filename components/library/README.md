# Library Components

## Overview

The Library page displays a grid of prompt cards with filtering and search capabilities. All components follow a strict pixel specification to prevent visual entropy.

## Components

### PromptCard

Displays a single prompt with hover-reveal metadata.

```tsx
import { PromptCard } from './PromptCard'

<PromptCard
  data={{
    id: '1',
    title: 'My Prompt',
    description: 'Description here',
    primaryAction: 'view',
    modality: 'text',
    trust: 'verified',
    status: 'published',
  }}
  onClick={() => {}}
/>
```

**Strict Specs:**
- Height: 156px (fixed)
- Padding: 16px
- Border radius: 16px
- Hover: translateY(-2px), 150ms

### TrustBadge

Displays trust level with tooltip.

```tsx
import { TrustBadge } from './TrustBadge'

<TrustBadge level="verified" />
<TrustBadge level="gold" size="md" showLabel={false} />
```

**Strict Specs:**
- Height: 20px
- Padding: 8px horizontal
- Tooltip delay: 250ms
- Tooltip width: 240px

### LibraryViewTabs

Segmented control for view selection.

```tsx
import { LibraryViewTabs } from './LibraryViewTabs'

<LibraryViewTabs
  activeView="all"
  onViewChange={(view) => setView(view)}
/>
```

**Strict Specs:**
- Button height: 32px
- Padding: 12px horizontal
- Font size: 13px
- Shape: pill (rounded-full)

### FilterDrawer

Right-side drawer for filtering.

```tsx
import { FilterDrawer } from './FilterDrawer'

<FilterDrawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  filters={filters}
  onFiltersChange={setFilters}
  availableTags={tags}
  availableProviders={providers}
  availableLanguages={languages}
/>
```

**Strict Specs:**
- Width: 360px
- Overlay: 50% opacity
- Footer height: 56px

### LibraryClient

Main library page client component.

**Strict Specs:**
- Max width: 1200px
- Grid columns: 3/2/1 at 1280/900/0px
- Grid gap: 20px

## UI Tokens

All dimensions are defined in `uiTokens.ts`. Import from there:

```tsx
import { CARD, GRID, TRUST_BADGE } from './uiTokens'

// Use token values
const height = CARD.HEIGHT // 156

// Use Tailwind classes
import { CARD_CLASSES, GRID_CLASSES } from './uiTokens'
className={CARD_CLASSES.base}
```

## Dev Warnings

During development, violations are logged to the console:

```tsx
import { useCardHeightWarning, useGridColumnWarning } from './devWarnings'

// In your component
const cardRef = useRef<HTMLDivElement>(null)
useCardHeightWarning(cardRef)
```

Warnings include:
- Card height !== 156px
- Grid column count mismatch at breakpoints
- More than 2 tags displayed on hover
- Drawer width !== 360px

## Test IDs

All components have data-testid attributes:

| Component | Test ID |
|-----------|---------|
| Grid container | `library-grid` |
| Prompt card | `prompt-card` |
| Trust badge | `trust-badge` |
| Filter drawer | `filter-drawer` |
| View tabs | `library-tabs` |

## File Structure

```
components/library/
  PromptCard.tsx      # Card component
  TrustBadge.tsx      # Trust badge with tooltip
  LibraryViewTabs.tsx # Segmented control
  FilterDrawer.tsx    # Filter panel
  LibraryClient.tsx   # Main client component
  LibraryPageWrapper.tsx # Sidebar + content wrapper
  uiTokens.ts         # Dimension/typography tokens
  devWarnings.ts      # Dev-only spec warnings
  README.md           # This file
```

## Visual Regression Testing

See `docs/ui/library-visual-regression-checklist.md` for manual testing steps.
