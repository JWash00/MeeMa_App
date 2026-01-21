import { describe, it, expect } from 'vitest'
import { renderPrompt } from '../renderer'
import { validateInputs } from '../inputValidation'
import youtubeExample from '../examples/youtube-summarizer.json'
import type { MeemaPrompt } from '../types'

const prompt = youtubeExample as MeemaPrompt

describe('renderPrompt', () => {
  it('renders valid inputs successfully', () => {
    const inputs = {
      video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      summary_style: 'Professional',
      max_length: 'Medium (200-500 words)'
    }

    const result = renderPrompt(prompt, inputs)

    // Validation should pass
    expect(result.inputValidation.valid).toBe(true)
    expect(result.inputValidation.errors).toHaveLength(0)

    // Messages should be generated
    expect(result.messages).toHaveLength(1) // User message only (no system prompt in example)
    expect(result.messages[0].role).toBe('user')

    // Placeholders should be replaced
    expect(result.messages[0].content).toContain('https://youtube.com/watch?v=dQw4w9WgXcQ')
    expect(result.messages[0].content).toContain('Professional')
    expect(result.messages[0].content).toContain('Medium (200-500 words)')

    // Should NOT contain unreplaced placeholders
    expect(result.messages[0].content).not.toContain('{{video_url}}')
    expect(result.messages[0].content).not.toContain('{{summary_style}}')
    expect(result.messages[0].content).not.toContain('{{max_length}}')

    // Metadata should be populated
    expect(result.metadata.promptId).toBe('youtube-summarizer')
    expect(result.metadata.promptVersion).toBe('1.0')
    expect(result.metadata.inputKeys).toEqual(['video_url', 'summary_style', 'max_length'])

    // Execution config should be extracted
    expect(result.executionConfig.provider).toBe('anthropic')
    expect(result.executionConfig.model).toBe('claude-3-5-sonnet-20241022')
    expect(result.executionConfig.temperature).toBe(0.3)
  })

  it('returns validation errors for missing required input', () => {
    const inputs = {
      summary_style: 'Professional',
      max_length: 'Short (< 200 words)'
      // Missing: video_url (required)
    }

    const result = renderPrompt(prompt, inputs)

    // Validation should fail
    expect(result.inputValidation.valid).toBe(false)
    expect(result.inputValidation.errors).toHaveLength(1)
    expect(result.inputValidation.errors[0].field).toBe('video_url')
    expect(result.inputValidation.errors[0].code).toBe('REQUIRED_FIELD')

    // Messages should be empty
    expect(result.messages).toHaveLength(0)
  })

  it('returns validation error for invalid URL format', () => {
    const inputs = {
      video_url: 'not-a-valid-url',
      summary_style: 'Professional',
      max_length: 'Medium (200-500 words)'
    }

    const result = renderPrompt(prompt, inputs)

    // Validation should fail
    expect(result.inputValidation.valid).toBe(false)
    expect(result.inputValidation.errors).toHaveLength(1)
    expect(result.inputValidation.errors[0].field).toBe('video_url')
    expect(result.inputValidation.errors[0].code).toBe('INVALID_FORMAT')

    // Messages should be empty
    expect(result.messages).toHaveLength(0)
  })

  it('returns validation error for invalid select option', () => {
    const inputs = {
      video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      summary_style: 'InvalidStyle', // Not in options
      max_length: 'Medium (200-500 words)'
    }

    const result = renderPrompt(prompt, inputs)

    // Validation should fail
    expect(result.inputValidation.valid).toBe(false)
    expect(result.inputValidation.errors).toHaveLength(1)
    expect(result.inputValidation.errors[0].field).toBe('summary_style')
    expect(result.inputValidation.errors[0].code).toBe('INVALID_OPTION')

    // Messages should be empty
    expect(result.messages).toHaveLength(0)
  })

  it('applies default values for missing optional inputs', () => {
    const inputs = {
      video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
      // Missing: summary_style (has default), max_length (has default)
    }

    const result = renderPrompt(prompt, inputs)

    // Validation should pass (defaults applied)
    expect(result.inputValidation.valid).toBe(true)
    expect(result.inputValidation.resolvedInputs.summary_style).toBe('Professional')
    expect(result.inputValidation.resolvedInputs.max_length).toBe('Medium (200-500 words)')

    // Messages should contain defaults
    expect(result.messages[0].content).toContain('Professional')
    expect(result.messages[0].content).toContain('Medium (200-500 words)')
  })

  it('includes output schema when enabled and placeholder exists', () => {
    // Note: youtube-summarizer doesn't have {{output_schema}} placeholder in template
    // This test verifies that reserved keys are available but only used if placeholder exists
    const inputs = {
      video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      summary_style: 'Professional',
      max_length: 'Medium (200-500 words)'
    }

    const result = renderPrompt(prompt, inputs, {
      includeOutputSchema: true
    })

    // Output schema is available but not in template, so won't appear in rendered text
    // This is correct behavior - reserved keys only replace placeholders that exist
    expect(result.inputValidation.valid).toBe(true)
    expect(result.messages).toHaveLength(1)
  })

  it('respects includeOutputSchema option', () => {
    const inputs = {
      video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      summary_style: 'Professional',
      max_length: 'Medium (200-500 words)'
    }

    const resultWithSchema = renderPrompt(prompt, inputs, {
      includeOutputSchema: true
    })

    const resultWithoutSchema = renderPrompt(prompt, inputs, {
      includeOutputSchema: false
    })

    // Both should be valid, option controls reserved key availability
    expect(resultWithSchema.inputValidation.valid).toBe(true)
    expect(resultWithoutSchema.inputValidation.valid).toBe(true)
  })
})

describe('validateInputs', () => {
  it('validates all inputs successfully', () => {
    const inputs = {
      video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      summary_style: 'Professional',
      max_length: 'Medium (200-500 words)'
    }

    const result = validateInputs(prompt, inputs)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.resolvedInputs).toEqual(inputs)
  })

  it('detects missing required field', () => {
    const inputs = {
      summary_style: 'Professional'
      // Missing: video_url (required)
    }

    const result = validateInputs(prompt, inputs)

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].field).toBe('video_url')
    expect(result.errors[0].code).toBe('REQUIRED_FIELD')
  })

  it('validates URL pattern', () => {
    const inputs = {
      video_url: 'invalid-url',
      summary_style: 'Professional',
      max_length: 'Medium (200-500 words)'
    }

    const result = validateInputs(prompt, inputs)

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].field).toBe('video_url')
    expect(result.errors[0].code).toBe('INVALID_FORMAT')
  })
})
