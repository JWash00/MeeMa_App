'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { fadeSlideUp, staggerContainer } from '@/lib/landing/animations'

export default function FinalCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={staggerContainer}
          className="relative"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-radial-accent blur-3xl opacity-20 rounded-3xl" />

          {/* Content Panel */}
          <div className="relative bg-huly-darkgray border border-huly-accent/30 rounded-3xl p-12 sm:p-16 text-center overflow-hidden">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />

            <div className="relative z-10">
              <motion.div variants={fadeSlideUp}>
                <h2 className="text-4xl sm:text-5xl font-heading font-bold text-huly-white tracking-tight leading-tight mb-6">
                  Standardize AI.
                </h2>
              </motion.div>

              <motion.p
                variants={fadeSlideUp}
                className="text-lg sm:text-xl text-huly-lightgray font-body font-light max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                Patterns. SDKs. Testing.
              </motion.p>

              <motion.div
                variants={fadeSlideUp}
                className="flex flex-wrap gap-4 justify-center"
              >
                <Link
                  href="/library"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-huly-accent hover:bg-huly-accentHover text-white font-medium rounded-lg transition-all hover:scale-105"
                >
                  Get Started
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-huly-gray hover:border-huly-lightgray text-huly-white font-medium rounded-lg transition-colors"
                >
                  Pricing
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
