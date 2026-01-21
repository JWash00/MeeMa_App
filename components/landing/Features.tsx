'use client'

import { motion } from 'framer-motion'
import { Save, Shuffle, Zap } from 'lucide-react'
import Card from '../ui/Card'
import { fadeSlideUp, staggerContainer } from '@/lib/landing/animations'

export default function Features() {
  const features = [
    {
      icon: Save,
      title: 'Save what works',
      description:
        'Build your library of prompts that deliver results. No more starting from scratch.',
    },
    {
      icon: Shuffle,
      title: 'Remix instantly',
      description:
        'Tweak and customize any prompt to match your style and needs in seconds.',
    },
    {
      icon: Zap,
      title: 'Create faster',
      description:
        'Stop wasting time on prompts. Get back to making content your audience loves.',
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
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
          Everything you need
        </motion.h2>
        <motion.p
          className="text-lg text-center text-meema-slate-600 dark:text-meema-slate-300 mb-12 max-w-2xl mx-auto"
          variants={fadeSlideUp}
        >
          Creator-first tools that make prompting simple and fun
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div key={index} variants={fadeSlideUp}>
                <Card hoverable={false} className="p-8 h-full">
                  <div className="bg-meema-indigo-500/10 dark:bg-meema-indigo-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Icon
                      size={24}
                      className="text-meema-indigo-500"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-meema-slate-900 dark:text-meema-slate-50 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-meema-slate-600 dark:text-meema-slate-300">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
