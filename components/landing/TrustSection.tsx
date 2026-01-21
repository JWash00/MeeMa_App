'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Check, X } from 'lucide-react'
import { fadeSlideUp, staggerContainer } from '@/lib/landing/animations'

const isContent = [
  "Code you own.",
  "Patterns for AI calls.",
  "Internal SDK generation.",
  "Prompt testing."
]

const isNotContent = [
  "Chat playground.",
  "Template marketplace.",
  "Observability tool.",
  "Analytics dashboard."
]

export default function TrustSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-huly-darkgray/30">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={staggerContainer}
          className="space-y-12"
        >
          {/* Section Header */}
          <motion.div variants={fadeSlideUp} className="text-center">
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-huly-white tracking-tight leading-tight mb-4">
              Built for shipping.
            </h2>
          </motion.div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {/* IS */}
            <motion.div
              variants={fadeSlideUp}
              className="bg-huly-darkgray border border-status-success/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-status-success/10 flex items-center justify-center">
                  <Check size={20} className="text-status-success" />
                </div>
                <h3 className="text-xl font-heading font-bold text-huly-white">
                  Prompt Toolkit is
                </h3>
              </div>

              <ul className="space-y-4">
                {isContent.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check size={18} className="text-status-success flex-shrink-0 mt-0.5" />
                    <span className="text-base text-huly-white font-body">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* IS NOT */}
            <motion.div
              variants={fadeSlideUp}
              className="bg-huly-darkgray border border-huly-gray rounded-2xl p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-huly-gray/50 flex items-center justify-center">
                  <X size={20} className="text-huly-lightgray" />
                </div>
                <h3 className="text-xl font-heading font-bold text-huly-white">
                  Prompt Toolkit is not
                </h3>
              </div>

              <ul className="space-y-4">
                {isNotContent.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X size={18} className="text-huly-lightgray flex-shrink-0 mt-0.5" />
                    <span className="text-base text-huly-lightgray font-body">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
