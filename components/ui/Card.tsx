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
        'bg-white border border-border rounded-lg p-6',
        onClick && 'cursor-pointer hover:bg-surface transition-colors duration-150',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
