# Supabase Setup Guide for PromptKit

## Step-by-Step Instructions

### 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

### 2. Create New Project
1. Click "New Project"
2. Choose your organization
3. Enter project details:
   - **Name**: PromptKit (or your choice)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for project to initialize

### 3. Run Database Schema
1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste into the SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### 4. Verify Tables Created
1. Click "Table Editor" in the left sidebar
2. You should see two tables:
   - `snippets` (with 4 rows - the seed data)
   - `snippet_events` (empty initially)

### 5. Get API Credentials
1. Click the "Settings" icon (gear) in the left sidebar
2. Click "API" under Project Settings
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJI...` (long string)
4. Copy both values

### 6. Configure Local Environment
1. In your project root, copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
   ```

3. Save the file

### 7. Install Dependencies and Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Verify Setup

### Check 1: Snippets Display
- You should see 4 snippets on the home page
- If you see "Error fetching snippets", check your credentials

### Check 2: Filtering Works
- Try selecting a language filter
- Try selecting a provider filter
- Try clicking tags
- Try searching with keywords

### Check 3: Detail Page
- Click on any snippet
- Should show full code and Production Checklist
- Click "Copy Code" button

### Check 4: Analytics (Optional)
1. Go to Supabase dashboard
2. Click "Table Editor"
3. Select `snippet_events` table
4. After viewing and copying snippets, you should see events

## Common Issues

### Issue: "Invalid API key"
**Solution**: Double-check you copied the correct anon/public key (not the service_role key)

### Issue: "Failed to fetch snippets"
**Solutions**:
- Verify Supabase URL is correct
- Check internet connection
- Ensure database schema was run successfully
- Check browser console for detailed error

### Issue: No snippets displayed
**Solutions**:
- Go to Table Editor → snippets
- Verify 4 rows exist
- Check that `scope` column is set to 'official'
- Try running the seed data part of `supabase-schema.sql` again

### Issue: RLS Policy Error
**Solution**: Make sure all RLS policies from `supabase-schema.sql` were created. Re-run the entire schema file.

## Database Schema Summary

### `snippets` Table
```sql
id              TEXT PRIMARY KEY
title           TEXT NOT NULL
description     TEXT NOT NULL
code            TEXT NOT NULL
language        TEXT NOT NULL
tags            TEXT[] NOT NULL DEFAULT '{}'
provider        TEXT
scope           TEXT NOT NULL DEFAULT 'official'
owner_id        UUID
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `snippet_events` Table
```sql
id              UUID PRIMARY KEY DEFAULT uuid_generate_v4()
snippet_id      TEXT NOT NULL REFERENCES snippets(id)
event_type      TEXT NOT NULL CHECK (event_type IN ('view', 'copy'))
user_id         UUID
created_at      TIMESTAMPTZ DEFAULT NOW()
```

## Row Level Security

### Snippets Table Policies
- ✅ **Read**: Public can read official/public snippets
- ❌ **Insert**: Blocked for public
- ❌ **Update**: Blocked for public
- ❌ **Delete**: Blocked for public

### Events Table Policies
- ✅ **Insert**: Anyone can insert events
- ❌ **Read**: Blocked for public (admin only in future)

## Next Steps

Once setup is complete:
1. ✅ App is fully functional
2. 📊 Analytics will track views and copies
3. 🎨 Customize snippets in Supabase Table Editor
4. 🚀 Ready to deploy (Vercel, Netlify, etc.)

## Adding New Snippets

To add more snippets:
1. Go to Supabase Table Editor
2. Select `snippets` table
3. Click "Insert row"
4. Fill in:
   - **id**: URL-friendly slug (e.g., "gemini-streaming")
   - **title**: Display title
   - **description**: Brief description
   - **code**: Full code content
   - **language**: "typescript", "javascript", etc.
   - **tags**: `{"ai", "streaming"}` (PostgreSQL array syntax)
   - **provider**: "gemini", "cohere", etc.
   - **scope**: "official" (for public display)
   - **owner_id**: NULL (for system snippets)
5. Click "Save"

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify environment variables are loaded (restart dev server)
4. Review `supabase-schema.sql` for any failed commands

---

**Estimated Setup Time**: 10-15 minutes
**Difficulty**: Beginner-friendly
