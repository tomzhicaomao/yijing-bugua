import type { ReactNode } from 'react'

interface TagProps {
  children: ReactNode
  active?: boolean
  className?: string
  onClick?: () => void
}

export default function Tag({ children, active = false, className = '', onClick }: TagProps) {
  return (
    <button
      className={`tag-luxury ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
