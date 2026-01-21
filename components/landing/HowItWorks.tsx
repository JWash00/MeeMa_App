'use client'

import { motion } from 'framer-motion'
import { Search, Shuffle, Save } from 'lucide-react'
import { fadeSlideUp, staggerContainer } from '@/lib/landing/animations'

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Search,
      title: 'Pick',
      description: 'Browse prompts for any content type',
    },
    {
      number: 2,
      icon: Shuffle,
      title: 'Remix',
      description: 'Customize to match your style',
    },
    {
      number: 3,
      icon: Save,
      title: 'Save',
      description: 'Build your library of winners',
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-meema-slate-50 dark:bg-meema-slate-900/50">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-center text-meema-slate-900 dark:text-meema-slate-50 mb-4"
          variants={fadeSlideUp}
        >
          How it works
        </motion.h2>
        <motion.p
          className="text-lg text-center text-meema-slate-600 dark:text-meema-slate-300 mb-16 max-w-2xl mx-auto"
          variants={fadeSlideUp}
        >
          Three simple steps to better content
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connection Lines (desktop only) */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-meema-indigo-500/0 via-meema-indigo-500/30 to-meema-indigo-500/0" />

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                className="text-center relative"
                variants={fadeSlideUp}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-meema-indigo-500 text-white font-bold text-xl mb-4 relative z-10">
                  {step.number}
                </div>
                <div className="bg-meema-indigo-500/10 dark:bg-meema-indigo-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Icon size={24} className="text-meema-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold text-meema-slate-900 dark:text-meema-slate-50 mb-2">
                  {step.title}
                </h3>
                <p className="text-meema-slate-600 dark:text-meema-slate-300">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
