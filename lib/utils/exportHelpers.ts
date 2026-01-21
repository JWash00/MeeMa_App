import { Snippet } from '@/lib/types'
import { getRawTemplateText, normalizeVersion } from './snippetHelpers'

/**
 * Download a file in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export snippet as JSON file
 */
export function exportAsJson(snippet: Snippet): void {
  const exportData = {
    id: snippet.id,
    type: snippet.type || 'prompt',
    version: normalizeVersion(snippet),
    category: snippet.category || null,
    audience: snippet.audience || null,
    title: snippet.title,
    description: snippet.description,
    tags: snippet.tags,
    provider: snippet.provider || null,
    scope: snippet.scope,
    inputs_schema: snippet.type === 'workflow' ? snippet.inputs_schema : undefined,
    template: getRawTemplateText(snippet),
    created_at: snippet.created_at || null,
    updated_at: snippet.updated_at || null
  }

  const json = JSON.stringify(exportData, null, 2)
  const filename = `${snippet.id}.json`
  downloadFile(json, filename, 'application/json')
}

/**
 * Export snippet as Markdown file
 */
export function exportAsMarkdown(snippet: Snippet): void {
  const version = normalizeVersion(snippet)
  const template = getRawTemplateText(snippet)
  const isWorkflow = snippet.type === 'workflow'

  let markdown = `---
title: "${snippet.title}"
type: ${snippet.type || 'prompt'}
version: ${version}
category: ${snippet.category || 'uncategorized'}
audience: ${snippet.audience || 'both'}
tags: [${snippet.tags.map(t => `"${t}"`).join(', ')}]
provider: ${snippet.provider || 'none'}
scope: ${snippet.scope}
---

# ${snippet.title}

${snippet.description}

`

  if (isWorkflow && snippet.inputs_schema) {
    markdown += `## Inputs Schema

\`\`\`json
${JSON.stringify(snippet.inputs_schema, null, 2)}
\`\`\`

`
  }

  markdown += `## Template

\`\`\`text
${template}
\`\`\`
`

  const filename = `${snippet.id}.md`
  downloadFile(markdown, filename, 'text/markdown')
}

/**
 * Copy template as markdown code block
 */
export function getTemplateAsMarkdown(snippet: Snippet): string {
  const template = getRawTemplateText(snippet)
  return `\`\`\`text\n${template}\n\`\`\``
}
