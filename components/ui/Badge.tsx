import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'active' | 'draft' | 'completed'
  className?: string
  children: React.ReactNode
}

const variants = {
  default: 'bg-surface text-foreground',
  active: 'bg-black text-white',
  draft: 'border border-border text-muted bg-white',
  completed: 'bg-black text-white',
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-label font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
