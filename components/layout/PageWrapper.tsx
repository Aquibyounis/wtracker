import React from 'react'
import { cn } from '@/lib/utils'

interface PageWrapperProps {
  className?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const maxWidthClasses = {
  sm: 'max-w-[640px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1400px]',
  full: 'max-w-full',
}

export function PageWrapper({ className, children, maxWidth = 'xl' }: PageWrapperProps) {
  return (
    <div className={cn('mx-auto px-6 lg:px-8 py-8', maxWidthClasses[maxWidth], className)}>
      {children}
    </div>
  )
}
