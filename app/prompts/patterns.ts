import type { IntentPattern, PatternDefinition } from './types'

export const PATTERNS: Record<IntentPattern, PatternDefinition> = {
  thumbnail: {
    label: 'Thumbnail / Cover',
    keywords: ['thumbnail', 'cover', 'youtube', 'tiktok', 'instagram', 'social', 'click', 'banner'],
    inputs: [
      { key: 'subject', label: 'Main Subject', kind: 'text', required: true, placeholder: 'e.g. person reacting, product reveal' },
      { key: 'style', label: 'Visual Style', kind: 'text', required: true, placeholder: 'e.g. cyberpunk, minimalist, bold' },
      { key: 'text', label: 'Text Overlay (optional)', kind: 'text', required: false, placeholder: 'e.g. "WOW!", "NEW"' },
    ],
    canonicalTemplate: '{subject}, {style} style, eye-catching composition, vibrant colors, high contrast, {text}',
  },

  portrait: {
    label: 'Portrait / Character',
    keywords: ['portrait', 'character', 'person', 'face', 'headshot', 'profile', 'hero', 'avatar'],
    inputs: [
      { key: 'subject', label: 'Subject Description', kind: 'text', required: true, placeholder: 'e.g. young woman, warrior, businessman' },
      { key: 'mood', label: 'Mood', kind: 'select', required: true, options: ['dramatic', 'peaceful', 'mysterious', 'energetic', 'melancholic'] },
      { key: 'lighting', label: 'Lighting', kind: 'select', required: true, options: ['cinematic', 'natural', 'studio', 'neon', 'golden hour'] },
    ],
    canonicalTemplate: '{subject}, {mood} atmosphere, {lighting} lighting, cinematic composition, shallow depth of field, detailed features',
  },

  product: {
    label: 'Product Shot',
    keywords: ['product', 'item', 'object', 'merchandise', 'ecommerce', 'packshot', 'commercial', 'tiktok', 'promo', 'vertical'],
    inputs: [
      { key: 'product', label: 'Product', kind: 'text', required: true, placeholder: 'e.g. sneaker, perfume bottle, watch' },
      { key: 'background', label: 'Background', kind: 'text', required: true, placeholder: 'e.g. marble surface, gradient, floating' },
      { key: 'style', label: 'Photography Style', kind: 'select', required: true, options: ['minimal', 'luxury', 'lifestyle', 'editorial', 'tech'] },
    ],
    canonicalTemplate: '{product} on {background}, {style} product photography, studio lighting, commercial quality, sharp details',
    artifacts: ['product_shot', 'thumbnail_cover'],
  },

  landscape: {
    label: 'Landscape / Environment',
    keywords: ['landscape', 'environment', 'scenery', 'nature', 'world', 'place', 'location', 'scene', 'vista'],
    inputs: [
      { key: 'environment', label: 'Environment', kind: 'text', required: true, placeholder: 'e.g. mountain valley, alien planet, futuristic city' },
      { key: 'time', label: 'Time of Day', kind: 'select', required: true, options: ['sunrise', 'midday', 'sunset', 'night', 'twilight'] },
      { key: 'atmosphere', label: 'Atmosphere', kind: 'select', required: true, options: ['serene', 'dramatic', 'mysterious', 'epic', 'dreamy'] },
    ],
    canonicalTemplate: '{environment} during {time}, {atmosphere} mood, epic scale, volumetric lighting, detailed environment, cinematic wide shot',
  },

  poster: {
    label: 'Poster / Artwork',
    keywords: ['poster', 'artwork', 'print', 'retro', 'vintage', 'art', 'illustration', 'graphic'],
    inputs: [
      { key: 'subject', label: 'Subject', kind: 'text', required: true, placeholder: 'e.g. astronaut, jazz musician, robot' },
      { key: 'era', label: 'Art Era/Style', kind: 'select', required: true, options: ['art deco', 'psychedelic 60s', 'soviet propaganda', 'japanese woodblock', 'modern minimal'] },
      { key: 'colors', label: 'Color Palette', kind: 'text', required: false, placeholder: 'e.g. red and gold, muted pastels' },
    ],
    canonicalTemplate: '{subject} in {era} style, {colors} color palette, poster art, bold composition, graphic design quality',
  },

  abstract: {
    label: 'Abstract Art',
    keywords: ['abstract', 'artistic', 'conceptual', 'non-representational', 'geometric', 'fluid', 'expressionist'],
    inputs: [
      { key: 'colors', label: 'Colors', kind: 'text', required: true, placeholder: 'e.g. deep blues and golds, neon rainbow' },
      { key: 'shapes', label: 'Forms/Shapes', kind: 'select', required: true, options: ['geometric', 'organic', 'fluid', 'fractured', 'layered'] },
      { key: 'mood', label: 'Feeling', kind: 'select', required: true, options: ['calm', 'chaotic', 'balanced', 'tense', 'euphoric'] },
    ],
    canonicalTemplate: 'Abstract composition with {colors}, {shapes} forms, {mood} feeling, contemporary art style, high resolution, gallery quality',
  },

  food: {
    label: 'Food Photography',
    keywords: ['food', 'dish', 'meal', 'cuisine', 'recipe', 'cooking', 'restaurant', 'delicious'],
    inputs: [
      { key: 'dish', label: 'Dish/Food', kind: 'text', required: true, placeholder: 'e.g. sushi platter, chocolate cake, pasta' },
      { key: 'setting', label: 'Setting', kind: 'text', required: true, placeholder: 'e.g. rustic wooden table, marble counter, outdoor cafe' },
      { key: 'style', label: 'Photography Style', kind: 'select', required: true, options: ['editorial', 'rustic', 'minimal', 'dark moody', 'bright airy'] },
    ],
    canonicalTemplate: '{dish} in {setting}, {style} food photography, appetizing presentation, natural lighting, shallow depth of field',
  },

  architecture: {
    label: 'Architecture',
    keywords: ['architecture', 'building', 'structure', 'interior', 'exterior', 'design', 'space', 'room'],
    inputs: [
      { key: 'building', label: 'Building/Space', kind: 'text', required: true, placeholder: 'e.g. modern skyscraper, gothic cathedral, minimalist home' },
      { key: 'angle', label: 'Camera Angle', kind: 'select', required: true, options: ['eye level', 'low angle', 'aerial', 'interior wide', 'detail shot'] },
      { key: 'time', label: 'Time/Lighting', kind: 'select', required: true, options: ['golden hour', 'blue hour', 'midday', 'night illuminated', 'overcast'] },
    ],
    canonicalTemplate: '{building}, {angle} perspective, {time}, architectural photography, clean lines, dramatic composition, professional quality',
  },

  fashion: {
    label: 'Fashion Editorial',
    keywords: ['fashion', 'style', 'clothing', 'outfit', 'model', 'editorial', 'vogue', 'runway', 'couture'],
    inputs: [
      { key: 'subject', label: 'Model/Subject', kind: 'text', required: true, placeholder: 'e.g. elegant woman, male model, diverse group' },
      { key: 'outfit', label: 'Outfit/Style', kind: 'text', required: true, placeholder: 'e.g. haute couture gown, streetwear, vintage suit' },
      { key: 'setting', label: 'Setting', kind: 'text', required: true, placeholder: 'e.g. urban rooftop, studio backdrop, Paris street' },
    ],
    canonicalTemplate: '{subject} wearing {outfit}, {setting}, editorial fashion photography, high contrast, striking pose, magazine quality',
  },

  animation: {
    label: 'Animation / Video',
    keywords: ['animation', 'animate', 'video', 'motion', 'moving', 'clip', 'loop', 'gif', 'cinematic'],
    inputs: [
      { key: 'subject', label: 'Subject', kind: 'text', required: true, placeholder: 'e.g. ocean waves, dancing character, flying through clouds' },
      { key: 'motion', label: 'Motion Type', kind: 'select', required: true, options: ['subtle', 'dynamic', 'smooth loop', 'dramatic', 'slow motion'] },
      { key: 'camera', label: 'Camera Movement', kind: 'select', required: false, options: ['static', 'slow pan', 'zoom in', 'orbit', 'tracking'] },
    ],
    canonicalTemplate: '{subject}, {motion} motion, {camera} camera, cinematic quality, smooth animation, atmospheric lighting',
  },
}
