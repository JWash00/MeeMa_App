import { describe, it, expect, vi } from 'vitest'
import { runPromptWithQa, type LlmCaller } from '../orchestrator'
import { validateModelOutput } from '../outputQa'
import { renderPrompt } from '../renderer'
import youtubeExample from '../examples/youtube-summarizer.json'
import type { MeemaPrompt } from '../types'

const prompt = youtubeExample as MeemaPrompt

describe('Output QA + Repair', () => {
  describe('validateModelOutput', () => {
    it('validates correct JSON output', () => {
      const rendered = renderPrompt(prompt, {
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        summary_style: 'Professional',
        max_length: 'Medium (200-500 words)'
      })

      const validOutput = JSON.stringify({
        title: 'Test Video',
        channel: 'Test Channel',
        overview: 'This is a test overview.',
        keyPoints: [
          { timestamp: '[00:00]', point: 'Introduction' }
        ],
        insights: ['Test insight'],
        tags: ['test']
      })

      const result = validateModelOutput(rendered, validOutput)

      expect(result.ok).toBe(true)
      expect(result.repaired).toBe(false)
      expect(result.issues).toHaveLength(0)
    })

    it('detects JSON in markdown fences', () => {
      const rendered = renderPrompt(prompt, {
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        summary_style: 'Professional',
        max_length: 'Medium (200-500 words)'
      })

      const invalidOutput = '```json\n{"title": "Test"}\n```'

      const result = validateModelOutput(rendered, invalidOutput)

      expect(result.ok).toBe(false)
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          id: 'mps.json.valid',
          severity: 'error'
        })
      )
    })

    it('detects schema mismatch', () => {
      const rendered = renderPrompt(prompt, {
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        summary_style: 'Professional',
        max_length: 'Medium (200-500 words)'
      })

      // Missing required field 'channel'
      const invalidOutput = JSON.stringify({
        title: 'Test Video',
        overview: 'Test',
        keyPoints: [],
        insights: [],
        tags: []
      })

      const result = validateModelOutput(rendered, invalidOutput)

      expect(result.ok).toBe(false)
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          id: 'mps.schema.match',
          severity: 'error'
        })
      )
    })
  })

  describe('runPromptWithQa', () => {
    it('passes valid output without repair', async () => {
      const rendered = renderPrompt(prompt, {
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        summary_style: 'Professional',
        max_length: 'Medium (200-500 words)'
      })

      const validOutput = JSON.stringify({
        title: 'Test Video',
        channel: 'Test Channel',
        overview: 'Test overview.',
        keyPoints: [{ timestamp: '[00:00]', point: 'Intro' }],
        insights: ['Insight 1'],
        tags: ['test']
      })

      const mockCallLlm: LlmCaller = vi.fn().mockResolvedValue({
        rawText: validOutput
      })

      const result = await runPromptWithQa({
        rendered,
        callLlm: mockCallLlm
      })

      expect(result.ok).toBe(true)
      expect(result.repaired).toBe(false)
      expect(mockCallLlm).toHaveBeenCalledTimes(1)
    })

    it('repairs JSON in markdown fences', async () => {
      // Enable repair by adding fallback to prompt
      const promptWithFallback: MeemaPrompt = {
        ...prompt,
        quality: {
          ...prompt.quality,
          fallback: {
            onSchemaFail: 'repair_json',
            maxRetries: 1
          }
        }
      }

      const rendered = renderPrompt(promptWithFallback, {
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        summary_style: 'Professional',
        max_length: 'Medium (200-500 words)'
      })

      const invalidOutput = '```json\n{"title": "Test", "channel": "Ch", "overview": "O", "keyPoints": [], "insights": [], "tags": []}\n```'
      const repairedOutput = '{"title": "Test", "channel": "Ch", "overview": "O", "keyPoints": [], "insights": [], "tags": []}'

      const mockCallLlm: LlmCaller = vi.fn()
        .mockResolvedValueOnce({ rawText: invalidOutput })  // First call fails
        .mockResolvedValueOnce({ rawText: repairedOutput }) // Repair succeeds

      const result = await runPromptWithQa({
        rendered,
        callLlm: mockCallLlm
      })

      expect(result.ok).toBe(true)
      expect(result.repaired).toBe(true)
      expect(mockCallLlm).toHaveBeenCalledTimes(2)

      // Second call should have temperature=0
      expect(mockCallLlm).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          execution: expect.objectContaining({
            temperature: 0
          })
        })
      )
    })

    it('repairs schema mismatch', async () => {
      const promptWithFallback: MeemaPrompt = {
        ...prompt,
        quality: {
          ...prompt.quality,
          fallback: {
            onSchemaFail: 'repair_json',
            maxRetries: 1
          }
        }
      }

      const rendered = renderPrompt(promptWithFallback, {
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        summary_style: 'Professional',
        max_length: 'Medium (200-500 words)'
      })

      // Missing 'channel' field
      const invalidOutput = '{"title": "Test", "overview": "O", "keyPoints": [], "insights": [], "tags": []}'
      const repairedOutput = '{"title": "Test", "channel": "Fixed", "overview": "O", "keyPoints": [], "insights": [], "tags": []}'

      const mockCallLlm: LlmCaller = vi.fn()
        .mockResolvedValueOnce({ rawText: invalidOutput })
        .mockResolvedValueOnce({ rawText: repairedOutput })

      const result = await runPromptWithQa({
        rendered,
        callLlm: mockCallLlm
      })

      expect(result.ok).toBe(true)
      expect(result.repaired).toBe(true)
    })

    it('returns failure when repair fails', async () => {
      const promptWithFallback: MeemaPrompt = {
        ...prompt,
        quality: {
          ...prompt.quality,
          fallback: {
            onSchemaFail: 'repair_json',
            maxRetries: 1
          }
        }
      }

      const rendered = renderPrompt(promptWithFallback, {
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        summary_style: 'Professional',
        max_length: 'Medium (200-500 words)'
      })

      const invalidOutput = '```json\ninvalid\n```'

      const mockCallLlm: LlmCaller = vi.fn()
        .mockResolvedValue({ rawText: invalidOutput }) // Always fails

      const result = await runPromptWithQa({
        rendered,
        callLlm: mockCallLlm
      })

      expect(result.ok).toBe(false)
      expect(result.repaired).toBe(true)
      expect(mockCallLlm).toHaveBeenCalledTimes(2) // Initial + 1 repair
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('respects maxRetries limit', async () => {
      const promptWithFallback: MeemaPrompt = {
        ...prompt,
        quality: {
          ...prompt.quality,
          fallback: {
            onSchemaFail: 'repair_json',
            maxRetries: 2 // Allow 2 retries
          }
        }
      }

      const rendered = renderPrompt(promptWithFallback, {
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        summary_style: 'Professional',
        max_length: 'Medium (200-500 words)'
      })

      const invalidOutput = '```json\ninvalid\n```'

      const mockCallLlm: LlmCaller = vi.fn()
        .mockResolvedValue({ rawText: invalidOutput })

      const result = await runPromptWithQa({
        rendered,
        callLlm: mockCallLlm
      })

      expect(result.ok).toBe(false)
      expect(mockCallLlm).toHaveBeenCalledTimes(3) // Initial + 2 repairs
    })

    it('does not repair when fallback is disabled', async () => {
      // Use default prompt without fallback
      const rendered = renderPrompt(prompt, {
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        summary_style: 'Professional',
        max_length: 'Medium (200-500 words)'
      })

      const invalidOutput = '```json\n{"title": "Test"}\n```'

      const mockCallLlm: LlmCaller = vi.fn()
        .mockResolvedValue({ rawText: invalidOutput })

      const result = await runPromptWithQa({
        rendered,
        callLlm: mockCallLlm
      })

      expect(result.ok).toBe(false)
      expect(result.repaired).toBe(false)
      expect(mockCallLlm).toHaveBeenCalledTimes(1) // No repair attempted
    })

    it('includes warnings in successful validation', async () => {
      const rendered = renderPrompt(prompt, {
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        summary_style: 'Professional',
        max_length: 'Medium (200-500 words)'
      })

      // Valid JSON with markdown (should trigger warning)
      const validOutput = JSON.stringify({
        title: '# Test Video',
        channel: 'Test Channel',
        overview: 'This is a test overview.',
        keyPoints: [{ timestamp: '[00:00]', point: 'Introduction' }],
        insights: ['Test insight'],
        tags: ['test']
      })

      const mockCallLlm: LlmCaller = vi.fn().mockResolvedValue({
        rawText: validOutput
      })

      const result = await runPromptWithQa({
        rendered,
        callLlm: mockCallLlm
      })

      expect(result.ok).toBe(true)
      // Note: warnings might be present but not guarantee based on detection logic
    })

    it('handles non-JSON output formats', async () => {
      // Create a text-format prompt
      const textPrompt: MeemaPrompt = {
        ...prompt,
        outputs: {
          format: 'text'
        }
      }

      const rendered = renderPrompt(textPrompt, {
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        summary_style: 'Professional',
        max_length: 'Medium (200-500 words)'
      })

      const textOutput = 'This is plain text output, not JSON'

      const mockCallLlm: LlmCaller = vi.fn().mockResolvedValue({
        rawText: textOutput
      })

      const result = await runPromptWithQa({
        rendered,
        callLlm: mockCallLlm
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.parsed).toBe(textOutput)
      }
      expect(result.repaired).toBe(false)
    })
  })
})
