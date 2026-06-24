import { forwardRef, type ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '', onClick }, ref) => {
    return (
      <div
        ref={ref}
        className={`card-nothing ${onClick ? 'cursor-pointer hover:bg-nothing-raised' : ''} ${className}`}
        onClick={onClick}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export default GlassCard
