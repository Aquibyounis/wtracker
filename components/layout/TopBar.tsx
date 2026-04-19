'use client'

import React from 'react'
import { Menu, Search, Bell } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { ThemeToggle } from './ThemeToggle'

export function TopBar() {
  const { toggleSidebar } = useUIStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-[var(--background)]/80 backdrop-blur-md px-4 lg:px-8 border-b border-[var(--border)]">
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-hover)] transition-colors"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)]">
          WORKSPACE
        </h2>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2.5 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-all">
          <Search size={18} />
        </button>
        <button className="p-2.5 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[var(--foreground)] rounded-full border-2 border-[var(--background)]" />
        </button>
        <div className="w-px h-4 bg-[var(--border)] mx-2" />
        <ThemeToggle />
      </div>
    </header>
  )
}
