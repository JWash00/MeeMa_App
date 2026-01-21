# Prompt Toolkit Internal Spec v0.1

## Core Philosophy

**One Engine, Two Surfaces**

Prompt Toolkit uses a single data model to power two distinct user experiences:

1. **Creator Surface** - End users who consume prompts and workflows
2. **Developer Surface** - Contributors who build and maintain content

All official content must pass quality gates before appearing on the Creator Surface.

---

## Official Content Types

| Type | Description | Required Fields |
|------|-------------|-----------------|
| `prompt` | Single-turn prompt template | `title`, `description`, `category`, `code` or `template` |
| `workflow` | Multi-step structured process | `title`, `description`, `category`, `template`, `inputs_schema` |
| `kit` | Collection of related prompts/workflows | `title`, `description`, `category`, `items` |

---

## Workflow Template Standard Blocks

All official workflows MUST include these blocks in their template:

### Required Blocks

| Block | Purpose |
|-------|---------|
| **ROLE** | Define the AI persona and expertise |
| **OBJECTIVE** | Clear statement of what the workflow achieves |
| **OUTPUT FORMAT** | Exact structure of the expected output |
| **QC** | Quality control checklist for self-verification |

### Recommended Blocks

| Block | Purpose |
|-------|---------|
| **INPUTS** | Variables the user must provide |
| **CONSTRAINTS** | Boundaries and limitations |
| **UNCERTAINTY POLICY** | How to handle ambiguous situations |

### Block Format

Blocks should be clearly delimited in the template:

```
## ROLE
You are a [expertise] specialist...

## OBJECTIVE
Create [deliverable] that [criteria]...

## OUTPUT FORMAT
Return the result as:
- [format specification]
```

---

## Versioning Policy

All official content uses semantic versioning:

- Format: `MAJOR.MINOR` (e.g., `1.0`, `1.1`, `2.0`)
- **MAJOR**: Breaking changes to inputs or output structure
- **MINOR**: Improvements, fixes, or additions that maintain compatibility

Default version for unversioned content: `1.0`

---

## Acceptance Criteria

### All Content

- [ ] Has `title` (non-empty)
- [ ] Has `description` (non-empty)
- [ ] Has `category` assigned
- [ ] Has `version` (semver format)
- [ ] Has `audience` specified

### Prompts

- [ ] Has `code` or `template` content
- [ ] OUTPUT FORMAT block recommended

### Workflows

- [ ] Has `template` content
- [ ] Has `inputs_schema` defined
- [ ] Contains ROLE block
- [ ] Contains OBJECTIVE block
- [ ] Contains OUTPUT FORMAT block
- [ ] Contains QC block

---

## Test Pack Checklist

Before marking content as `scope: 'official'`:

1. **Completeness**: All required fields populated
2. **Clarity**: Description explains purpose in one sentence
3. **Structure**: Template follows standard block format
4. **Inputs**: All variables in `inputs_schema` have descriptions
5. **Output**: OUTPUT FORMAT is specific and actionable
6. **QC**: Quality checklist items are verifiable

---

## Rendering Rules for Creator Surface

### Visibility

- Only show content where `audience !== 'developer'`
- Hide incomplete or draft content from Creator Surface
- Show compliance warnings only to contributors (not end users)

### Display Priority

1. Featured workflows (curated list)
2. Recommended (algorithm-based)
3. Category-filtered results
4. Full library

### Type Normalization

- `null`, `undefined`, `''` → treat as `'prompt'`
- Case-insensitive matching for type values
