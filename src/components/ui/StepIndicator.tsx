import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const dotRefs = useRef<(HTMLDivElement | null)[]>([])
  const prevStepRef = useRef<number>(currentStep)
  
  useEffect(() => {
    // Animate step change
    if (prevStepRef.current !== currentStep) {
      const prevIndex = prevStepRef.current - 1
      const currentIndex = currentStep - 1
      
      // Animate previous step dot
      if (dotRefs.current[prevIndex]) {
        gsap.to(dotRefs.current[prevIndex], {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
      
      // Animate current step dot
      if (dotRefs.current[currentIndex]) {
        gsap.fromTo(dotRefs.current[currentIndex], 
          { scale: 0.8 },
          { 
            scale: 1.2, 
            duration: 0.4, 
            ease: 'back.out(1.7)',
            yoyo: true,
            repeat: 1,
          }
        )
      }
      
      prevStepRef.current = currentStep
    }
  }, [currentStep])
  
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i + 1}
          ref={el => { dotRefs.current[i] = el }}
          className={`step-dot ${
            i + 1 < currentStep
              ? 'completed'
              : i + 1 === currentStep
              ? 'active'
              : ''
          }`}
        />
      ))}
    </div>
  )
}
