'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { fadeSlideUp, staggerContainer } from '@/lib/landing/animations'

export default function SocialProof() {
  const testimonials = [
    {
      text: 'Saves me hours every week. Love it!',
      author: 'Sarah K.',
      role: 'Content Creator',
    },
    {
      text: 'Finally, prompts that actually work.',
      author: 'Mike R.',
      role: 'YouTuber',
    },
    {
      text: 'The remix feature is a game changer.',
      author: 'Alex T.',
      role: 'TikTok Creator',
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
          className="text-3xl sm:text-4xl font-bold text-center text-meema-slate-900 dark:text-meema-slate-50 mb-12"
          variants={fadeSlideUp}
        >
          Loved by creators
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-meema-slate-900 rounded-2xl p-6 border border-meema-slate-200 dark:border-meema-slate-800 shadow-sm"
              variants={fadeSlideUp}
            >
              {/* Star Rating */}
              <div className="flex space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-meema-indigo-500 text-meema-indigo-500"
                  />
                ))}
              </div>

              <p className="text-meema-slate-600 dark:text-meema-slate-300 mb-4">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              <div>
                <p className="font-semibold text-meema-slate-900 dark:text-meema-slate-50">
                  {testimonial.author}
                </p>
                <p className="text-sm text-meema-slate-600 dark:text-meema-slate-300">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
