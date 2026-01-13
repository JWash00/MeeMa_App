# PromptKit

Production-ready AI integration snippets powered by Supabase.

A searchable, filterable library of production-ready code snippets for integrating AI APIs like OpenAI and Anthropic into your applications.

## Features

- 🔍 **Advanced Search** - Filter snippets by keyword, language, provider, and tags
- 📊 **Production Checklist** - Each snippet shows production-readiness indicators
- 📋 **One-Click Copy** - Copy code to clipboard with analytics tracking
- 📈 **Usage Analytics** - Track views and copies (server-side only)
- 🎨 **Clean UI** - Developer-focused, minimal design
- ⚡ **Fast** - Server-side data fetching with client-side filtering
- 📱 **Responsive** - Works on all devices
- 🔒 **Read-Only** - Secure, no public writes to database

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project ([sign up free](https://supabase.com))

### Setup

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up Supabase:**

   a. Create a new project at [supabase.com](https://supabase.com)

   b. Run the database schema:
      - Open the SQL Editor in your Supabase dashboard
      - Copy and run the contents of `supabase-schema.sql`
      - This will create the `snippets` and `snippet_events` tables

   c. Get your credentials:
      - Go to Project Settings → API
      - Copy the Project URL and anon/public API key

3. **Configure environment variables:**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

The app uses two main tables:

### `snippets` Table
- Stores all code snippets
- Fields: id, title, description, code, language, tags, provider, scope, owner_id, created_at, updated_at
- Row Level Security: Only official/public snippets are readable by anonymous users

### `snippet_events` Table
- Tracks analytics events (views and copies)
- Fields: id, snippet_id, event_type, user_id, created_at
- Row Level Security: Anyone can insert events

All database operations happen server-side for security.

## Architecture

### Data Flow
1. Server Components fetch data from Supabase
2. Client Components handle UI interactions and filtering
3. Analytics tracked via API routes (server-side only)
4. No direct client-to-database access

### Key Files
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/snippets.ts` - Snippet queries
- `lib/supabase/analytics.ts` - Event tracking
- `app/page.tsx` - Home page (Server Component)
- `components/HomeClient.tsx` - Client-side filtering
- `components/FilterBar.tsx` - Filter UI
- `components/ProductionChecklist.tsx` - Trust signals

## Included Snippets

- **OpenAI Chat Completion with Exponential Backoff** - Retry logic and error handling
- **Anthropic Messages API with Comprehensive Error Handling** - Rate limiting and typed errors
- **OpenAI Streaming with Real-time UI Updates** - Token-by-token streaming
- **Anthropic Streaming Response Handler** - Server-sent events implementation

## Production Readiness Features

Each snippet includes a Production Checklist that checks for:
- ✅ Retry / backoff logic
- ✅ Rate limit handling (429 errors)
- ✅ Timeouts or cancellation
- ✅ Comprehensive error handling
- ✅ Type-safe implementation
- ✅ Production approval status

## Future Roadmap

- [ ] User authentication
- [ ] User-generated snippets
- [ ] Private/public snippet scopes
- [ ] Community contributions
- [ ] Snippet versioning
- [ ] Syntax highlighting
- [ ] More AI providers (Gemini, Cohere, etc.)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

## Project Structure

```
├── app/
│   ├── api/analytics/        # Analytics API routes
│   ├── snippet/[id]/         # Dynamic snippet pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home (Server Component)
├── components/
│   ├── HomeClient.tsx       # Client-side filtering
│   ├── FilterBar.tsx        # Filter UI
│   ├── ProductionChecklist.tsx  # Trust signals
│   ├── SearchBar.tsx
│   ├── SnippetCard.tsx
│   ├── SnippetList.tsx
│   ├── SnippetDetail.tsx
│   └── CopyButton.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts        # Supabase server client
│   │   ├── snippets.ts      # Snippet queries
│   │   └── analytics.ts     # Event tracking
│   └── types.ts             # TypeScript interfaces
├── supabase-schema.sql      # Database schema
└── README.md
```

## Security

- ✅ All database access is server-side only
- ✅ Row Level Security enforces read-only access
- ✅ No client-side Supabase writes
- ✅ Analytics events validated server-side
- ✅ Environment variables for credentials

## Contributing

This is a read-only showcase app. To add snippets:
1. Insert directly into your Supabase database
2. Set `scope = 'official'` for production snippets
3. Include proper metadata (provider, tags, etc.)

## License

MIT
