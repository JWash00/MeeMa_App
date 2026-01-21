'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Button from '../ui/Button'
import { fadeSlideUp, staggerContainer } from '@/lib/landing/animations'
import { LANDING } from '@/lib/voice/voice'

export default function MeemaHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-meema-indigo-500/10 via-transparent to-meema-rose-500/10 dark:from-meema-indigo-500/5 dark:to-meema-rose-500/5" />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-meema-slate-900 dark:text-meema-slate-50 mb-6"
          variants={fadeSlideUp}
        >
          {LANDING.hero.title}{' '}
          <span className="text-meema-indigo-500">{LANDING.hero.titleAccent}</span>
        </motion.h1>

        <motion.p
          className="text-xl sm:text-2xl text-meema-slate-600 dark:text-meema-slate-300 mb-10 max-w-2xl mx-auto"
          variants={fadeSlideUp}
        >
          {LANDING.hero.subtitle}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          variants={fadeSlideUp}
        >
          <Link href="/library">
            <Button variant="primary" className="text-lg px-8 py-4">
              {LANDING.hero.ctaPrimary}
            </Button>
          </Link>
          <Button variant="secondary" className="text-lg px-8 py-4">
            {LANDING.hero.ctaSecondary}
          </Button>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-meema-indigo-500/20 to-transparent" />
    </section>
  )
}
