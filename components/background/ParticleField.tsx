'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  depth: number
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()

    // Initialize particles (10-20 for subtle effect)
    const initParticles = () => {
      const particleCount = 15
      particlesRef.current = []

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.3 + 0.1, // Faint opacity
          depth: Math.random() * 0.5 + 0.5, // Parallax depth
        })
      }
    }
    initParticles()

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Calculate distance to mouse
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Subtle attraction to mouse (max 200px influence)
        if (distance < 200) {
          const force = (200 - distance) / 200
          particle.vx += (dx / distance) * force * 0.005 * particle.depth
          particle.vy += (dy / distance) * force * 0.005 * particle.depth
        }

        // Apply velocity with damping
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vx *= 0.98
        particle.vy *= 0.98

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle with faint trail
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity * particle.depth})`
        ctx.fill()

        // Faint connecting lines between nearby particles
        particlesRef.current.forEach((otherParticle) => {
          const dx2 = particle.x - otherParticle.x
          const dy2 = particle.y - otherParticle.y
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2)

          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.05 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', setCanvasSize)
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', setCanvasSize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}
