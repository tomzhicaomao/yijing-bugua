interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i + 1}
          className={`step-indicator ${
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
