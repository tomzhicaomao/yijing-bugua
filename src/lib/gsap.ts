import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Default GSAP configuration
gsap.defaults({
  duration: 0.6,
  ease: 'power2.out',
})

// Create global matchMedia instance for responsive animations
export const mm = gsap.matchMedia()

// Set up reduced motion preference
mm.add('(prefers-reduced-motion: reduce)', () => {
  // When user prefers reduced motion, disable all animations
  gsap.globalTimeline.clear()
  gsap.globalTimeline.pause()
  
  // Set duration to 0 for instant transitions
  gsap.defaults({ duration: 0 })
})

// Set up responsive breakpoints
mm.add('(min-width: 768px)', () => {
  // Desktop animations
  gsap.defaults({ duration: 0.6 })
})

mm.add('(max-width: 767px)', () => {
  // Mobile animations - slightly faster
  gsap.defaults({ duration: 0.4 })
})

// Export configured gsap instance
export { gsap, ScrollTrigger, useGSAP }

/**
 * Create a GSAP timeline with default settings
 */
export function createTimeline(vars?: gsap.TimelineVars) {
  return gsap.timeline({
    defaults: {
      duration: 0.5,
      ease: 'power2.out',
    },
    ...vars,
  })
}

/**
 * Animate element entrance with fade and slide
 */
export function animateEntrance(
  element: string | Element,
  vars?: gsap.TweenVars
) {
  return gsap.from(element, {
    opacity: 0,
    y: 20,
    duration: 0.5,
    ease: 'power2.out',
    ...vars,
  })
}

/**
 * Animate element exit with fade and slide
 */
export function animateExit(
  element: string | Element,
  vars?: gsap.TweenVars
) {
  return gsap.to(element, {
    opacity: 0,
    y: -20,
    duration: 0.3,
    ease: 'power2.in',
    ...vars,
  })
}

/**
 * Create a stagger animation for multiple elements
 */
export function animateStagger(
  elements: string | Element[],
  vars?: gsap.TweenVars,
  stagger?: number | gsap.StaggerVars
) {
  return gsap.from(elements, {
    opacity: 0,
    y: 20,
    duration: 0.5,
    ease: 'power2.out',
    stagger: stagger || 0.1,
    ...vars,
  })
}
