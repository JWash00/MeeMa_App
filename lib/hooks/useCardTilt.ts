'use client'

import { useRef, useEffect } from 'react'

interface CardTiltOptions {
  maxTilt?: number // Maximum tilt angle in degrees (default: 8)
  perspective?: number // CSS perspective value (default: 1000)
  scale?: number // Scale on hover (default: 1.02)
}

export function useCardTilt(options: CardTiltOptions = {}) {
  const { maxTilt = 8, perspective = 1000, scale = 1.02 } = options
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let animationFrameId: number

    // Set initial styles
    element.style.transformStyle = 'preserve-3d'
    element.style.transition = 'transform 0.1s ease-out'

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()

      // Calculate mouse position relative to element (0 to 1)
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      // Calculate tilt angles
      // Center is 0 tilt, edges are maxTilt
      const tiltX = (y - 0.5) * maxTilt * -2 // Inverted for natural feel
      const tiltY = (x - 0.5) * maxTilt * 2

      animationFrameId = requestAnimationFrame(() => {
        element.style.transform = `
          perspective(${perspective}px)
          rotateX(${tiltX}deg)
          rotateY(${tiltY}deg)
          scale(${scale})
        `
      })
    }

    const handleMouseEnter = () => {
      element.style.transition = 'transform 0.1s ease-out'
    }

    const handleMouseLeave = () => {
      element.style.transition = 'transform 0.3s ease-out'
      animationFrameId = requestAnimationFrame(() => {
        element.style.transform = `
          perspective(${perspective}px)
          rotateX(0deg)
          rotateY(0deg)
          scale(1)
        `
      })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [maxTilt, perspective, scale])

  return elementRef
}
