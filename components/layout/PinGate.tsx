'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui/Spinner'
import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PinGateProps {
  children: React.ReactNode
}

export function PinGate({ children }: PinGateProps) {
  const { data: session, status } = useSession()
  const { 
    pinVerified, 
    setPinVerified, 
    pinVerifiedAt,
    pinLockUntil, 
    setPinLockUntil, 
    pinAttempts, 
    incrementAttempts, 
    resetAttempts 
  } = useAuthStore()

  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lockCountdown, setLockCountdown] = useState(0)
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null)
  const [setupStep, setSetupStep] = useState<'enter' | 'confirm'>('enter')
  const [setupPin, setSetupPin] = useState('')
  const [checkingPin, setCheckingPin] = useState(true)

  const maxAttempts = 5
  const lockDuration = 30000 // 30 seconds

  // Check if user needs PIN setup
  useEffect(() => {
    if (status !== 'authenticated') return
    const checkPinStatus = async () => {
      try {
        const res = await fetch('/api/auth/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: '0000', check: true }),
        })
        const data = await res.json()
        if (data.noPinSet) {
          setNeedsSetup(true)
        } else {
          setNeedsSetup(false)
        }
      } catch {
        setNeedsSetup(false)
      } finally {
        setCheckingPin(false)
      }
    }
    checkPinStatus()
  }, [status])

  // Lockout countdown
  useEffect(() => {
    if (!pinLockUntil) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((pinLockUntil - Date.now()) / 1000))
      setLockCountdown(remaining)
      if (remaining <= 0) {
        setPinLockUntil(null)
        resetAttempts()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [pinLockUntil, setPinLockUntil, resetAttempts])

  // Session auto-lock check (5 mins)
  useEffect(() => {
    if (!pinVerified || !pinVerifiedAt) return
    
    const checkSession = () => {
      const PIN_SESSION_DURATION = 5 * 60 * 1000
      if (Date.now() - pinVerifiedAt >= PIN_SESSION_DURATION) {
        setPinVerified(false)
      }
    }

    const interval = setInterval(checkSession, 10000) // Check every 10s
    return () => clearInterval(interval)
  }, [pinVerified, pinVerifiedAt, setPinVerified])

  const triggerShake = useCallback(() => {
    setShaking(true)
    setTimeout(() => setShaking(false), 400)
  }, [])

  const handleDigit = useCallback(
    (digit: string) => {
      if (pinLockUntil && Date.now() < pinLockUntil) return

      if (needsSetup) {
        if (setupStep === 'enter') {
          const newPin = setupPin + digit
          setSetupPin(newPin)
          if (newPin.length === 4) {
            setSetupStep('confirm')
            setPin('')
          }
        } else {
          const newPin = pin + digit
          setPin(newPin)
          if (newPin.length === 4) {
            if (newPin === setupPin) {
              // Save PIN
              setLoading(true)
              fetch('/api/auth/set-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: newPin }),
              })
                .then((res) => {
                  if (res.ok) {
                    setPinVerified(true)
                  } else {
                    setError('Failed to save PIN')
                    setPin('')
                  }
                })
                .catch(() => {
                  setError('Network error')
                  setPin('')
                })
                .finally(() => setLoading(false))
            } else {
              setError("PINs don't match")
              triggerShake()
              setPin('')
              setSetupPin('')
              setSetupStep('enter')
            }
          }
        }
      } else {
        const newPin = pin + digit
        setPin(newPin)
        if (newPin.length === 4) {
          setLoading(true)
          fetch('/api/auth/verify-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: newPin }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.valid) {
                setPinVerified(true)
                resetAttempts()
              } else {
                setError('Incorrect PIN')
                triggerShake()
                incrementAttempts()
                const newAttempts = pinAttempts + 1
                if (newAttempts >= maxAttempts) {
                  const lockUntil = Date.now() + lockDuration
                  setPinLockUntil(lockUntil)
                }
                setPin('')
              }
            })
            .catch(() => {
              setError('Network error')
              setPin('')
            })
            .finally(() => setLoading(false))
        }
      }
    },
    [pin, setupPin, setupStep, needsSetup, pinAttempts, pinLockUntil, setPinVerified, setPinLockUntil, incrementAttempts, resetAttempts, triggerShake]
  )

  const handleBackspace = useCallback(() => {
    if (needsSetup && setupStep === 'enter') {
      setSetupPin((p) => p.slice(0, -1))
    } else {
      setPin((p) => p.slice(0, -1))
    }
    setError('')
  }, [needsSetup, setupStep])

  // Keyboard support
  useEffect(() => {
    if (pinVerified) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key)
      if (e.key === 'Backspace') handleBackspace()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pinVerified, handleDigit, handleBackspace])

  if (status === 'loading' || checkingPin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (pinVerified) return <>{children}</>

  const isLocked = pinLockUntil && Date.now() < pinLockUntil
  const currentPinDisplay = needsSetup && setupStep === 'enter' ? setupPin : pin

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4 transition-colors">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-900/[0.03] dark:bg-white/[0.03] -mr-40 -mt-40 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <img src="/logo.png" alt="DockitUp Logo" className="w-14 h-14 object-contain mb-8 dark:grayscale dark:invert opacity-80 transition-all" />
      <h1 className="text-[12px] font-black tracking-[0.4em] text-[var(--foreground)] mb-10 uppercase transition-colors">
        DOCKITUP
      </h1>

      {/* Subtitle */}
      <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.25em] mb-12 animate-pulse">
        {needsSetup
          ? setupStep === 'enter'
            ? 'INITIALIZE PASSCODE'
            : 'CONFIRM PASSCODE'
          : 'SECURITY VERIFICATION'}
      </p>

      {/* PIN dots */}
      <div className={cn('flex gap-6 mb-14', shaking && 'shake')}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'w-4 h-4 rounded-full border-2 transition-all duration-300',
              i < currentPinDisplay.length 
                ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 scale-125 shadow-xl shadow-black/10' 
                : 'bg-transparent border-[var(--border)]'
            )}
          />
        ))}
      </div>

      {/* Error */}
      <div className="h-8 mb-6">
        {error && (
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 animate-bounce">
            {error}
          </p>
        )}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            disabled={!!isLocked || loading}
            className={cn(
              'w-20 h-20 rounded-[28px] border border-[var(--border)] text-2xl font-black transition-all duration-200 outline-none',
              'bg-[var(--surface)] text-[var(--foreground)]',
              'hover:bg-[var(--surface-hover)] hover:scale-105 active:scale-95 active:bg-zinc-900 active:text-white dark:active:bg-white dark:active:text-zinc-900',
              'disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-black/[0.02]'
            )}
          >
            {digit}
          </button>
        ))}
        <div /> {/* empty cell */}
        <button
          onClick={() => handleDigit('0')}
          disabled={!!isLocked || loading}
          className={cn(
            'w-20 h-20 rounded-[28px] border border-[var(--border)] text-2xl font-black transition-all duration-200 outline-none',
            'bg-[var(--surface)] text-[var(--foreground)]',
            'hover:bg-[var(--surface-hover)] hover:scale-105 active:scale-95 active:bg-zinc-900 active:text-white dark:active:bg-white dark:active:text-zinc-900',
            'disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-black/[0.02]'
          )}
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          disabled={!!isLocked || loading}
          className={cn(
            'w-20 h-20 rounded-[28px] border border-transparent flex items-center justify-center transition-all duration-200 outline-none',
            'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]',
            'disabled:opacity-20 disabled:cursor-not-allowed'
          )}
        >
          <Delete size={24} />
        </button>
      </div>

      {/* Attempt counter / lock timer */}
      <div className="h-6">
        {isLocked ? (
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
            LOCKOUT ACTIVE: {lockCountdown}S
          </p>
        ) : pinAttempts > 0 && !needsSetup ? (
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
            {maxAttempts - pinAttempts} ATTEMPTS REMAINING
          </p>
        ) : null}
      </div>

      {loading && (
        <div className="mt-8 transition-opacity duration-300">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  )
}
