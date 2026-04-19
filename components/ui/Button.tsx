import React from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'destructive' | 'default'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  const variants = {
    primary:     'bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90',
    default:     'bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90',
    secondary:   'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-hover)]',
    outline:     'bg-transparent text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-hover)]',
    ghost:       'bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-hover)]',
    danger:      'bg-red-500 text-white hover:bg-red-600',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2',
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
