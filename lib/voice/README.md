# MeeMa Voice System

Single source of truth for all user-facing copy in the MeeMa application.

## Quick Start

```typescript
import { LIBRARY, UI } from '@/lib/voice/voice'

// Use in components
<h1>{LIBRARY.pageTitle}</h1>
<button>{UI.buttons.copy}</button>
```

## Voice Guidelines

### Core Principles
- **Short & punchy**: Use fragments, line breaks. No long explanations.
- **You language**: Speak directly to the creator.
- **Action-first**: Start with verbs (Make, Try, Copy, Run it)
- **Calm & encouraging**: Never urgent, never stressed.
- **Slightly playful**: But not silly or cute.

### Forbidden Words
Never use: leverage, optimize, pipeline, architecture, robust, advanced,
enterprise, infrastructure, modality, validation checks, schema, utilize,
facilitate, implement, configuration, initialize.

### Preferred Words
Use: make, use, try, copy, run, save, remix, post, clip, check, fix.

### Examples

#### Good
- "Copy prompt"
- "Try a remix."
- "Start with something simple."
- "Something didn't load. Try again."

#### Bad
- "Copy prompt to clipboard" (over-explaining)
- "Leverage our remix functionality to optimize..." (jargon)
- "Utilize the following workflow to facilitate..." (passive, jargon)
- "Production-ready AI integration snippets" (too technical)

## File Structure

```
/lib/voice/
├── voice.ts       # All copy strings
├── helpers.ts     # Parameterized helpers
├── lint.ts        # Voice linter
├── toast.ts       # Toast notifications
└── README.md      # This file
```

## Copy Organization

Copy is organized by **surface** (feature area):

- `BRAND` - App name, tagline, footer
- `UI` - Global buttons, status messages, empty states
- `NAV` - Navigation, sidebar, menus
- `LANDING` - Landing page hero
- `LIBRARY` - Library page, search, filters
- `PROMPT_TEST` - PromptTest tool
- `REMIX` - Remix modal
- `PRICING` - Pricing page
- `ERRORS` - Error states, 404, loading
- `TOASTS` - Toast notifications
- `AUTH` - Sign in, sign up (future)
- `TRUST` - Trust badges, QA (migrated from trustCopy.ts)

## Adding New Copy

1. **Add to voice.ts**:
   ```typescript
   export const MY_FEATURE = {
     title: 'My Feature',
     subtitle: 'Short description.',
   } as const
   ```

2. **Import in component**:
   ```typescript
   import { MY_FEATURE } from '@/lib/voice/voice'
   ```

3. **Run linter**:
   ```bash
   npm run lint:copy
   ```

4. **Fix any violations** before committing.

## Linting

The voice linter checks:
- **Forbidden words** (jargon)
- **Sentence length** (>110 chars)
- **Voice patterns** (passive voice, over-explaining)
- **Branding** (old "Prompt Toolkit" references)

Run manually:
```bash
npm run lint:copy
```

Auto-runs in CI on `npm run build`.

## Migration from Old Copy

Old pattern:
```typescript
<button>Copy to clipboard</button>
```

New pattern:
```typescript
import { UI } from '@/lib/voice/voice'
<button>{UI.buttons.copy}</button>
```

### Backward Compatibility

Old trust copy imports still work:
```typescript
import { TRUST_STATUS_LABELS } from '@/lib/trust/trustCopy'
```

But are deprecated. Update to:
```typescript
import { TRUST } from '@/lib/voice/voice'
const labels = TRUST.status
```

## Standard Components

Use these components to enforce voice patterns:

- **EmptyState**: Empty states with consistent voice
- **ErrorNotice**: Error messages with retry actions
- **InlineHint**: Secondary help text
- **showToast**: Toast notifications

```typescript
import EmptyState from '@/components/ui/EmptyState'
import { LIBRARY } from '@/lib/voice/voice'

<EmptyState
  title={LIBRARY.search.noResults.title}
  subtitle={LIBRARY.search.noResults.hint}
/>
```
