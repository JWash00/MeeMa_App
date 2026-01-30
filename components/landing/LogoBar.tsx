'use client'

import Image from 'next/image'
import { InfiniteSlider } from '../ui/infinite-slider'

const logos = [
  { name: 'OpenAI', src: '/logos/openai.svg' },
  { name: 'Claude', src: '/logos/claude.svg' },
  { name: 'Gemini', src: '/logos/gemini.svg' },
  { name: 'Perplexity', src: '/logos/perplexity.svg' },
  { name: 'Midjourney', src: '/logos/midjourney.svg' },
  { name: 'Grok', src: '/logos/grok.svg' },
  { name: 'Figma', src: '/logos/figma.svg' },
  { name: 'ElevenLabs', src: '/logos/elevenlabs.svg' },
  { name: 'Anthropic', src: '/logos/anthropic.svg' },
  { name: 'Galaxy AI', src: '/logos/galaxyai.svg' },
  { name: 'ByteDance', src: '/logos/bytedance.svg' },
  { name: 'Veo 3', src: '/logos/veo.svg' },
  { name: 'Hailuo', src: '/logos/hailuo.svg' },
  { name: 'HeyGen', src: '/logos/heygen.svg' },
  { name: 'Higgsfield', src: '/logos/higgsfield.svg' },
  { name: 'Veed', src: '/logos/veed.svg' },
  { name: 'Ideogram', src: '/logos/ideogram.svg' },
  { name: 'Kling', src: '/logos/kling.svg' },
  { name: 'LangChain', src: '/logos/langchain.svg' },
  { name: 'LTX', src: '/logos/lightricks.svg' },
  { name: 'Lovable', src: '/logos/lovable.svg' },
  { name: 'Luma', src: '/logos/luma.svg' },
  { name: 'Make', src: '/logos/make.svg' },
  { name: 'Meshy AI', src: '/logos/meshy.svg' },
  { name: 'n8n', src: '/logos/n8n.svg' },
  { name: 'NanoBanana Pro', src: '/logos/nanobanana.svg' },
  { name: 'Ollama', src: '/logos/ollama.svg' },
  { name: 'Pika', src: '/logos/pika.svg' },
  { name: 'Pixverse', src: '/logos/pixverse.svg' },
  { name: 'Recraft', src: '/logos/recraft.svg' },
  { name: 'Reve', src: '/logos/reve.svg' },
  { name: 'Runway', src: '/logos/runway.svg' },
  { name: 'Sora 2', src: '/logos/sora.svg' },
  { name: 'Stable Diffusion', src: '/logos/stablediffusion.svg' },
  { name: 'Topaz', src: '/logos/topazlabs.svg' },
  { name: 'Vidu', src: '/logos/vidu.svg' },
  { name: 'Wan', src: '/logos/wan.svg' },

]

export default function LogoBar() {
  return (
    <section className="py-8 bg-white overflow-hidden">
      <InfiniteSlider gap={16} duration={30}>
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-full shadow-sm"
          >
            <Image
              src={logo.src}
              alt={logo.name}
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <span className="text-base font-medium text-gray-800 whitespace-nowrap">
              {logo.name}
            </span>
          </div>
        ))}
      </InfiniteSlider>
    </section>
  )
}
