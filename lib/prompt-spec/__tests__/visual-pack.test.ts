import { describe, it, expect } from 'vitest'
import { runVisualPackChecks, isVisualPromptPack, VISUAL_CHECKS } from '../visual/visualQa'
import { visualPromptPackSchema } from '../visual/promptPackSchema'
import { validateAgainstSchema } from '../schemaValidate'

describe('Visual Prompt Pack', () => {
  describe('Schema Validation', () => {
    it('validates correct prompt pack structure', () => {
      const validPack = {
        intent: 'product_photo',
        providers: {
          midjourney_v6: {
            positive: 'Professional product photo of a sleek smartphone on white background',
            negative: 'blurry, low quality',
            params: { ar: '1:1', stylize: 100 }
          }
        }
      }

      const result = validateAgainstSchema(visualPromptPackSchema, validPack)
      expect(result.ok).toBe(true)
    })

    it('validates pack with multiple providers', () => {
      const validPack = {
        intent: 'headshot',
        providers: {
          midjourney_v6: {
            positive: 'Professional headshot of a business woman, studio lighting',
            params: { ar: '3:4', stylize: 50 }
          },
          sdxl: {
            positive: 'Professional headshot of a business woman, studio lighting',
            negative: 'cartoon, anime',
            params: { width: 768, height: 1024, steps: 35, cfg: 7 }
          }
        },
        notes: ['Use soft lighting', 'Neutral background works best']
      }

      const result = validateAgainstSchema(visualPromptPackSchema, validPack)
      expect(result.ok).toBe(true)
    })

    it('rejects pack with missing providers', () => {
      const invalidPack = {
        intent: 'product_photo'
        // missing providers
      }

      const result = validateAgainstSchema(visualPromptPackSchema, invalidPack)
      expect(result.ok).toBe(false)
    })

    it('rejects pack with empty providers', () => {
      const invalidPack = {
        intent: 'product_photo',
        providers: {}
      }

      const result = validateAgainstSchema(visualPromptPackSchema, invalidPack)
      expect(result.ok).toBe(false)
    })

    it('rejects invalid intent type', () => {
      const invalidPack = {
        intent: 'invalid_intent',
        providers: {
          sdxl: {
            positive: 'A test prompt',
            params: {}
          }
        }
      }

      const result = validateAgainstSchema(visualPromptPackSchema, invalidPack)
      expect(result.ok).toBe(false)
    })

    it('rejects provider without positive prompt', () => {
      const invalidPack = {
        intent: 'generic',
        providers: {
          midjourney_v6: {
            // missing positive
            params: { ar: '1:1' }
          }
        }
      }

      const result = validateAgainstSchema(visualPromptPackSchema, invalidPack)
      expect(result.ok).toBe(false)
    })

    it('rejects positive prompt that is too short', () => {
      const invalidPack = {
        intent: 'generic',
        providers: {
          midjourney_v6: {
            positive: 'short', // less than 10 chars
            params: {}
          }
        }
      }

      const result = validateAgainstSchema(visualPromptPackSchema, invalidPack)
      expect(result.ok).toBe(false)
    })
  })

  describe('runVisualPackChecks', () => {
    it('returns no errors for well-formed pack', () => {
      const pack = {
        intent: 'product_photo',
        providers: {
          midjourney_v6: {
            positive: 'Professional studio photo of a smartphone, clean white background, soft lighting, commercial photography',
            params: { ar: '1:1', stylize: 100 }
          }
        }
      }

      const issues = runVisualPackChecks(pack)
      const errors = issues.filter(i => i.severity === 'error')
      expect(errors).toHaveLength(0)
    })

    it('warns when subject is unclear', () => {
      const pack = {
        intent: 'generic',
        providers: {
          sdxl: {
            positive: 'beautiful colors and textures flowing together',
            params: { steps: 30 }
          }
        }
      }

      const issues = runVisualPackChecks(pack)
      expect(issues.some(i => i.id === VISUAL_CHECKS.HAS_SUBJECT)).toBe(true)
    })

    it('warns when style keywords are missing', () => {
      const pack = {
        intent: 'scene',
        providers: {
          midjourney_v6: {
            positive: 'A mountain with trees and a river nearby',
            params: {}
          }
        }
      }

      const issues = runVisualPackChecks(pack)
      expect(issues.some(i => i.id === VISUAL_CHECKS.HAS_STYLE)).toBe(true)
    })

    it('errors on markdown in positive prompt', () => {
      const pack = {
        intent: 'scene',
        providers: {
          midjourney_v6: {
            positive: '```A beautiful sunset over mountains```',
            params: {}
          }
        }
      }

      const issues = runVisualPackChecks(pack)
      expect(issues.some(i => i.id === VISUAL_CHECKS.NO_MARKDOWN && i.severity === 'error')).toBe(true)
    })

    it('errors on markdown in negative prompt', () => {
      const pack = {
        intent: 'product_photo',
        providers: {
          sdxl: {
            positive: 'A professional photo of a product on white background',
            negative: '# Bad things to avoid\n- blurry',
            params: {}
          }
        }
      }

      const issues = runVisualPackChecks(pack)
      expect(issues.some(i => i.id === VISUAL_CHECKS.NO_MARKDOWN && i.severity === 'error')).toBe(true)
    })

    it('warns on Midjourney stylize param outside bounds', () => {
      const pack = {
        intent: 'product_photo',
        providers: {
          midjourney_v6: {
            positive: 'A professional photo of a product on white background',
            params: { stylize: 2000 } // max is 1000
          }
        }
      }

      const issues = runVisualPackChecks(pack)
      expect(issues.some(i => i.id === VISUAL_CHECKS.PARAMS_VALID)).toBe(true)
    })

    it('warns on SDXL cfg param outside bounds', () => {
      const pack = {
        intent: 'headshot',
        providers: {
          sdxl: {
            positive: 'A professional headshot portrait of a person',
            params: { cfg: 25 } // max is 20
          }
        }
      }

      const issues = runVisualPackChecks(pack)
      expect(issues.some(i => i.id === VISUAL_CHECKS.PARAMS_VALID)).toBe(true)
    })

    it('warns when expected target is missing', () => {
      const pack = {
        intent: 'product_photo',
        providers: {
          midjourney_v6: {
            positive: 'A professional photo of a product with studio lighting',
            params: {}
          }
        }
      }

      const issues = runVisualPackChecks(pack, ['midjourney_v6', 'sdxl'])
      expect(issues.some(i => i.message.includes('sdxl'))).toBe(true)
    })

    it('does not warn when all expected targets are present', () => {
      const pack = {
        intent: 'product_photo',
        providers: {
          midjourney_v6: {
            positive: 'A professional photo of a product with studio lighting',
            params: {}
          },
          sdxl: {
            positive: 'A professional photo of a product with studio lighting',
            params: {}
          }
        }
      }

      const issues = runVisualPackChecks(pack, ['midjourney_v6', 'sdxl'])
      expect(issues.some(i => i.message.includes('not present'))).toBe(false)
    })
  })

  describe('isVisualPromptPack', () => {
    it('returns true for valid pack structure', () => {
      const pack = {
        intent: 'product_photo',
        providers: { midjourney_v6: { positive: 'test', params: {} } }
      }
      expect(isVisualPromptPack(pack)).toBe(true)
    })

    it('returns false for null', () => {
      expect(isVisualPromptPack(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isVisualPromptPack(undefined)).toBe(false)
    })

    it('returns false for non-object', () => {
      expect(isVisualPromptPack('string')).toBe(false)
      expect(isVisualPromptPack(123)).toBe(false)
      expect(isVisualPromptPack([])).toBe(false)
    })

    it('returns false for object without intent', () => {
      expect(isVisualPromptPack({ providers: {} })).toBe(false)
    })

    it('returns false for object without providers', () => {
      expect(isVisualPromptPack({ intent: 'generic' })).toBe(false)
    })

    it('returns false for object with non-object providers', () => {
      expect(isVisualPromptPack({ intent: 'generic', providers: 'not-object' })).toBe(false)
    })
  })

  describe('Intent Types', () => {
    const intents = ['product_photo', 'headshot', 'logo', 'scene', 'generic']

    intents.forEach(intent => {
      it(`accepts "${intent}" as valid intent`, () => {
        const pack = {
          intent,
          providers: {
            midjourney_v6: {
              positive: 'A professional image with detailed description',
              params: {}
            }
          }
        }

        const result = validateAgainstSchema(visualPromptPackSchema, pack)
        expect(result.ok).toBe(true)
      })
    })
  })
})
