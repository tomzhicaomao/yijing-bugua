import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'gold' | 'ghost'
  className?: string
}

export default function Button({ children, variant = 'gold', className = '', ...props }: ButtonProps) {
  const baseClass = variant === 'gold' ? 'btn-gold' : 'btn-ghost'
  return (
    <button className={`${baseClass} px-6 py-3 rounded-lg font-medium tracking-widest ${className}`} {...props}>
      {children}
    </button>
  )
}
