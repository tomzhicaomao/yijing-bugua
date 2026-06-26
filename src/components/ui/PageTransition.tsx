import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface PageTransitionProps {
  children: React.ReactNode
  isVisible: boolean
  direction?: 'left' | 'right' | 'up' | 'down'
  duration?: number
  onEnter?: () => void
  onExit?: () => void
}

export default function PageTransition({
  children,
  isVisible,
  direction = 'right',
  duration = 0.5,
  onEnter,
  onExit,
}: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Kill any existing animation
    timelineRef.current?.kill()

    if (isVisible) {
      // Show element before entrance animation
      containerRef.current.style.display = 'block'

      // Entrance animation
      const tl = gsap.timeline({
        onComplete: onEnter,
      })

      const fromVars: gsap.TweenVars = {
        opacity: 0,
        duration: 0,
      }

      switch (direction) {
        case 'left':
          fromVars.x = -50
          break
        case 'right':
          fromVars.x = 50
          break
        case 'up':
          fromVars.y = -50
          break
        case 'down':
          fromVars.y = 50
          break
      }

      tl.from(containerRef.current, fromVars)
      tl.to(containerRef.current, {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        ease: 'power2.out',
      })

      timelineRef.current = tl
    } else {
      // Exit animation, then hide
      const tl = gsap.timeline({
        onComplete: () => {
          if (containerRef.current) containerRef.current.style.display = 'none'
          onExit?.()
        },
      })

      const toVars: gsap.TweenVars = {
        opacity: 0,
        duration: duration * 0.7,
        ease: 'power2.in',
      }

      switch (direction) {
        case 'left':
          toVars.x = -50
          break
        case 'right':
          toVars.x = 50
          break
        case 'up':
          toVars.y = -50
          break
        case 'down':
          toVars.y = 50
          break
      }

      tl.to(containerRef.current, toVars)

      timelineRef.current = tl
    }

    return () => {
      timelineRef.current?.kill()
    }
  }, [isVisible, direction, duration, onEnter, onExit])

  return (
    <div
      ref={containerRef}
      style={{ display: 'none' }}
    >
      {children}
    </div>
  )
}
