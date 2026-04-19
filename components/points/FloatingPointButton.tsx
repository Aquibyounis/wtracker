'use client'

import React from 'react'
import { useUIStore } from '@/store/uiStore'
import { Plus } from 'lucide-react'

export function FloatingPointButton() {
  const { setPointDrawerOpen } = useUIStore()

  return (
    <button
      onClick={() => setPointDrawerOpen(true)}
      className="fixed bottom-8 right-8 z-40 w-[52px] h-[52px] bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-150 shadow-none"
      title="Quick add point"
    >
      <Plus size={22} />
    </button>
  )
}
