// Legacy mock data - not used (data comes from Supabase)
// Keeping for reference only

export const snippets = [
  {
    id: 'openai-retry',
    title: 'OpenAI Chat Completion with Exponential Backoff',
    description: 'Production-ready OpenAI API call with retry logic, error handling, and timeout protection',
    tags: ['openai', 'retry', 'error-handling', 'typescript'],
    language: 'typescript',
    code: `// OpenAI chat completion with exponential backoff retry
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function chatWithRetry(
  messages: Array<{ role: string; content: string }>,
  maxRetries = 3
) {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      })

      return response.choices[0].message.content

    } catch (error: any) {
      lastError = error

      // Don't retry on certain errors
      if (error.status === 401 || error.status === 403) {
        throw new Error(\`Authentication failed: \${error.message}\`)
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000
      console.warn(\`Retry \${attempt + 1}/\${maxRetries} after \${delay}ms\`)

      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(\`Failed after \${maxRetries} attempts: \${lastError?.message}\`)
}

// Usage
const result = await chatWithRetry([
  { role: 'user', content: 'Explain quantum computing briefly' }
])
console.log(result)`
  },
  {
    id: 'anthropic-error-handling',
    title: 'Anthropic Messages API with Comprehensive Error Handling',
    description: 'Robust Anthropic Claude API integration with typed errors, rate limiting, and graceful degradation',
    tags: ['anthropic', 'claude', 'error-handling', 'typescript'],
    language: 'typescript',
    code: `// Anthropic Messages API with error handling
import Anthropic from '@anthropic-ai/sdk'

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
    this.name = 'AnthropicError'
  }
}

async function sendMessage({
  prompt,
  model = 'claude-opus-4-5-20251101',
  maxTokens = 1024,
}: MessageOptions): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })

    // Extract text content
    const textContent = message.content.find(
      block => block.type === 'text'
    )

    if (!textContent || textContent.type !== 'text') {
      throw new AnthropicError('No text content in response')
    }

    return textContent.text

  } catch (error: any) {
    // Handle rate limiting
    if (error.status === 429) {
      const retryAfter = error.headers?.['retry-after'] || 60
      throw new AnthropicError(
        \`Rate limited. Retry after \${retryAfter}s\`,
        429,
        true
      )
    }

    // Handle authentication errors
    if (error.status === 401) {
      throw new AnthropicError(
        'Invalid API key',
        401,
        false
      )
    }

    // Handle overloaded errors
    if (error.status === 529) {
      throw new AnthropicError(
        'API temporarily overloaded',
        529,
        true
      )
    }

    // Generic error
    throw new AnthropicError(
      error.message || 'Unknown error occurred',
      error.status,
      false
    )
  }
}

// Usage with error handling
try {
  const response = await sendMessage({
    prompt: 'Write a haiku about coding',
    maxTokens: 100,
  })
  console.log(response)
} catch (error) {
  if (error instanceof AnthropicError) {
    console.error(\`Anthropic Error (\${error.statusCode}): \${error.message}\`)
    if (error.isRetryable) {
      console.log('Consider retrying this request')
    }
  } else {
    console.error('Unexpected error:', error)
  }
}`
  },
  {
    id: 'openai-streaming',
    title: 'OpenAI Streaming with Real-time UI Updates',
    description: 'Stream OpenAI responses token-by-token for responsive UIs with proper error handling and cleanup',
    tags: ['openai', 'streaming', 'react', 'typescript'],
    language: 'typescript',
    code: `// OpenAI streaming response handler
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function* streamChatCompletion(
  messages: Array<{ role: string; content: string }>
) {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
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
    throw new Error(\`Streaming failed: \${error.message}\`)
  }
}

// React hook for streaming
import { useState, useCallback } from 'react'

export function useStreamingChat() {
  const [response, setResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamResponse = useCallback(async (
    messages: Array<{ role: string; content: string }>
  ) => {
    setResponse('')
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
      { role: 'user', content: prompt }
    ])
  }

  return (
    <div>
      <pre className="whitespace-pre-wrap">{response}</pre>
      {isStreaming && <div>Streaming...</div>}
    </div>
  )
}`
  },
  {
    id: 'anthropic-streaming',
    title: 'Anthropic Streaming Response Handler',
    description: 'Stream Claude responses with proper event handling and UI integration',
    tags: ['anthropic', 'streaming', 'sse', 'typescript'],
    language: 'typescript',
    code: `// Anthropic streaming with Server-Sent Events
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function* streamClaudeResponse(prompt: string) {
  const stream = await anthropic.messages.stream({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
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
            encoder.encode(\`data: \${JSON.stringify({ chunk })}\n\n\`)
          )
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error: any) {
        controller.enqueue(
          encoder.encode(
            \`data: \${JSON.stringify({ error: error.message })}\n\n\`
          )
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

// Client-side hook
export function useAnthropicStream() {
  const [text, setText] = useState('')
  const [isDone, setIsDone] = useState(false)

  const startStream = async (prompt: string) => {
    setText('')
    setIsDone(false)

    const response = await fetch('/api/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader!.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
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
}`
  }
]

export function getSnippetById(id: string) {
  return snippets.find(snippet => snippet.id === id)
}
