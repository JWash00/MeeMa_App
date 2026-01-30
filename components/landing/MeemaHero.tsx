'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeSlideUp, staggerContainer } from '@/lib/landing/animations'
import DashboardMockup from './DashboardMockup'
import { AuroraBackground } from '../ui/aurora-background'
import { AvatarCircles } from '../ui/avatar-circles'

const avatarUrls = [
  "https://avatars.githubusercontent.com/u/16860528",
  "https://avatars.githubusercontent.com/u/20110627",
  "https://avatars.githubusercontent.com/u/106103625",
  "https://avatars.githubusercontent.com/u/59228569",
  "https://avatars.githubusercontent.com/u/89768406",
]

function ShimmerText({ children, colors }: { children: React.ReactNode; colors: string }) {
  return (
    <span
      className="inline-block bg-clip-text text-transparent animate-shimmer"
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors})`,
        backgroundSize: '200% 100%',
      }}
    >
      {children}
    </span>
  )
}

export default function MeemaHero() {
  return (
    <AuroraBackground className="min-h-[85vh] px-4 sm:px-6 lg:px-8">
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Text Content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div
              className="font-jakarta font-bold leading-tight mb-6"
              style={{ color: 'rgb(26, 32, 44)' }}
              variants={fadeSlideUp}
            >
              <h1 className="text-[70px]">
                Prompt <ShimmerText colors="#60a5fa, #3b82f6, #2563eb, #3b82f6, #60a5fa">Faster</ShimmerText>.
              </h1>
              <h1 className="text-[60px]">
                Think <ShimmerText colors="#a78bfa, #8b5cf6, #7c3aed, #8b5cf6, #a78bfa">Less</ShimmerText>.
              </h1>
            </motion.div>

            <motion.p
              className="font-inter font-normal text-[19px] mb-10 max-w-xl mx-auto lg:mx-0"
              style={{ color: 'rgb(100, 100, 100)' }}
              variants={fadeSlideUp}
            >
              <span className="font-semibold" style={{ color: 'rgb(26, 32, 44)' }}>
                MeeMa turns AI chaos into production-grade output.
              </span>{' '}
              Battle-tested prompts that deliver, EVERY. SINGLE. TIME.
            </motion.p>

            <motion.div
              className="flex flex-row items-center justify-center lg:justify-start gap-5"
              variants={fadeSlideUp}
            >
              <Link href="/signup">
                <div className="group relative p-[2px] rounded-xl bg-transparent hover:bg-gradient-to-r hover:from-pink-500 hover:via-purple-500 hover:to-cyan-500 transition-all">
                  <button
                    className="relative font-inter font-semibold text-[18px] text-white px-8 py-4 rounded-[10px] transition-all"
                    style={{ backgroundColor: 'rgb(26, 32, 44)' }}
                  >
                    Get Started. It&apos;s FREE!
                  </button>
                </div>
              </Link>
              <div className="font-inter text-[14px] text-gray-500">
                <p>Free forever.</p>
                <p>No credit card.</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Dashboard Mockup */}
          <div className="flex-1 hidden lg:flex flex-col items-center gap-6">
            <DashboardMockup />
            <div className="flex flex-col items-center gap-1">
              <p className="font-inter font-normal text-gray-600">
                <span className="text-[17px]">Rated </span><span className="text-[18px] font-medium">4.8</span><span className="text-[17px]">⭐ by creators</span>
              </p>
              <AvatarCircles avatarUrls={avatarUrls} numPeople={99} />
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  )
}
