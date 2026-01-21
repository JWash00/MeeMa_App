'use client'

import { useRef, useEffect } from 'react'

interface MagneticEffectOptions {
  maxDistance?: number // Max pixels the element can move (default: 5px for subtle effect)
  strength?: number // Attraction strength (default: 0.3)
}

export function useMagneticEffect(options: MagneticEffectOptions = {}) {
  const { maxDistance = 5, strength = 0.3 } = options
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Calculate distance from mouse to element center
      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Only apply effect if mouse is within reasonable distance
      if (distance < 200) {
        // Calculate movement (clamped to maxDistance)
        const moveX = Math.max(-maxDistance, Math.min(maxDistance, deltaX * strength))
        const moveY = Math.max(-maxDistance, Math.min(maxDistance, deltaY * strength))

        // Smoothly animate using transform
        animationFrameId = requestAnimationFrame(() => {
          element.style.transform = `translate(${moveX}px, ${moveY}px)`
        })
      }
    }

    const handleMouseLeave = () => {
      // Reset position smoothly
      animationFrameId = requestAnimationFrame(() => {
        element.style.transform = 'translate(0px, 0px)'
      })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [maxDistance, strength])

  return elementRef
}
