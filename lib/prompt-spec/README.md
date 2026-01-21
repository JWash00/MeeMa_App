# Meema Prompt Spec (MPS) v0.1

Framework-agnostic prompt specification for production-ready AI workflows.

## Overview

MPS provides a strongly-typed contract for defining, validating, and sharing prompts across platforms:
- **PromptKit UI**: Native support for viewing and editing MPS prompts
- **n8n**: Import MPS workflows as reusable nodes
- **Zapier/Make**: Consume MPS prompts via webhooks
- **Custom Agents**: Parse MPS JSON for automation

## Quick Start

```typescript
import { validateFull, snippetToMps } from '@/lib/prompt-spec'

// Convert existing Snippet to MPS
const mps = snippetToMps(snippet)

// Validate MPS
const result = validateFull(mps)
if (!result.valid) {
  console.error('Validation errors:', result.errors)
}

// Export as JSON for n8n
const json = JSON.stringify(mps, null, 2)
```

## Schema Version

**Current**: `mps.v0.1`

All MPS objects must include `"schemaVersion": "mps.v0.1"` for validation.

## Core Concepts

### 1. Trust Levels

- **Basic**: Unverified prompts, minimal quality checks
- **Verified**: Passed QA checks (score > 70), has required blocks
- **Gold**: Production-ready (score > 90), comprehensive validation

### 2. Required Blocks

All prompts must include these structured sections:

- **TASK**: What the prompt does (clear objective)
- **INPUTS**: User-provided parameters (for workflows)
- **CONSTRAINTS**: Rules and limitations
- **OUTPUT_FORMAT**: Expected response structure
- **QUALITY_CHECKS**: Validation criteria

### 3. Workflow Support

Workflows extend prompts with:
- Template placeholders: `{{input_name}}`
- Input schema: Type, validation, options
- Output schema: JSON Schema for structured responses
- Placeholder alignment validation

### 4. Agent Readiness

Indicates automation platform compatibility:
- `isReady`: Boolean flag
- `automationPlatforms`: n8n, zapier, make, custom
- `requiredCapabilities`: External APIs/services needed

## Type Hierarchy

```
MeemaPrompt
├── schemaVersion: 'mps.v0.1'
├── content: PromptContent
│   ├── text: string (raw prompt)
│   └── blocks: PromptBlock[] (structured sections)
├── inputs: PromptInput[] (for workflows)
├── outputs: PromptOutput (format + schema)
├── quality: PromptQuality
│   ├── trustLevel: 'basic' | 'verified' | 'gold'
│   ├── status: 'draft' | 'published' | 'production'
│   ├── checks: { hasRequiredBlocks, hasInputsSchema, ... }
│   └── issues: QaIssue[]
├── execution: PromptExecution
│   ├── provider: 'openai' | 'anthropic' | ...
│   ├── model: string
│   └── temperature, maxTokens, etc.
└── agentReadiness: AgentReadiness
    ├── isReady: boolean
    ├── automationPlatforms: string[]
    └── requiredCapabilities: string[]
```

## Validation

### Schema Validation
```typescript
import { validateMps } from '@/lib/prompt-spec'

const result = validateMps(promptObject)
// Returns: { valid: boolean, errors: Array<{ path, message, code }> }
```

### Structure Validation
```typescript
import { validateStructure } from '@/lib/prompt-spec'

const result = validateStructure(mps)
// Checks: required blocks, placeholder alignment
```

### Full Validation
```typescript
import { validateFull } from '@/lib/prompt-spec'

const result = validateFull(promptObject)
// Runs both schema + structure validation
```

## Conversion

### Snippet → MPS
```typescript
import { snippetToMps } from '@/lib/prompt-spec'

const mps = snippetToMps(snippet)
// Maps: QA score → trust level
//       inputs_schema → PromptInput[]
//       compliance issues → quality.issues
```

### MPS → Snippet
```typescript
import { mpsToSnippet } from '@/lib/prompt-spec'

const snippet = mpsToSnippet(mps)
// Returns: Partial<Snippet> for database persistence
```

## Rendering

### Render Prompt with Inputs
```typescript
import { renderPrompt } from '@/lib/prompt-spec'

const rendered = renderPrompt(mps, {
  video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
  summary_style: 'Professional',
  max_length: 'Medium (200-500 words)'
})

if (rendered.inputValidation.valid) {
  console.log('Messages:', rendered.messages)
  console.log('Execution config:', rendered.executionConfig)
} else {
  console.error('Validation errors:', rendered.inputValidation.errors)
}
```

### Convert to n8n Payload
```typescript
import { renderPrompt, toN8nPayload } from '@/lib/prompt-spec'

const rendered = renderPrompt(mps, inputs)
if (rendered.inputValidation.valid) {
  const n8nPayload = toN8nPayload(rendered)
  // Send to n8n webhook
}
```

### Reserved Placeholder Keys

The renderer automatically injects these reserved keys:

- `{{output_schema}}`: JSON Schema from `prompt.outputs.schema`
- `{{quality_checks}}`: Content from QUALITY_CHECKS or QC block

Disable injection via options:
```typescript
const rendered = renderPrompt(mps, inputs, {
  includeOutputSchema: false,
  includeQualityChecks: false
})
```

## Examples

See `examples/` directory:
- **youtube-summarizer.json**: Full workflow with inputs, outputs, agent readiness

## Integration with Existing Systems

### QA System (`lib/qa/`)
- MPS `quality.score` = QA evaluation score
- MPS `quality.checks` = QA checks (hasObjective, hasOutputFormat, etc.)
- MPS `quality.issues` = QA issues + compliance issues

### Trust System (`lib/trust/`)
- 'draft' QA level → 'basic' trust
- 'verified' QA level → 'verified' trust
- 'verified' + score ≥ 90 → 'gold' trust

### Spec Compliance (`lib/spec/`)
- Compliance issues merged into MPS `quality.issues`
- Version validation included in schema

## Roadmap

### v0.2 (Planned)
- Execution history tracking
- Version diffing
- Multi-language support (i18n)
- Advanced output validation

### v1.0 (Target)
- Finalized schema (breaking changes frozen)
- Official n8n integration package
- Automated trust scoring
- Community prompt marketplace

## See Also

- [JSON Schema](./schema.json) - Full validation schema
- [Type Definitions](./types.ts) - TypeScript interfaces
- [Examples](./examples/) - Working examples
