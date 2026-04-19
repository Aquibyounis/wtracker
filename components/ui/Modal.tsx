import React, { useEffect, useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const sizeClasses = {
  sm: 'max-w-[400px]',
  md: 'max-w-[520px]',
  lg: 'max-w-[720px]',
}

export function Modal({ open, onClose, title, size = 'md', children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open || !mounted) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 sm:p-6 lg:p-12 overflow-y-auto"
      style={{ isolation: 'isolate' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        className={cn(
          'bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-8 w-full mx-auto fade-in relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.35)]',
          sizeClasses[size]
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all active:scale-95"
        >
          <X size={20} />
        </button>
        {title && (
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[var(--muted)] mb-8 border-b border-[var(--border)] pb-6">
            {title}
          </h2>
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
