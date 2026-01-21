# MeeMa Color System

Single source of truth for all colors with strict role separation.

## Color Roles

### 1. Brand (Coral)
**Purpose**: Identity, highlights, primary CTAs
**Use for**: "Save", "Upgrade", "Continue", "Sign Up", brand moments
**Classes**: `bg-brand`, `text-brand`, `ring-brand`, `border-brand`

### 2. Action (Spotify Green)
**Purpose**: Execute controls ONLY
**Use for**: "Play", "Run", "Try", "Preview" - moments that execute/generate
**Classes**: `bg-action`, `text-action` (via ActionButton component)
**❌ Do NOT use for**: Navigation, headings, general CTAs, success states

### 3. Status
**Purpose**: System feedback
**Use for**: Success/warning/error indicators, validation results
**Classes**: `bg-status-success`, `text-status-success`, `bg-status-warning`, `text-status-warning`, `bg-status-error`, `text-status-error`

### 4. Neutral
**Purpose**: Surfaces, text, borders
**Classes**: `bg-surface`, `bg-surface-2`, `bg-surface-3`, `text-foreground`, `text-muted`, `border-border`

## Rules

### ✅ Correct Usage

```tsx
// Action moments - Use ActionButton
import ActionButton from '@/components/actions/ActionButton'

<ActionButton variant="run">Run Prompt</ActionButton>
<ActionButton variant="play">Play</ActionButton>
<ActionButton variant="preview">Preview</ActionButton>

// Brand CTAs
<Button variant="primary">Upgrade to Pro</Button> // Uses brand color
<button className="bg-brand hover:bg-brand-hover text-white">Save</button>

// Status feedback
<div className="bg-status-success/10 text-status-success border border-status-success/30">
  <CheckIcon /> Verified
</div>

<div className="bg-status-warning/10 text-status-warning border border-status-warning/30">
  <AlertIcon /> Warning
</div>
```

### ❌ Incorrect Usage

```tsx
// ❌ Don't use action green for navigation
<nav className="text-action">...</nav>

// ❌ Don't use action green for success states
<Badge className="bg-action">Success</Badge>

// ❌ Don't use direct green utilities
<div className="text-green-500">...</div>
<div className="bg-emerald-400">...</div>

// ❌ Don't use action token outside ActionButton
<button className="bg-action">Save</button>

// ❌ Don't use hardcoded hex values
<div style={{color: '#1DB954'}}>...</div>
```

## Components

### ActionButton (Execute controls only)
Located at: `/components/actions/ActionButton.tsx`

```tsx
import ActionButton from '@/components/actions/ActionButton'

<ActionButton variant="play">Play</ActionButton>
<ActionButton variant="run">Run</ActionButton>
<ActionButton variant="preview">Preview</ActionButton>
<ActionButton variant="try">Try it</ActionButton>
```

### ActionIconButton (Compact execute icon buttons)
Located at: `/components/actions/ActionIconButton.tsx`

```tsx
import ActionIconButton from '@/components/actions/ActionIconButton'

<ActionIconButton
  icon={<Play className="w-4 h-4" />}
  aria-label="Run workflow"
  onClick={handleRun}
/>
```

### Button (General CTAs)
Located at: `/components/ui/Button.tsx`

```tsx
import Button from '@/components/ui/Button'

<Button variant="primary">Upgrade</Button>     // Uses brand color
<Button variant="secondary">Cancel</Button>    // Neutral
<Button variant="ghost">Reset</Button>         // Transparent
<Button variant="action">Run</Button>          // Action green (prefer ActionButton)
```

## Migration Guide

### Old → New
- `bg-accent` → `bg-brand` (for CTAs) or `<ActionButton>` (for execute moments)
- `text-green-500` → `text-status-success` (for success states)
- `bg-green-500/20 text-green-400` → `bg-status-success/10 text-status-success`
- `bg-spotify-green` → `<ActionButton>` component
- `ring-accent` → `ring-brand` or `ring-action` (depends on context)

### Common Patterns

**Success Indicators:**
```tsx
// Old
<div className="bg-green-500/20 text-green-400 border-green-500/30">

// New
<div className="bg-status-success/10 text-status-success border-status-success/30">
```

**Action Buttons:**
```tsx
// Old
<button className="bg-spotify-green text-black hover:bg-spotify-greenhover">
  Generate Prompt
</button>

// New
<ActionButton variant="run">Generate Prompt</ActionButton>
```

**Primary CTAs:**
```tsx
// Old
<Button variant="primary"> // Was using green accent

// New (automatically updated)
<Button variant="primary"> // Now uses coral brand
```

## Enforcement

Run the color linter to check for violations:

```bash
npm run lint:colors
```

The linter will fail on:
- Direct green utilities (`text-green-*`, `bg-green-*`, `border-green-*`)
- Direct emerald utilities (`text-emerald-*`, `bg-emerald-*`)
- Hardcoded hex values (`#1DB954`, `#1cd760`, `#2ae174`)
- Action token usage outside `/components/actions/`

## Token Reference

### Tailwind Classes
```css
/* Brand (Coral) */
bg-brand              → #FF6B6B
bg-brand-hover        → #FF5252
bg-brand-active       → #FF3838
text-brand
border-brand

/* Action (Spotify Green) */
bg-action             → #1DB954
bg-action-hover       → #1ed760
bg-action-active      → #1aa34a
text-action
border-action

/* Status */
bg-status-success     → #10b981 (emerald-500)
text-status-success
border-status-success
bg-status-warning     → #f59e0b (amber-500)
text-status-warning
bg-status-error       → #ef4444 (red-500)
text-status-error

/* Neutral */
bg-surface            → #141414
bg-surface-2          → #1a1a1a
bg-surface-3          → #242424
text-foreground       → #ffffff
text-muted            → #a0a0a0
border-border         → #2a2a2a
```

### CSS Variables
```css
:root {
  /* Brand */
  --brand: #FF6B6B;
  --brand-hover: #FF5252;
  --brand-active: #FF3838;

  /* Action */
  --action: #1DB954;
  --action-hover: #1ed760;
  --action-active: #1aa34a;

  /* Status */
  --status-success: #10b981;
  --status-warning: #f59e0b;
  --status-error: #ef4444;

  /* Neutral */
  --background: #0a0a0a;
  --surface: #141414;
  --surface-2: #1a1a1a;
  --surface-3: #242424;
  --border: #2a2a2a;
  --text: #ffffff;
  --text-muted: #a0a0a0;
}
```

## Philosophy

This color system enforces **semantic clarity** through strict role separation:

1. **Brand** - Warm coral for identity and general CTAs
2. **Action** - Spotify green ONLY for execute moments (Play/Run/Try/Preview)
3. **Status** - Separate colors for system feedback
4. **Neutral** - Soft dark surfaces and text

By restricting Spotify green to execute-only actions, we create a visual language where green always means "this will run/execute something" - never navigation, branding, or status.

## Questions?

- **"Can I use green for success badges?"** → No, use `status-success` (emerald)
- **"Can I use action color for navigation?"** → No, use `brand` or neutral colors
- **"Can I use action color outside ActionButton?"** → No, the linter will catch this
- **"What if I need a custom execute button?"** → Extend ActionButton or use Button with `variant="action"`
