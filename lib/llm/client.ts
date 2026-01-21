/**
 * LLM Client for server-side generation
 * v0.1: Anthropic Claude only
 */

export interface LLMRequest {
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
  temperature?: number
}

export interface LLMResponse {
  text: string
  model: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: request.maxTokens || 2000,
      temperature: request.temperature || 0.7,
      system: request.systemPrompt,
      messages: [
        {
          role: 'user',
          content: request.userPrompt
        }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LLM API error: ${response.status} - ${error}`)
  }

  const data = await response.json()

  return {
    text: data.content[0].text,
    model: data.model,
    usage: {
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens
    }
  }
}
