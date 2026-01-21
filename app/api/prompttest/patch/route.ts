import { NextResponse } from 'next/server'
import { PatchRequest, PatchResponse, PatchError } from '@/lib/prompttest/patch'
import { callLLM } from '@/lib/llm/client'

export async function POST(request: Request) {
  try {
    const body: PatchRequest = await request.json()

    // Validate request
    if (!body.originalOutput || !body.requirements || body.requirements.length === 0) {
      return NextResponse.json<PatchError>(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Build prompt for LLM
    const systemPrompt = `You are a strict content editor. Your ONLY job is to generate missing sections that were requested. You MUST:
1. Return ONLY the missing sections, nothing else
2. Start each section with its exact heading on its own line (e.g., "INTRO" then content below)
3. Never rewrite or modify existing content
4. Keep content consistent with the topic and style of the original output
5. Do not add preambles, explanations, or markdown code fences
6. Be concise and relevant`

    const missingSections = body.requirements.map(r => r.sectionTitle).join(', ')

    const userPrompt = `Original output:
---
${body.originalOutput}
---

Missing sections that need to be added: ${missingSections}

${body.snippetContext ? `Context: This is for "${body.snippetContext.title}" - ${body.snippetContext.description}` : ''}

Generate ONLY the missing sections. Each section must start with its heading in ALL CAPS on its own line, followed by the content.`

    // Call LLM
    const llmResponse = await callLLM({
      systemPrompt,
      userPrompt,
      maxTokens: 1500,
      temperature: 0.7
    })

    const patchText = llmResponse.text.trim()

    // Validate that patch contains at least one required section
    const sectionsAdded: string[] = []
    for (const req of body.requirements) {
      if (patchText.toUpperCase().includes(req.sectionTitle)) {
        sectionsAdded.push(req.sectionTitle)
      }
    }

    if (sectionsAdded.length === 0) {
      return NextResponse.json<PatchError>(
        {
          error: 'Patch generation failed',
          details: 'Generated content did not include any of the required sections'
        },
        { status: 500 }
      )
    }

    return NextResponse.json<PatchResponse>({
      patchText,
      sectionsAdded
    })

  } catch (error) {
    console.error('Patch generation error:', error)
    return NextResponse.json<PatchError>(
      {
        error: 'Failed to generate patch',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
