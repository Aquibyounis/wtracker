'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'
import { Menu, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from './ThemeToggle'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/days': 'Daily Logs',
  '/points': 'Points Hub',
  '/analysis': 'Analysis',
  '/projects': 'Projects',
  '/calendar': 'Schedule',
  '/profile': 'Profile',
  '/settings': 'Settings',
}

export function TopBar() {
  const pathname = usePathname()
  const { toggleSidebar, setPointDrawerOpen } = useUIStore()

  const title =
    pageTitles[pathname || ''] ||
    (pathname?.startsWith('/days/') ? 'Day Editor' : '') ||
    (pathname?.startsWith('/rooms/') ? 'Room' : '') ||
    'DockitUp'

  return (
    <header className="h-16 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/[0.03] dark:border-white/[0.05] flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button
          size="sm"
          onClick={() => setPointDrawerOpen(true)}
          className="h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-black dark:hover:bg-white transition-all shadow-lg shadow-black/5"
        >
          <Plus size={14} className="mr-2" />
          <span>New Point</span>
        </Button>
      </div>
    </header>
  )
}
