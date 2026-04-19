import { useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'

export function usePin() {
  const { pinVerified, setPinVerified, pinAttempts, incrementAttempts, resetAttempts, pinLockUntil, setPinLockUntil } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const verifyPin = useCallback(async (pin: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (data.valid) {
        setPinVerified(true)
        resetAttempts()
        return true
      }
      incrementAttempts()
      return false
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }, [setPinVerified, resetAttempts, incrementAttempts])

  const setPin = useCallback(async (pin: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (res.ok) {
        setPinVerified(true)
        return true
      }
      return false
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }, [setPinVerified])

  return { pinVerified, loading, verifyPin, setPin, pinAttempts, pinLockUntil }
}
