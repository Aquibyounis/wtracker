import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-black uppercase tracking-widest text-[var(--muted)] mb-2">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-all duration-150',
            'placeholder:text-[var(--muted-foreground)] focus:border-[var(--border-strong)] focus:outline-none focus:bg-[var(--surface)]',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
        {helpText && !error && <p className="mt-1.5 text-xs text-[var(--muted)]">{helpText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
