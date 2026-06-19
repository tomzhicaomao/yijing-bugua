import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
}

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'btn-nothing'
  const colors: Record<string, string> = {
    primary: 'btn-nothing-primary',
    secondary: 'btn-nothing-secondary',
    ghost: 'btn-nothing-ghost',
  }
  return (
    <button className={`${base} ${colors[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
