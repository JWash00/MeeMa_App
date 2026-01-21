# Supabase Schema Updates for PromptKit Phase A

## Overview
This document describes the database schema changes needed to support Phase A features: version numbers, workflows with templates, and enhanced metadata.

## Required Columns

The following columns need to be added to the `snippets` table in your Supabase database:

| Column | Type | Description | Default |
|--------|------|-------------|---------|
| `category` | TEXT | Creator job category (e.g., "YouTube Scripts") | NULL |
| `audience` | TEXT | Target audience: 'creator', 'developer', or 'both' | NULL |
| `type` | TEXT | Prompt type: 'prompt' or 'workflow' | 'prompt' |
| `version` | TEXT | Version number (e.g., "1.0", "1.1") | '1.0' |
| `template` | TEXT | Workflow template with {{placeholders}} | NULL |
| `inputs_schema` | JSONB | Workflow input field definitions | NULL |

## SQL Migration

Run the following SQL commands in your Supabase SQL Editor:

```sql
-- Add new columns to snippets table
ALTER TABLE snippets
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS audience TEXT CHECK (audience IN ('creator', 'developer', 'both')),
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('prompt', 'workflow')) DEFAULT 'prompt',
  ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS template TEXT,
  ADD COLUMN IF NOT EXISTS inputs_schema JSONB;

-- Update existing rows with sensible defaults
UPDATE snippets SET
  audience = 'both',
  type = 'prompt',
  version = '1.0'
WHERE audience IS NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS snippets_category_idx ON snippets(category);
CREATE INDEX IF NOT EXISTS snippets_audience_idx ON snippets(audience);
CREATE INDEX IF NOT EXISTS snippets_type_idx ON snippets(type);
```

## Category Values

Recommended categories for creator-focused prompts:

- **YouTube Scripts** - Video content creation
- **TikTok Content** - Short-form video scripts
- **Email Marketing** - Email campaigns and newsletters
- **Social Media Captions** - Instagram, Twitter, LinkedIn posts
- **Product Descriptions** - E-commerce and product copy
- **Freelance / Client Work** - Client deliverables and proposals

## Inputs Schema Format

For workflow-type prompts, the `inputs_schema` field should be a JSONB object where each key is an input field name, and the value defines the field configuration:

```json
{
  "topic": {
    "label": "Video Topic",
    "type": "text",
    "placeholder": "e.g., How to grow tomatoes",
    "default": ""
  },
  "tone": {
    "label": "Tone",
    "type": "select",
    "options": ["Casual", "Educational", "Entertaining", "Professional"],
    "default": "Educational"
  },
  "description": {
    "label": "Description",
    "type": "textarea",
    "placeholder": "Provide additional context...",
    "default": ""
  }
}
```

### Supported Field Types

- **text** - Single-line text input
- **select** - Dropdown selection (requires `options` array)
- **textarea** - Multi-line text input

### Field Properties

- `label` (required) - Display label for the form field
- `type` (required) - Field type: 'text', 'select', or 'textarea'
- `options` (for select) - Array of string options
- `placeholder` (optional) - Placeholder text
- `default` (optional) - Default value

## Template Format

Workflow templates use double-brace syntax for variable interpolation:

```
Create a YouTube video script about {{topic}} for {{target_audience}}.

Tone: {{tone}}
Length: {{length}}

Format with:
1. HOOK (first 5 seconds)
2. INTRO (30 seconds)
3. MAIN POINTS
4. CALL TO ACTION
```

At runtime, `{{variable}}` placeholders are replaced with user input values.

## Backward Compatibility

All new columns are optional (nullable or have defaults). Existing prompts will continue to work:

- Prompts without `version` will display no version badge
- Prompts without `category` won't appear in category filter
- Prompts without `audience` are shown to all users
- Prompts without `type` default to 'prompt' (standard prompt rendering)
- Prompts without `template` or `inputs_schema` won't have workflow forms

## Verification

After running the migration, verify the schema:

```sql
-- Check that columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'snippets'
  AND column_name IN ('category', 'audience', 'type', 'version', 'template', 'inputs_schema');

-- Check existing data
SELECT id, title, category, audience, type, version
FROM snippets
LIMIT 10;
```

## Next Steps

After updating the schema:

1. Import the YouTube Script Generator workflow (see [WORKFLOW_SEED_DATA.md](WORKFLOW_SEED_DATA.md))
2. Update existing snippets with appropriate categories and audience values
3. Restart your Next.js dev server (`npm run dev`)
4. Test the category filter and workflow functionality

## Support

If you encounter issues:
- Verify you're connected to the correct Supabase project
- Check that RLS policies allow reading the new columns
- Confirm the anon key has SELECT permissions
- Review browser console for errors
