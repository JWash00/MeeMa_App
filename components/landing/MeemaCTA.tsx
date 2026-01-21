'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Button from '../ui/Button'
import { fadeSlideUp } from '@/lib/landing/animations'

export default function MeemaCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-meema-indigo-500 to-meema-rose-500 opacity-10 dark:opacity-5" />

      <motion.div
        className="max-w-4xl mx-auto text-center relative z-10"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeSlideUp}
      >
        <h2 className="text-4xl sm:text-5xl font-bold text-meema-slate-900 dark:text-meema-slate-50 mb-6">
          Ready to create faster?
        </h2>
        <p className="text-xl text-meema-slate-600 dark:text-meema-slate-300 mb-10">
          Join creators who save hours every week with Meema.
        </p>
        <Link href="/library">
          <Button variant="primary" className="text-lg px-8 py-4">
            Get started now
          </Button>
        </Link>
      </motion.div>
    </section>
  )
}
