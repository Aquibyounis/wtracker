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
          <label htmlFor={inputId} className="block text-sm font-medium mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full border border-border rounded-md px-3.5 py-2.5 text-sm transition-colors duration-150',
            'placeholder:text-muted focus:border-black focus:outline-none',
            error && 'border-black',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-muted">{error}</p>}
        {helpText && !error && <p className="mt-1 text-xs text-muted">{helpText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
