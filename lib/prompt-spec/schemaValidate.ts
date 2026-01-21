/**
 * JSON Schema validation using AJV
 * Validates parsed outputs against JSON Schema Draft 2020-12
 */

import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import type { QaIssue } from './outputQaTypes'

const ajv = new Ajv({ allErrors: true, strict: false }) // strict:false for user schemas
addFormats(ajv)

/**
 * Validate data against JSON Schema
 * Returns structured result with QA issues for errors
 */
export function validateAgainstSchema(
  schema: unknown,
  data: unknown
): { ok: true } | { ok: false; issues: QaIssue[] } {
  try {
    const validate = ajv.compile(schema as object)
    const valid = validate(data)

    if (valid) {
      return { ok: true }
    }

    const issues: QaIssue[] = (validate.errors || []).map(err => ({
      id: 'mps.schema.match',
      severity: 'error' as const,
      message: `Schema validation failed: ${err.message || 'Unknown error'}`,
      path: err.instancePath || err.schemaPath
    }))

    return { ok: false, issues }
  } catch (error) {
    return {
      ok: false,
      issues: [{
        id: 'mps.schema.match',
        severity: 'error',
        message: `Schema compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }]
    }
  }
}
