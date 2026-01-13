-- PromptKit Database Schema
-- Run this in your Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Snippets table
CREATE TABLE IF NOT EXISTS snippets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  provider TEXT,
  scope TEXT NOT NULL DEFAULT 'official' CHECK (scope IN ('official', 'private', 'public')),
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Snippet events table for analytics
CREATE TABLE IF NOT EXISTS snippet_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  snippet_id TEXT NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'copy')),
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_snippets_scope ON snippets(scope);
CREATE INDEX IF NOT EXISTS idx_snippets_language ON snippets(language);
CREATE INDEX IF NOT EXISTS idx_snippets_provider ON snippets(provider);
CREATE INDEX IF NOT EXISTS idx_snippets_tags ON snippets USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_snippets_created_at ON snippets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snippet_events_snippet_id ON snippet_events(snippet_id);
CREATE INDEX IF NOT EXISTS idx_snippet_events_type ON snippet_events(event_type);
CREATE INDEX IF NOT EXISTS idx_snippet_events_created_at ON snippet_events(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_snippets_search ON snippets
  USING GIN (to_tsvector('english', title || ' ' || description || ' ' || array_to_string(tags, ' ')));

-- Row Level Security
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippet_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access to official/public snippets
CREATE POLICY "Allow public read access to non-private snippets"
  ON snippets FOR SELECT
  USING (scope IN ('official', 'public'));

-- RLS Policy: Allow anyone to insert analytics events
CREATE POLICY "Allow public insert on events"
  ON snippet_events FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Prevent all other operations (no updates/deletes from public)
CREATE POLICY "Prevent public writes to snippets"
  ON snippets FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Prevent public updates to snippets"
  ON snippets FOR UPDATE
  USING (false);

CREATE POLICY "Prevent public deletes from snippets"
  ON snippets FOR DELETE
  USING (false);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_snippets_updated_at
  BEFORE UPDATE ON snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data: Migrate existing 4 snippets as "official" scope
-- Note: Update the code content from your lib/snippets.ts file

INSERT INTO snippets (id, title, description, code, language, tags, provider, scope, owner_id) VALUES
(
  'openai-retry',
  'OpenAI Chat Completion with Exponential Backoff',
  'Production-ready OpenAI API call with retry logic, error handling, and timeout protection',
  '// OpenAI chat completion with exponential backoff retry
import OpenAI from ''openai''

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function chatWithRetry(
  messages: Array<{ role: string; content: string }>,
  maxRetries = 3
) {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: ''gpt-4o'',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      })

      return response.choices[0].message.content

    } catch (error: any) {
      lastError = error

      // Don''t retry on certain errors
      if (error.status === 401 || error.status === 403) {
        throw new Error(`Authentication failed: ${error.message}`)
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000
      console.warn(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`)

      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message}`)
}

// Usage
const result = await chatWithRetry([
  { role: ''user'', content: ''Explain quantum computing briefly'' }
])
console.log(result)',
  'typescript',
  ARRAY['openai', 'retry', 'error-handling', 'typescript'],
  'openai',
  'official',
  NULL
),
(
  'anthropic-error-handling',
  'Anthropic Messages API with Comprehensive Error Handling',
  'Robust Anthropic Claude API integration with typed errors, rate limiting, and graceful degradation',
  '// Anthropic Messages API with error handling
import Anthropic from ''@anthropic-ai/sdk''

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface MessageOptions {
  prompt: string
  model?: string
  maxTokens?: number
}

class AnthropicError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRetryable?: boolean
  ) {
    super(message)
    this.name = ''AnthropicError''
  }
}

async function sendMessage({
  prompt,
  model = ''claude-opus-4-5-20251101'',
  maxTokens = 1024,
}: MessageOptions): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{ role: ''user'', content: prompt }],
    })

    // Extract text content
    const textContent = message.content.find(
      block => block.type === ''text''
    )

    if (!textContent || textContent.type !== ''text'') {
      throw new AnthropicError(''No text content in response'')
    }

    return textContent.text

  } catch (error: any) {
    // Handle rate limiting
    if (error.status === 429) {
      const retryAfter = error.headers?.[''retry-after''] || 60
      throw new AnthropicError(
        `Rate limited. Retry after ${retryAfter}s`,
        429,
        true
      )
    }

    // Handle authentication errors
    if (error.status === 401) {
      throw new AnthropicError(
        ''Invalid API key'',
        401,
        false
      )
    }

    // Handle overloaded errors
    if (error.status === 529) {
      throw new AnthropicError(
        ''API temporarily overloaded'',
        529,
        true
      )
    }

    // Generic error
    throw new AnthropicError(
      error.message || ''Unknown error occurred'',
      error.status,
      false
    )
  }
}

