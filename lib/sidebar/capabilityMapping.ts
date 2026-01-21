import { Snippet } from '@/lib/types'
import { Capability } from './types'

/**
 * Temporary function to infer capability from existing prompt data.
 *
 * This function provides a best-effort mapping from tags/titles/type to capabilities
 * until the database schema is updated with a dedicated capability field.
 *
 * TODO: Replace with actual capability field from database once migrated.
 *
 * @param snippet - The snippet to infer capability from
 * @returns The inferred capability, defaults to 'writing_text'
 */
export function inferCapability(snippet: Snippet): Capability {
  const tags = snippet.tags?.map(t => t.toLowerCase()) || []
  const title = snippet.title?.toLowerCase() || ''
  const type = snippet.type

  // Image & Visual
  if (
    tags.some(t =>
      ['image', 'visual', 'photo', 'design', 'graphic', 'dalle', 'midjourney',
       'illustration', 'art', 'picture', 'photography'].includes(t)
    ) ||
    title.includes('image') ||
    title.includes('visual') ||
    title.includes('photo') ||
    title.includes('design')
  ) {
    return 'image_visual'
  }

  // Video & Motion
  if (
    tags.some(t =>
      ['video', 'motion', 'animation', 'film', 'youtube', 'tiktok', 'reel',
       'movie', 'clip', 'editing'].includes(t)
    ) ||
    title.includes('video') ||
    title.includes('motion') ||
    title.includes('youtube') ||
    title.includes('tiktok')
  ) {
    return 'video_motion'
  }

  // Audio & Voice
  if (
    tags.some(t =>
      ['audio', 'voice', 'podcast', 'music', 'sound', 'speech', 'tts',
       'voiceover', 'narration', 'song'].includes(t)
    ) ||
    title.includes('audio') ||
    title.includes('voice') ||
    title.includes('podcast') ||
    title.includes('music')
  ) {
    return 'audio_voice'
  }

  // Social & Marketing
  if (
    tags.some(t =>
      ['social', 'twitter', 'linkedin', 'instagram', 'thread', 'post',
       'caption', 'bio', 'hashtag', 'seo', 'marketing', 'ad', 'campaign'].includes(t)
    ) ||
    title.includes('social') ||
    title.includes('thread') ||
    title.includes('tweet') ||
    title.includes('post') ||
    title.includes('marketing')
  ) {
    return 'social_marketing'
  }

  // Automation & Apps
  if (
    type === 'workflow' ||
    tags.some(t =>
      ['automation', 'workflow', 'n8n', 'zapier', 'integration', 'api',
       'webhook', 'trigger', 'action', 'flow'].includes(t)
    ) ||
    title.includes('automation') ||
    title.includes('workflow') ||
    title.includes('integration')
  ) {
    return 'automation_apps'
  }

  // Writing & Text (default fallback)
  // This catches blog posts, articles, copy, scripts, content creation
  if (
    tags.some(t =>
      ['writing', 'text', 'blog', 'article', 'copy', 'script', 'content',
       'essay', 'story', 'newsletter', 'email'].includes(t)
    ) ||
    title.includes('write') ||
    title.includes('text') ||
    title.includes('content') ||
    title.includes('blog') ||
    title.includes('article')
  ) {
    return 'writing_text'
  }

  // Default fallback for any uncategorized prompts
  return 'writing_text'
}
