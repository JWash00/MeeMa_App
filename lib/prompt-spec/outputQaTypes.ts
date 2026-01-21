/**
 * Output QA Types for MPS v0.1
 * Types for validating LLM outputs against schemas
 */

export type QaSeverity = 'error' | 'warn'

export interface QaIssue {
  id: string // e.g., "mps.json.valid", "mps.schema.match", "mps.no.markdown"
  severity: QaSeverity
  message: string
  path?: string // JSON pointer-like path if applicable
}

export type QaResult<T = unknown> =
  | {
      ok: true
      parsed: T // parsed output (object for json format)
      raw: string // original raw text
      issues: QaIssue[] // warnings may still exist
      repaired: boolean
    }
  | {
      ok: false
      raw: string
      issues: QaIssue[] // includes errors
      repaired: boolean
      lastParsed?: unknown // if JSON parse succeeded but schema failed
    }