// Usage with error handling
try {
  const response = await sendMessage({
    prompt: ''Write a haiku about coding'',
    maxTokens: 100,
  })
  console.log(response)
} catch (error) {
  if (error instanceof AnthropicError) {
    console.error(`Anthropic Error (${error.statusCode}): ${error.message}`)
    if (error.isRetryable) {
      console.log(''Consider retrying this request'')
    }
  } else {
    console.error(''Unexpected error:'', error)
  }
}',
  'typescript',
  ARRAY['anthropic', 'claude', 'error-handling', 'typescript'],
  'anthropic',
  'official',
  NULL
),
(
  'openai-streaming',
  'OpenAI Streaming with Real-time UI Updates',
  'Stream OpenAI responses token-by-token for responsive UIs with proper error handling and cleanup',
  '// OpenAI streaming response handler
import OpenAI from ''openai''

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function* streamChatCompletion(
  messages: Array<{ role: string; content: string }>
) {
  try {
    const stream = await openai.chat.completions.create({
      model: ''gpt-4o'',
      messages,
      stream: true,
      max_tokens: 2000,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  } catch (error: any) {
    throw new Error(`Streaming failed: ${error.message}`)
  }
}

// React hook for streaming
import { useState, useCallback } from ''react''

export function useStreamingChat() {
  const [response, setResponse] = useState('''')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamResponse = useCallback(async (
    messages: Array<{ role: string; content: string }>
  ) => {
    setResponse('''')
    setError(null)
    setIsStreaming(true)

    try {
      for await (const chunk of streamChatCompletion(messages)) {
        setResponse(prev => prev + chunk)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsStreaming(false)
    }
  }, [])

  return { response, isStreaming, error, streamResponse }
}

// Usage in component
export function ChatComponent() {
  const { response, isStreaming, streamResponse } = useStreamingChat()

  const handleSubmit = async (prompt: string) => {
    await streamResponse([
      { role: ''user'', content: prompt }
    ])
  }

  return (
    <div>
      <pre className="whitespace-pre-wrap">{response}</pre>
      {isStreaming && <div>Streaming...</div>}
    </div>
  )
}',
  'typescript',
  ARRAY['openai', 'streaming', 'react', 'typescript'],
  'openai',
  'official',
  NULL
),
(
  'anthropic-streaming',
  'Anthropic Streaming Response Handler',
  'Stream Claude responses with proper event handling and UI integration',
  '// Anthropic streaming with Server-Sent Events
import Anthropic from ''@anthropic-ai/sdk''

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function* streamClaudeResponse(prompt: string) {
  const stream = await anthropic.messages.stream({
    model: ''claude-opus-4-5-20251101'',
    max_tokens: 1024,
    messages: [{ role: ''user'', content: prompt }],
  })

  for await (const event of stream) {
    if (
      event.type === ''content_block_delta'' &&
      event.delta.type === ''text_delta''
    ) {
      yield event.delta.text
    }
  }
}

// Next.js API Route for streaming
// app/api/stream/route.ts
export async function POST(request: Request) {
  const { prompt } = await request.json()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamClaudeResponse(prompt)) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
          )
        }
        controller.enqueue(encoder.encode(''data: [DONE]\n\n''))
        controller.close()
      } catch (error: any) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: error.message })}\n\n`
          )
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      ''Content-Type'': ''text/event-stream'',
      ''Cache-Control'': ''no-cache'',
      Connection: ''keep-alive'',
    },
  })
}

// Client-side hook
export function useAnthropicStream() {
  const [text, setText] = useState('''')
  const [isDone, setIsDone] = useState(false)

  const startStream = async (prompt: string) => {
    setText('''')
    setIsDone(false)

    const response = await fetch(''/api/stream'', {
      method: ''POST'',
      headers: { ''Content-Type'': ''application/json'' },
      body: JSON.stringify({ prompt }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader!.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split(''\n'')

      for (const line of lines) {
        if (line.startsWith(''data: '')) {
          const data = line.slice(6)
          if (data === ''[DONE]'') {
            setIsDone(true)
          } else {
            const { chunk } = JSON.parse(data)
            setText(prev => prev + chunk)
          }
        }
      }
    }
  }

  return { text, isDone, startStream }
}',
  'typescript',
  ARRAY['anthropic', 'streaming', 'sse', 'typescript'],
  'anthropic',
  'official',
  NULL
)
ON CONFLICT (id) DO NOTHING;
