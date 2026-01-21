'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { staggerContainer, fadeSlideUp } from '@/lib/landing/animations'
import { ArrowRight } from 'lucide-react'
import Surface from '@/components/ui/Surface'
import ParticleField from '@/components/background/ParticleField'
import { useMagneticEffect } from '@/lib/hooks/useMagneticEffect'

export default function Hero() {
  const magneticRef = useMagneticEffect({ maxDistance: 5, strength: 0.3 })
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Particle Field Background */}
      <ParticleField />

      {/* Background gradients */}
      <div className="absolute inset-0 bg-radial-dark" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-radial-accent blur-3xl opacity-30 pointer-events-none" />

      {/* Atmosphere gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 via-accent-violet/8 to-transparent pointer-events-none" />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px'
      }} />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          {/* Main Headline */}
          <motion.h1
            variants={fadeSlideUp}
            className="text-5xl sm:text-6xl md:text-7xl font-heading font-bold tracking-tight text-huly-white mb-6 leading-[1.1]"
          >
            A standard way to ship AI features.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeSlideUp}
            className="text-lg sm:text-xl font-body font-light text-huly-lightgray mb-8 leading-relaxed max-w-2xl"
          >
            Reusable patterns for AI calls. Internal SDK generation. Prompt testing.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeSlideUp}
            className="flex flex-wrap gap-4"
          >
            <Surface variant="button">
              <Link
                href="/library"
                ref={magneticRef as any}
                className="group flex items-center gap-2 text-sm sm:text-base transition-transform duration-200 ease-out"
              >
                Get started
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Surface>
            <Link
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 border border-huly-gray hover:border-huly-lightgray text-huly-white font-medium rounded-lg transition-colors text-sm sm:text-base"
            >
              Read the docs
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
