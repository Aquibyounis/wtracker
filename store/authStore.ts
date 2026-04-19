import { create } from 'zustand'

interface AuthStore {
  pinVerified: boolean
  setPinVerified: (v: boolean) => void
  pinLockUntil: number | null
  setPinLockUntil: (t: number | null) => void
  pinAttempts: number
  incrementAttempts: () => void
  resetAttempts: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  pinVerified: false,
  setPinVerified: (v) => set({ pinVerified: v }),
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
}))
