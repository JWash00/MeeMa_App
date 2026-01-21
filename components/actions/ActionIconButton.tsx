'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Play } from 'lucide-react'

interface ActionIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  'aria-label': string // Required for accessibility
}

export default function ActionIconButton({
  icon = <Play className="w-4 h-4" />,
  className = '',
  ...props
}: ActionIconButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center p-2 rounded-lg
        bg-action text-white
        hover:bg-action-hover active:bg-action-active
        transition-all duration-200
        hover:scale-105 active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  )
}
