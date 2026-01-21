// Smart default assertion generator for PromptTest Surface v0.1
// Auto-generates sensible assertions based on snippet content

import { Snippet } from '@/lib/types';
import { Assertion } from './assertions';
import { Modality } from './modality';

/**
 * Extract expected section headers from template using OUTPUT FORMAT block
 */
function extractExpectedSections(template: string): string[] {
  const sections: string[] = [];

  // Look for OUTPUT FORMAT section
  const outputFormatMatch = template.match(/##?\s*OUTPUT\s+FORMAT[\s:]/i);
  if (!outputFormatMatch) return sections;

  // Find the content after OUTPUT FORMAT
  const startIndex = outputFormatMatch.index! + outputFormatMatch[0].length;
  const remainingText = template.substring(startIndex);

  // Look for numbered sections or bullet points
  const numberMatches = remainingText.match(/(?:^|\n)\s*\d+\.\s*([A-Z][A-Z\s]+?)(?:\s*[-:]|$)/gm);
  if (numberMatches) {
    numberMatches.forEach((match) => {
      const section = match.replace(/^\s*\d+\.\s*/, '').trim();
      if (section.length > 2 && section.length < 50) {
        sections.push(section);
      }
    });
  }

  return sections;
}

/**
 * Check if snippet is related to YouTube/video content
 */
function isYouTubeRelated(snippet: Snippet): boolean {
  const searchText = `${snippet.title} ${snippet.description} ${snippet.category || ''}`.toLowerCase();
  return /youtube|video|script|thumbnail|hook|vlog|content creator/i.test(searchText);
}

/**
 * Generate smart default assertions based on snippet content
 * @param snippet - The snippet to generate assertions for
 * @param modality - Optional modality to adapt assertions (defaults to 'text')
 */
export function generateDefaultAssertions(snippet: Snippet, modality: Modality = 'text'): Assertion[] {
  const assertions: Assertion[] = [];
  const template = snippet.template || snippet.code || '';
  const category = snippet.category?.toLowerCase() || '';

  // For image/video: focus on prompt structure checks
  if (modality === 'image' || modality === 'video') {
    // Check for required image blocks (if image modality)
    if (modality === 'image') {
      assertions.push({
        type: 'contains',
        value: 'SUBJECT',
        description: 'Should include SUBJECT block defining what to generate'
      });

      assertions.push({
        type: 'contains',
        value: 'STYLE',
        description: 'Should include STYLE block defining visual aesthetic'
      });

      assertions.push({
        type: 'regex_match',
        value: 'OUTPUT\\s+SETTINGS|SETTINGS|PARAMETERS',
        description: 'Should include output settings or parameters'
      });
    }

    // Check for required video blocks (if video modality)
    if (modality === 'video') {
      assertions.push({
        type: 'contains',
        value: 'SCENE',
        description: 'Should include SCENE block defining video content'
      });

      assertions.push({
        type: 'contains',
        value: 'MOTION',
        description: 'Should include MOTION block defining movement'
      });

      assertions.push({
        type: 'contains',
        value: 'TIMING',
        description: 'Should include TIMING block with duration/pacing'
      });

      assertions.push({
        type: 'regex_match',
        value: 'OUTPUT\\s+SETTINGS|SETTINGS|PARAMETERS',
        description: 'Should include output settings or parameters'
      });
    }

    // Check for placeholder completeness (both image and video)
    const placeholders = template.match(/\{\{([^}]+)\}\}/g) || [];
    if (placeholders.length > 0) {
      assertions.push({
        type: 'not_contains',
        value: '{{',
        description: 'All placeholders should be filled'
      });
    }

    // Check for aspect ratio flags if Midjourney or video platforms
    if (modality === 'image' && (template.includes('--ar') || snippet.tags?.includes('midjourney'))) {
      assertions.push({
        type: 'contains',
        value: '--ar',
        description: 'Should include aspect ratio parameter'
      });
    }

    if (modality === 'video' && (template.includes('--ar') || snippet.tags?.some(t => ['runway', 'pika'].includes(t)))) {
      assertions.push({
        type: 'contains',
        value: '--ar',
        description: 'Should include aspect ratio parameter'
      });
    }

    // Default: check prompt is non-empty and reasonable length (both image and video)
    assertions.push({
      type: 'regex_match',
      value: '.{10,}',
      description: 'Generated prompt should be at least 10 characters'
    });

    return assertions;
  }

  // For text/email: use existing logic

  // Strategy 1: YouTube/Video content - check for common sections
  if (isYouTubeRelated(snippet) || category.includes('youtube') || category.includes('video')) {
    const commonSections = ['HOOK', 'INTRO', 'CALL TO ACTION'];
    commonSections.forEach((section) => {
      assertions.push({
        type: 'contains',
        value: section,
        description: `Output should include ${section} section`,
      });
    });

    // Check for title-related content
    if (template.toLowerCase().includes('title')) {
      assertions.push({
        type: 'contains',
        value: 'TITLE',
        description: 'Output should include title ideas or suggestions',
      });
    }
  }

  // Strategy 2: Extract expected sections from OUTPUT FORMAT
  const expectedSections = extractExpectedSections(template);
  if (expectedSections.length > 0) {
    expectedSections.forEach((section) => {
      assertions.push({
        type: 'contains',
        value: section,
        description: `Output should include ${section} section`,
      });
    });
  }

  // Strategy 3: Fallback - check for snippet title substring
  if (assertions.length === 0 && snippet.title) {
    const titleWords = snippet.title.split(/\s+/).slice(0, 3).join(' ');
    assertions.push({
      type: 'contains',
      value: titleWords,
      description: `Output should reference the topic: "${titleWords}"`,
    });
  }

  // Strategy 4: Infer word limit from inputs or category
  let maxWords = 2000; // default

  // Check if there's a duration field in inputs_schema
  if (snippet.inputs_schema) {
    const durationField = Object.values(snippet.inputs_schema).find(
      (field) => field.label.toLowerCase().includes('duration') || field.label.toLowerCase().includes('length')
    );

    if (durationField && durationField.default) {
      const duration = parseInt(durationField.default, 10);
      if (!isNaN(duration)) {
        // Rough estimate: 150 words per minute of video
        maxWords = duration * 150;
      }
    }
  }

  // Always include a max_words check
  assertions.push({
    type: 'max_words',
    value: maxWords,
    description: `Output should not exceed ${maxWords} words`,
  });

  // Strategy 5: If template mentions "do not" or "avoid", create not_contains checks
  const avoidMatches = template.match(/(?:do not|avoid|never|don't)\s+(?:include|mention|use)\s+["']?([^"'\n.]{3,30})["']?/gi);
  if (avoidMatches && avoidMatches.length > 0) {
    // Take first match
    const firstMatch = avoidMatches[0];
    const forbidden = firstMatch.match(/["']([^"']+)["']/) || firstMatch.match(/\s+([a-z]+)\s*$/i);
    if (forbidden && forbidden[1]) {
      assertions.push({
        type: 'not_contains',
        value: forbidden[1],
        description: `Output should not contain "${forbidden[1]}"`,
      });
    }
  }

  return assertions;
}
