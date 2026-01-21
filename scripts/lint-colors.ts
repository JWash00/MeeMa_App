import fs from 'fs'
import path from 'path'

interface ColorViolation {
  file: string
  line: number
  issue: string
  match: string
}

// Forbidden patterns
const FORBIDDEN_PATTERNS = [
  // Tailwind green utilities (except in token files)
  /\b(text|bg|border|ring)-(green|emerald|lime)-\w+/g,

  // Hardcoded hex values (except in token files)
  /#1DB954|#1db954|#1CD760|#1cd760|#2AE174|#2ae174/gi,
]

// Files allowed to use these patterns
const ALLOWLIST = [
  'lib/styles/tokens/colors.ts',
  'scripts/lint-colors.ts',
  'tailwind.config.ts', // Legacy spotify theme preserved for compatibility
  'components/ui/Button.tsx', // Has documented action variant
  'components/library/uiTokens.ts', // Deprecated legacy file
  'components/library/devWarnings.ts', // Internal dev tool
  'components/library/PromptCard.tsx', // Conditional action usage (documented)
]

// Files that MUST NOT use action token
const ACTION_TOKEN_RESTRICTED = /^(?!.*components\/actions\/).*/

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const filePath = path.join(dirPath, file)
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', '.next', 'dist', '.git'].includes(file)) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles)
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      arrayOfFiles.push(filePath)
    }
  })

  return arrayOfFiles
}

async function lintColors(): Promise<ColorViolation[]> {
  const violations: ColorViolation[] = []

  // Find all TS/TSX/JS/JSX files
  const files = getAllFiles('.')

  for (const file of files) {
    // Skip allowlisted files
    if (ALLOWLIST.some(allowed => file.includes(allowed))) continue

    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      // Check forbidden patterns
      FORBIDDEN_PATTERNS.forEach(pattern => {
        const matches = line.matchAll(pattern)
        for (const match of matches) {
          violations.push({
            file,
            line: index + 1,
            issue: 'Forbidden color usage',
            match: match[0],
          })
        }
      })

      // Check action token outside allowed components
      if (ACTION_TOKEN_RESTRICTED.test(file)) {
        if (/\baction\b/.test(line) && (
          /className.*action/.test(line) ||
          /bg-action|text-action|border-action|ring-action/.test(line)
        )) {
          violations.push({
            file,
            line: index + 1,
            issue: 'Action token used outside /components/actions/',
            match: line.trim().substring(0, 80),
          })
        }
      }
    })
  }

  return violations
}

async function main() {
  console.log('🎨 Linting color usage...\n')

  const violations = await lintColors()

  if (violations.length === 0) {
    console.log('✅ All color usage is correct!')
    process.exit(0)
  }

  console.error(`❌ Found ${violations.length} color violations:\n`)

  violations.forEach(v => {
    console.error(`${v.file}:${v.line}`)
    console.error(`  ${v.issue}: ${v.match}\n`)
  })

  process.exit(1)
}

main()
