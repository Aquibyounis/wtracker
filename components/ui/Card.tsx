import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 transition-all duration-200',
        onClick && 'cursor-pointer hover:bg-[var(--surface-hover)]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
