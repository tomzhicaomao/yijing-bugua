import { useState, useEffect } from 'react'

/**
 * Hook to detect user's reduced motion preference
 * @returns boolean indicating if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

/**
 * Hook to get animation duration based on reduced motion preference
 * @param normalDuration - Duration in seconds for normal motion
 * @param reducedDuration - Duration in seconds for reduced motion (default: 0)
 * @returns appropriate duration based on user preference
 */
export function useAnimationDuration(
  normalDuration: number,
  reducedDuration: number = 0
): number {
  const prefersReducedMotion = useReducedMotion()
  return prefersReducedMotion ? reducedDuration : normalDuration
}

/**
 * Hook to conditionally apply animation based on reduced motion preference
 * @param animationFn - Function that returns GSAP animation
 * @param fallbackFn - Optional function for reduced motion fallback
 * @returns animation function that respects user preference
 */
export function useAccessibleAnimation<T extends (...args: unknown[]) => unknown>(
  animationFn: T,
  fallbackFn?: () => void
): T {
  const prefersReducedMotion = useReducedMotion()
  
  if (prefersReducedMotion) {
    return ((..._args: unknown[]) => {
      if (fallbackFn) {
        fallbackFn()
      }
      // Return a dummy tween that does nothing
      return gsap.to({}, { duration: 0 })
    }) as T
  }
  
  return animationFn
}

// Need to import gsap for the dummy tween
import gsap from 'gsap'
