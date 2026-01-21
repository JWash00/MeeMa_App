/**
 * Reusable Framer Motion animation variants for landing page
 * Huly-inspired: subtle, calm, product-focused motion
 */

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const fadeSlideUp = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: 'blur(4px)'
  },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    }
  }
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.8 }
  }
}

export const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.95
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    }
  }
}
