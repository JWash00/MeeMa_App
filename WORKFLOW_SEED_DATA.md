# YouTube Script Generator Workflow - Seed Data

## Overview
This document contains the seed data for the **YouTube Script Generator** workflow prompt - the first structured workflow example for PromptKit.

## Workflow Details

- **ID**: `youtube-script-generator`
- **Title**: YouTube Script Generator
- **Category**: YouTube Scripts
- **Audience**: creator
- **Type**: workflow
- **Version**: 1.0

## SQL Insert Statement

Run this in your Supabase SQL Editor to add the workflow:

```sql
INSERT INTO snippets (
  id,
  title,
  description,
  category,
  audience,
  type,
  version,
  language,
  tags,
  provider,
  scope,
  template,
  inputs_schema,
  created_at,
  updated_at
) VALUES (
  'youtube-script-generator',
  'YouTube Script Generator',
  'Generate professional YouTube video scripts with structured hooks, intros, main points, and CTAs. Perfect for content creators who need consistent, engaging scripts.',
  'YouTube Scripts',
  'creator',
  'workflow',
  '1.0',
  'prompt',
  ARRAY['youtube', 'video', 'script', 'content', 'creator'],
  NULL,
  'official',
  'Create a YouTube video script with the following parameters:

Topic: {{topic}}
Target Audience: {{target_audience}}
Tone: {{tone}}
Video Length: {{length}}

Please format the script with these sections:

1. HOOK (First 5 seconds)
   - Grab attention immediately
   - Make viewers want to keep watching
   - Preview the main value

2. INTRO (30 seconds)
   - Introduce yourself/channel
   - Set expectations for the video
   - Build credibility

3. MAIN CONTENT
   - Break down into clear sections with timestamps
   - Use {{tone}} tone throughout
   - Include examples and actionable tips
   - Optimize pacing for {{length}}

4. CALL TO ACTION
   - Encourage likes, comments, subscribes
   - Direct viewers to next steps
   - End with strong closing statement

Make the script engaging, conversational, and optimized for viewer retention. Include suggestions for visuals, B-roll, or on-screen graphics where helpful.',
  '{
    "topic": {
      "label": "Video Topic",
      "type": "text",
      "placeholder": "e.g., How to grow tomatoes in small spaces",
      "default": ""
    },
    "target_audience": {
      "label": "Target Audience",
      "type": "text",
      "placeholder": "e.g., Beginner gardeners, Urban dwellers",
      "default": ""
    },
    "tone": {
      "label": "Tone",
      "type": "select",
      "options": ["Casual", "Educational", "Entertaining", "Professional"],
      "default": "Educational"
    },
    "length": {
      "label": "Video Length",
      "type": "select",
      "options": ["Short (< 3 min)", "Medium (3-10 min)", "Long (10+ min)"],
      "default": "Medium (3-10 min)"
    }
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  audience = EXCLUDED.audience,
  type = EXCLUDED.type,
  version = EXCLUDED.version,
  template = EXCLUDED.template,
  inputs_schema = EXCLUDED.inputs_schema,
  updated_at = NOW();
```

## JSON Format (Alternative Import Method)

If you prefer to import via JSON or other methods:

