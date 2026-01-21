export interface MeeemaPrompt {
  id: string
  title: string
  category: string
  prompt: string
  updatedAt: string
  liked: boolean
}

export const mockPrompts: MeeemaPrompt[] = [
  {
    id: '1',
    title: 'Viral Hook Generator',
    category: 'Hooks',
    prompt: 'Create a viral hook for a video about [TOPIC]. The hook should grab attention in the first 3 seconds, create curiosity, and make viewers want to keep watching. Keep it punchy and under 10 words.',
    updatedAt: '2d ago',
    liked: false,
  },
  {
    id: '2',
    title: 'TikTok Script Template',
    category: 'TikTok',
    prompt: 'Write a 30-second TikTok script about [TOPIC] that follows this structure: Hook (3 sec) → Problem (5 sec) → Solution (15 sec) → Call to action (7 sec). Use casual language and include suggestions for on-screen text.',
    updatedAt: '3d ago',
    liked: true,
  },
  {
    id: '3',
    title: 'YouTube Outline Builder',
    category: 'YouTube',
    prompt: 'Create a YouTube video outline for [TOPIC] with timestamps. Include: Intro hook, 3-5 main points with sub-points, transition phrases, and a strong outro with CTA. Format for a [LENGTH] minute video.',
    updatedAt: '1w ago',
    liked: false,
  },
  {
    id: '4',
    title: 'Caption Writer Pro',
    category: 'Captions',
    prompt: 'Write an engaging Instagram caption for [CONTENT TYPE] about [TOPIC]. Start with a hook line, add 2-3 short paragraphs with line breaks, include relevant emojis naturally, and end with a question to drive engagement.',
    updatedAt: '2d ago',
    liked: true,
  },
  {
    id: '5',
    title: 'Ad Angle Generator',
    category: 'Ads',
    prompt: 'Generate 5 unique ad angles for [PRODUCT/SERVICE] targeting [AUDIENCE]. Focus on different emotional triggers: fear of missing out, social proof, transformation, urgency, and curiosity. Keep each angle to 2 sentences.',
    updatedAt: '4d ago',
    liked: false,
  },
  {
    id: '6',
    title: 'Newsletter Blurb',
    category: 'Email',
    prompt: "Write a newsletter intro about [TOPIC] that's warm, conversational, and gets to the point fast. Open with a relatable observation, transition to why this matters, and tease what's in the email. Max 100 words.",
    updatedAt: '1w ago',
    liked: false,
  },
  {
    id: '7',
    title: 'Story Arc Builder',
    category: 'YouTube',
    prompt: 'Create a story arc for a [LENGTH] minute video about [TOPIC]. Include: Setup (introduce problem), Rising action (build tension), Climax (key moment), Resolution (solution), and Takeaway (lesson). Add emotional beats.',
    updatedAt: '5d ago',
    liked: true,
  },
  {
    id: '8',
    title: 'Reel Transition Ideas',
    category: 'TikTok',
    prompt: 'Suggest 5 creative transitions for a Reel about [TOPIC]. Each transition should match the content beat and create visual interest. Format: [Transition type] → [When to use it] → [Why it works].',
    updatedAt: '3d ago',
    liked: false,
  },
  {
    id: '9',
    title: 'CTA Variations',
    category: 'Hooks',
    prompt: 'Write 10 different calls-to-action for [CONTENT TYPE] about [TOPIC]. Mix soft CTAs (questions, invitations) and direct CTAs (commands). Keep each under 15 words. Avoid salesy language.',
    updatedAt: '6d ago',
    liked: false,
  },
  {
    id: '10',
    title: 'Value Bomb Script',
    category: 'YouTube',
    prompt: 'Create a value bomb script: deliver [NUMBER] actionable tips about [TOPIC] in under 60 seconds. Each tip should be one clear sentence. Start with "Here is what works:" and number each tip. No fluff.',
    updatedAt: '2d ago',
    liked: true,
  },
  {
    id: '11',
    title: 'Story Opener',
    category: 'Captions',
    prompt: 'Write a story-driven opener for content about [TOPIC]. Start with a specific moment or scene that hooks emotionally, use present tense for immediacy, and end with a transition that leads into the main point. 3-4 sentences max.',
    updatedAt: '1w ago',
    liked: false,
  },
  {
    id: '12',
    title: 'Urgency Framework',
    category: 'Ads',
    prompt: 'Create an urgency-driven ad for [PRODUCT/SERVICE]. Structure: Attention-grabbing statement → Problem this solves → Why now matters → What happens if they wait → Clear next step. Use time-sensitive language without being pushy.',
    updatedAt: '4d ago',
    liked: false,
  },
]
