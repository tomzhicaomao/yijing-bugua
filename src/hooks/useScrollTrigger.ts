import { useRef, useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface UseScrollTriggerOptions {
  trigger?: string | Element
  start?: string
  end?: string
  scrub?: boolean | number
  pin?: boolean
  onEnter?: () => void
  onLeave?: () => void
  onEnterBack?: () => void
  onLeaveBack?: () => void
}

/**
 * Hook for GSAP ScrollTrigger with automatic cleanup
 */
export function useScrollTrigger(
  callback: (trigger: ScrollTrigger) => void,
  options: UseScrollTriggerOptions = {},
  deps: React.DependencyList = []
) {
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const elementRef = useRef<Element | null>(null)

  useEffect(() => {
    // Create ScrollTrigger
    triggerRef.current = ScrollTrigger.create({
      trigger: options.trigger || elementRef.current,
      start: options.start || 'top 80%',
      end: options.end || 'bottom 20%',
      scrub: options.scrub || false,
      pin: options.pin || false,
      onEnter: options.onEnter,
      onLeave: options.onLeave,
      onEnterBack: options.onEnterBack,
      onLeaveBack: options.onLeaveBack,
    })

    // Execute callback with trigger
    if (callback) {
      callback(triggerRef.current)
    }

    // Cleanup
    return () => {
      triggerRef.current?.kill()
      triggerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { triggerRef, elementRef }
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation(
  animationCallback: (element: Element) => gsap.core.Timeline | gsap.core.Tween,
  options: UseScrollTriggerOptions = {},
  deps: React.DependencyList = []
) {
  const elementRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const animation = animationCallback(elementRef.current)
    
    const trigger = ScrollTrigger.create({
      trigger: elementRef.current,
      start: options.start || 'top 80%',
      end: options.end || 'bottom 20%',
      scrub: options.scrub || false,
      pin: options.pin || false,
      animation,
      onEnter: options.onEnter,
      onLeave: options.onLeave,
      onEnterBack: options.onEnterBack,
      onLeaveBack: options.onLeaveBack,
    })

    return () => {
      trigger.kill()
      animation.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return elementRef
}
