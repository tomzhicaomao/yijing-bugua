import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <div
      className={`card-nothing ${onClick ? 'cursor-pointer hover:bg-nothing-raised' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
