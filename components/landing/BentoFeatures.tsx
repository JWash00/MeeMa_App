'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Code2, Package, TestTube2, Shield } from 'lucide-react'
import { fadeSlideUp, staggerContainer } from '@/lib/landing/animations'
import Surface from '@/components/ui/Surface'
import { useCardTilt } from '@/lib/hooks/useCardTilt'

const features = [
  {
    icon: Code2,
    title: "AI Snippets",
    description: "Patterns with retries, rate limits, and streaming.",
    tags: ["Retries", "Rate Limits", "Streaming"],
    span: "md:col-span-2"
  },
  {
    icon: Package,
    title: "SDK Generation",
    description: "Generate internal wrappers.",
    tags: ["Code Gen", "Custom Wrappers"],
    span: "md:col-span-1"
  },
  {
    icon: TestTube2,
    title: "Prompt Testing",
    description: "Test across providers.",
    tags: ["Multi-Provider", "Regression Tests"],
    span: "md:col-span-1"
  },
  {
    icon: Shield,
    title: "Defaults",
    description: "Guardrails and structured outputs.",
    tags: ["Guardrails", "Structure"],
    span: "md:col-span-2"
  }
]

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
  const tiltRef = useCardTilt({ maxTilt: 8, scale: 1.02 })

  return (
    <motion.div
      variants={fadeSlideUp}
      className={feature.span}
    >
      <Surface variant="card" className="h-full">
        <div ref={tiltRef as any} className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl bg-huly-accent/10 border border-huly-accent/20 flex items-center justify-center mb-6 group-hover:bg-huly-accent/20 transition-colors">
                      <feature.icon size={24} className="text-huly-accent" />
                    </div>

                    <h3 className="text-xl font-heading font-bold text-huly-white mb-3">
                      {feature.title}
                    </h3>

                    <p className="text-base text-huly-lightgray font-body leading-relaxed mb-6 flex-grow">
                      {feature.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {feature.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-block px-3 py-1 rounded-full bg-huly-gray/50 text-huly-lightgray text-xs font-body"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Surface>
              </motion.div>
  )
}

export default function BentoFeatures() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={staggerContainer}
          className="space-y-12"
        >
          {/* Section Header */}
          <motion.div variants={fadeSlideUp} className="max-w-3xl">
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-huly-white tracking-tight leading-tight mb-4">
              Four capabilities.
            </h2>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
