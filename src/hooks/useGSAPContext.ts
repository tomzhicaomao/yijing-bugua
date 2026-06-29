import { useRef, useEffect } from 'react'
import gsap from 'gsap'

/**
 * Hook for managing GSAP context with automatic cleanup
 * @param callback - Function that receives the GSAP context
 * @param deps - Dependency array for when to recreate context
 */
export function useGSAPContext(
  callback: (ctx: gsap.Context) => void,
  deps: React.DependencyList = []
) {
  const ctxRef = useRef<gsap.Context | null>(null)

  useEffect(() => {
    // Create new context
    ctxRef.current = gsap.context(callback)
    
    // Cleanup on unmount or deps change
    return () => {
      ctxRef.current?.revert()
      ctxRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ctxRef
}

/**
 * Hook for GSAP animation with automatic cleanup
 * @param callback - Function that creates GSAP animations
 * @param deps - Dependency array
 */
export function useGSAPAnimation(
  callback: (ctx: gsap.Context) => void,
  deps: React.DependencyList = []
) {
  return useGSAPContext(callback, deps)
}
