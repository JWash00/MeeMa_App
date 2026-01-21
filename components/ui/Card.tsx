'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  hoverable?: boolean
}

export default function Card({
  children,
  onClick,
  className = '',
  hoverable = true,
}: CardProps) {
  const baseStyles =
    'rounded-2xl bg-white dark:bg-meema-slate-900 border border-meema-slate-200 dark:border-meema-slate-800 shadow-sm transition-all duration-200'

  const hoverStyles = hoverable
    ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
    : ''

  const Component = motion.div

  return (
    <Component
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${className}`}
      initial={false}
      whileHover={hoverable ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </Component>
  )
}
