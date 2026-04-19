import { create } from 'zustand'
import type { Day, WorkBlock } from '@/types'

interface DayStore {
  currentDay: Day | null
  setCurrentDay: (d: Day | null) => void
  blocks: WorkBlock[]
  setBlocks: (b: WorkBlock[]) => void
  updateBlock: (id: string, data: Partial<WorkBlock>) => void
  addBlock: (b: WorkBlock) => void
  removeBlock: (id: string) => void
  reorderBlocks: (startIndex: number, endIndex: number) => void
}

export const useDayStore = create<DayStore>((set) => ({
  currentDay: null,
  setCurrentDay: (d) => set({ currentDay: d }),
  blocks: [],
  setBlocks: (b) => set({ blocks: b }),
  updateBlock: (id, data) =>
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...data } : b)),
    })),
  addBlock: (b) => set((s) => ({ blocks: [...s.blocks, b] })),
  removeBlock: (id) => set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id) })),
  reorderBlocks: (startIndex, endIndex) =>
    set((s) => {
      const result = Array.from(s.blocks)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return { blocks: result.map((b, i) => ({ ...b, order: i })) }
    }),
}))
