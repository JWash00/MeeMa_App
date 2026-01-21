'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Play, Zap, Eye, Sparkles } from 'lucide-react'

const ICONS = {
  play: Play,
  run: Zap,
  preview: Eye,
  try: Sparkles,
} as const

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof ICONS
  icon?: ReactNode // Custom icon override
  children: ReactNode
  glow?: boolean // Optional subtle glow effect
}

export default function ActionButton({
  variant = 'play',
  icon,
  children,
  glow = false,
  className = '',
  ...props
}: ActionButtonProps) {
  const Icon = icon || ICONS[variant]

  return (
    <button
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg
        bg-action text-white font-medium
        hover:bg-action-hover active:bg-action-active
        transition-all duration-200
        hover:scale-[1.02] active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${glow ? 'shadow-[0_0_20px_rgba(29,185,84,0.15)]' : ''}
        ${className}
      `}
      {...props}
    >
      {typeof Icon === 'function' ? <Icon className="w-4 h-4" /> : Icon}
      {children}
    </button>
  )
}
