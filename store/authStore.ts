import { create } from 'zustand'

interface AuthStore {
  pinVerified: boolean
  setPinVerified: (v: boolean) => void
  pinVerifiedAt: number | null
  pinLockUntil: number | null
  setPinLockUntil: (t: number | null) => void
  pinAttempts: number
  incrementAttempts: () => void
  resetAttempts: () => void
}

const PIN_SESSION_DURATION = 5 * 60 * 1000 // 5 minutes

export const useAuthStore = create<AuthStore>((set) => {
  const getInitialPinVerifiedAt = () => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('pinVerifiedAt')
    return stored ? JSON.parse(stored) : null
  }

  const initialPinVerifiedAt = getInitialPinVerifiedAt()
  const isPinStillValid = initialPinVerifiedAt 
    ? (Date.now() - initialPinVerifiedAt) < PIN_SESSION_DURATION 
    : false

  return {
    pinVerified: isPinStillValid,
    pinVerifiedAt: initialPinVerifiedAt,
    setPinVerified: (v) => {
      const now = v ? Date.now() : null
      if (typeof window !== 'undefined') {
        if (now) localStorage.setItem('pinVerifiedAt', JSON.stringify(now))
        else localStorage.removeItem('pinVerifiedAt')
      }
      set({ pinVerified: v, pinVerifiedAt: now })
    },
    pinLockUntil: typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('pinLockUntil') || 'null')
      : null,
    setPinLockUntil: (t) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pinLockUntil', JSON.stringify(t))
      }
      set({ pinLockUntil: t })
    },
    pinAttempts: 0,
    incrementAttempts: () => set((s) => ({ pinAttempts: s.pinAttempts + 1 })),
    resetAttempts: () => set({ pinAttempts: 0 }),
  }
})

