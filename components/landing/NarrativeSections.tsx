'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { AlertCircle, CheckCircle2, Code2, TestTube2 } from 'lucide-react'
import { fadeSlideUp } from '@/lib/landing/animations'

const problemPoints = [
  "Prompts break in production.",
  "Code is inconsistent.",
  "Testing is manual."
]

const solutionSteps = [
  {
    icon: Code2,
    title: "Discover",
    description: "Patterns for AI calls."
  },
  {
    icon: CheckCircle2,
    title: "Standardize",
    description: "Generate an internal SDK."
  },
  {
    icon: TestTube2,
    title: "Validate",
    description: "Test prompts before shipping."
  }
]

export default function NarrativeSections() {
  const problemRef = useRef(null)
  const solutionRef = useRef(null)
  const problemInView = useInView(problemRef, { once: true, margin: "-100px" })
  const solutionInView = useInView(solutionRef, { once: true, margin: "-100px" })

  return (
    <div className="relative">
      {/* Problem Section */}
      <section ref={problemRef} className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            animate={problemInView ? "show" : "hidden"}
            variants={fadeSlideUp}
            className="space-y-8"
          >
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-huly-white tracking-tight leading-tight max-w-3xl">
              AI integrations are repetitive.
            </h2>

            <div className="max-w-2xl space-y-4 text-lg text-huly-lightgray font-body font-light leading-relaxed">
              {problemPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-huly-accent flex-shrink-0" />
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section ref={solutionRef} id="features" className="py-24 sm:py-32 bg-huly-darkgray/30">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            animate={solutionInView ? "show" : "hidden"}
            variants={fadeSlideUp}
            className="space-y-12"
          >
            <div>
              <h2 className="text-4xl sm:text-5xl font-heading font-bold text-huly-white tracking-tight leading-tight max-w-3xl">
                Three steps.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {solutionSteps.map((step, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-huly-accent/10 border border-huly-accent/20 flex items-center justify-center">
                      <step.icon size={20} className="text-huly-accent" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-huly-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-base text-huly-lightgray font-body leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