```json
{
  "id": "youtube-script-generator",
  "title": "YouTube Script Generator",
  "description": "Generate professional YouTube video scripts with structured hooks, intros, main points, and CTAs. Perfect for content creators who need consistent, engaging scripts.",
  "category": "YouTube Scripts",
  "audience": "creator",
  "type": "workflow",
  "version": "1.0",
  "language": "prompt",
  "tags": ["youtube", "video", "script", "content", "creator"],
  "provider": null,
  "scope": "official",
  "template": "Create a YouTube video script with the following parameters:\n\nTopic: {{topic}}\nTarget Audience: {{target_audience}}\nTone: {{tone}}\nVideo Length: {{length}}\n\nPlease format the script with these sections:\n\n1. HOOK (First 5 seconds)\n   - Grab attention immediately\n   - Make viewers want to keep watching\n   - Preview the main value\n\n2. INTRO (30 seconds)\n   - Introduce yourself/channel\n   - Set expectations for the video\n   - Build credibility\n\n3. MAIN CONTENT\n   - Break down into clear sections with timestamps\n   - Use {{tone}} tone throughout\n   - Include examples and actionable tips\n   - Optimize pacing for {{length}}\n\n4. CALL TO ACTION\n   - Encourage likes, comments, subscribes\n   - Direct viewers to next steps\n   - End with strong closing statement\n\nMake the script engaging, conversational, and optimized for viewer retention. Include suggestions for visuals, B-roll, or on-screen graphics where helpful.",
  "inputs_schema": {
    "topic": {
      "label": "Video Topic",
      "type": "text",
      "placeholder": "e.g., How to grow tomatoes in small spaces",
      "default": ""
    },
    "target_audience": {
      "label": "Target Audience",
      "type": "text",
      "placeholder": "e.g., Beginner gardeners, Urban dwellers",
      "default": ""
    },
    "tone": {
      "label": "Tone",
      "type": "select",
      "options": ["Casual", "Educational", "Entertaining", "Professional"],
      "default": "Educational"
    },
    "length": {
      "label": "Video Length",
      "type": "select",
      "options": ["Short (< 3 min)", "Medium (3-10 min)", "Long (10+ min)"],
      "default": "Medium (3-10 min)"
    }
  }
}
```

## How It Works

When a user accesses this workflow:

1. They see a form with 4 input fields:
   - **Video Topic** (text input)
   - **Target Audience** (text input)
   - **Tone** (dropdown: Casual, Educational, Entertaining, Professional)
   - **Video Length** (dropdown: Short, Medium, Long)

2. As they fill out the form, a live preview shows the generated prompt with their inputs

3. The **Copy Prompt** button copies the fully-generated prompt (not the template) to their clipboard

4. They can paste this into ChatGPT, Claude, or any AI assistant to generate their YouTube script

## Example Output

If a user enters:
- Topic: "How to grow tomatoes in small spaces"
- Target Audience: "Beginner gardeners"
- Tone: "Educational"
- Length: "Medium (3-10 min)"

The generated prompt will be:

```
Create a YouTube video script with the following parameters:

Topic: How to grow tomatoes in small spaces
Target Audience: Beginner gardeners
Tone: Educational
Video Length: Medium (3-10 min)

Please format the script with these sections:

1. HOOK (First 5 seconds)
   - Grab attention immediately
   - Make viewers want to keep watching
   - Preview the main value

2. INTRO (30 seconds)
   - Introduce yourself/channel
   - Set expectations for the video
   - Build credibility

3. MAIN CONTENT
   - Break down into clear sections with timestamps
   - Use Educational tone throughout
   - Include examples and actionable tips
   - Optimize pacing for Medium (3-10 min)

4. CALL TO ACTION
   - Encourage likes, comments, subscribes
   - Direct viewers to next steps
   - End with strong closing statement

Make the script engaging, conversational, and optimized for viewer retention. Include suggestions for visuals, B-roll, or on-screen graphics where helpful.
```

## Verification

After importing, verify the workflow:

```sql
-- Check that the workflow exists
SELECT id, title, category, type, version
FROM snippets
WHERE id = 'youtube-script-generator';

-- View the full workflow data
SELECT *
FROM snippets
WHERE id = 'youtube-script-generator';
```

## Future Workflows

Additional workflow ideas for Phase B:

- **TikTok Hook Generator** (category: TikTok Content)
- **Email Subject Line Tester** (category: Email Marketing)
- **Instagram Caption Writer** (category: Social Media Captions)
- **Product Description Generator** (category: Product Descriptions)
- **Client Proposal Template** (category: Freelance / Client Work)

Each workflow should follow the same pattern:
- Clear `inputs_schema` with 3-6 input fields
- Detailed `template` with {{placeholders}}
- Creator-focused categories and language
- Professional, production-ready output
