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
  const { pinVerified, setPinVerified, pinLockUntil, setPinLockUntil, pinAttempts, incrementAttempts, resetAttempts } = useAuthStore()

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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <img src="/logo.png" alt="Wtracker Logo" className="w-10 h-10 object-contain mb-4" />
      <h1 className="text-[13px] font-bold tracking-[0.15em] text-black mb-8">
        WTRACKER
      </h1>

      {/* Subtitle */}
      <p className="text-sm text-muted mb-8">
        {needsSetup
          ? setupStep === 'enter'
            ? 'Set up your PIN'
            : 'Confirm your PIN'
          : 'Enter your PIN to continue'}
      </p>

      {/* PIN dots */}
      <div className={cn('flex gap-4 mb-10', shaking && 'shake')}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'w-5 h-5 rounded-full border-2 border-black transition-all duration-150',
              i < currentPinDisplay.length ? 'bg-black' : 'bg-white'
            )}
          />
        ))}
      </div>

      {/* Error */}
      {error && <p className="text-xs text-muted mb-4">{error}</p>}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            disabled={!!isLocked || loading}
            className={cn(
              'w-16 h-16 rounded-lg border border-border text-xl font-medium transition-all duration-150',
              'hover:bg-surface active:bg-black active:text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed'
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
            'w-16 h-16 rounded-lg border border-border text-xl font-medium transition-all duration-150',
            'hover:bg-surface active:bg-black active:text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          disabled={!!isLocked || loading}
          className={cn(
            'w-16 h-16 rounded-lg border border-border flex items-center justify-center transition-all duration-150',
            'hover:bg-surface text-muted hover:text-black',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Delete size={20} />
        </button>
      </div>

      {/* Attempt counter / lock timer */}
      {isLocked ? (
        <p className="text-xs text-muted">
          Try again in {lockCountdown}s
        </p>
      ) : pinAttempts > 0 && !needsSetup ? (
        <p className="text-xs text-muted">
          {maxAttempts - pinAttempts} attempt{maxAttempts - pinAttempts !== 1 ? 's' : ''} remaining
        </p>
      ) : null}

      {loading && (
        <div className="mt-4">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  )
}
