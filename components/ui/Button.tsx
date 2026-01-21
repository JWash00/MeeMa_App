'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'action'
  size?: 'sm' | 'md'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  ariaLabel,
}: ButtonProps) {
  const baseStyles =
    'rounded-lg font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed'

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
  }

  const variantStyles = {
    primary:
      'bg-brand hover:bg-brand-hover active:bg-brand-active text-white shadow-[0_2px_8px_rgba(255,107,107,0.2)] hover:shadow-[0_4px_12px_rgba(255,107,107,0.25)] active:shadow-[0_1px_4px_rgba(255,107,107,0.15)] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none',
    secondary:
      'bg-surface border border-border text-text hover:bg-surface-2 shadow-sm',
    ghost:
      'bg-transparent text-text hover:bg-surface/50',
    outline:
      'border-2 border-brand text-brand hover:bg-brand/10',
    action:
      'bg-action hover:bg-action-hover active:bg-action-active text-white font-medium shadow-[0_2px_8px_rgba(29,185,84,0.2)] hover:shadow-[0_4px_12px_rgba(29,185,84,0.25)] active:shadow-[0_1px_4px_rgba(29,185,84,0.15)]',
  }

  const hoverTransform = variant === 'primary' ? { y: -1, scale: disabled ? 1 : 1.01 } : { scale: disabled ? 1 : 1.02 }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      whileHover={hoverTransform}
      whileTap={{ scale: disabled ? 1 : 0.98, y: 0 }}
    >
      {children}
    </motion.button>
  )
}
