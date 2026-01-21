# Prompt Test Pack Format v0.1

## Overview

A **Prompt Test Pack** is a JSON file that defines test cases for a specific prompt or workflow. It allows developers to document expected behavior and validate prompt quality without executing live model calls.

**Status**: Documentation only - no execution runner required for v0.1

## Purpose

- Document expected prompt behavior
- Define input/output contracts
- Support future automated testing
- Provide examples for prompt consumers

## File Format

### Structure

```json
{
  "version": "0.1",
  "prompt_id": "workflow_youtube_script_generator_v1",
  "prompt_version": "1.0",
  "description": "Test pack for YouTube Script Generator workflow",
  "test_cases": [
    {
      "id": "test_01_basic_tech_review",
      "description": "Generate script for tech product review",
      "inputs": {
        "topic": "iPhone 15 Pro Review",
        "duration": "10",
        "tone": "informative"
      },
      "assertions": [
        {
          "type": "contains",
          "value": "iPhone 15 Pro",
          "description": "Output should mention the topic"
        },
        {
          "type": "not_contains",
          "value": "Android",
          "description": "Should not mention unrelated platforms"
        },
        {
          "type": "max_words",
          "value": 1500,
          "description": "Script should be concise for 10-minute video"
        }
      ]
    }
  ]
}
```

### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | Yes | Test pack format version (e.g., "0.1") |
| `prompt_id` | string | Yes | Unique identifier matching the prompt/workflow |
| `prompt_version` | string | Yes | Version of the prompt being tested (e.g., "1.0") |
| `description` | string | No | Human-readable description of this test pack |
| `test_cases` | array | Yes | Array of test case objects |

### Test Case Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for this test case |
| `description` | string | No | What this test validates |
| `inputs` | object | Yes | Key-value pairs matching the prompt's inputs_schema |
| `assertions` | array | Yes | Array of assertion objects to validate output |

### Assertion Types

#### 1. `contains`
Checks if the output contains a specific substring (case-insensitive).

```json
{
  "type": "contains",
  "value": "expected text",
  "description": "Output should include this phrase"
}
```

#### 2. `not_contains`
Checks if the output does NOT contain a specific substring (case-insensitive).

```json
{
  "type": "not_contains",
  "value": "forbidden text",
  "description": "Output should not include this phrase"
}
```

#### 3. `regex_match`
Checks if the output matches a regular expression pattern.

```json
{
  "type": "regex_match",
  "value": "^\\[SCENE \\d+\\]",
  "description": "Output should start with scene marker"
}
```

#### 4. `max_words`
Checks if the output has fewer than or equal to the specified word count.

```json
{
  "type": "max_words",
  "value": 2000,
  "description": "Output should not exceed word limit"
}
```

## Usage Guidelines

### Creating Test Packs

1. **One test pack per prompt/workflow version**
   - File naming: `{prompt_id}.v{version}.json`
   - Example: `workflow_youtube_script_generator_v1.v0.1.json`

2. **Start with happy path tests**
   - Test typical, valid inputs first
   - Add edge cases later

3. **Use descriptive test IDs**
   - Format: `test_{number}_{short_description}`
   - Example: `test_01_basic_tech_review`

4. **Write clear assertions**
   - Each assertion should validate one thing
   - Include description explaining why it matters

### Storage Location

Store test packs in:
```
/tests/prompt-packs/{prompt_id}.v{version}.json
```

## Limitations (v0.1)

- **No execution**: Test packs are documentation only
- **No runner**: No automated test execution in this version
- **Manual validation**: Developers must manually verify outputs
- **Static analysis**: Cannot validate dynamic behavior

## Future Enhancements

Potential additions for future versions:

- Test pack runner with model execution
- Additional assertion types (json_schema, length_range, sentiment)
- Performance benchmarks (latency, token count)
- Batch test execution
- CI/CD integration
- Test coverage reports

## Example Use Cases

1. **Documentation**: Show developers how to use a prompt
2. **Regression testing**: Ensure prompt changes don't break existing behavior
3. **Quality gate**: Validate prompts before marking as "verified"
4. **Onboarding**: Help new team members understand prompt expectations

## Related Documentation

- Prompt QA Standards v0.1
- Prompt Toolkit Internal Spec v0.1
- Developer Mode Guide
