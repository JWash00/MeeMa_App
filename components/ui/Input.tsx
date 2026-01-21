'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    const baseStyles =
      'w-full px-4 py-3 rounded-lg border border-border bg-surface text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent/50 transition-all duration-200'

    return <input ref={ref} className={`${baseStyles} ${className}`} {...props} />
  }
)

Input.displayName = 'Input'

export default Input
