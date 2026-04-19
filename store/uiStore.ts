import { create } from 'zustand'
import type { Point } from '@/types'

interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (v: boolean) => void
  pointDrawerOpen: boolean
  setPointDrawerOpen: (v: boolean) => void
  activeDrawerPoint: Point | null
  setActiveDrawerPoint: (p: Point | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  pointDrawerOpen: false,
  setPointDrawerOpen: (v) => set({ pointDrawerOpen: v }),
  activeDrawerPoint: null,
  setActiveDrawerPoint: (p) => set({ activeDrawerPoint: p }),
}))
