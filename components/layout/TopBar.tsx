'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'
import { Menu, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/days': 'Days',
  '/points': 'Points',
  '/analysis': 'Analysis',
  '/rooms': 'Rooms',
  '/calendar': 'Calendar',
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
    'Wtracker'

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-md text-muted hover:text-black hover:bg-surface transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <Button
        size="sm"
        onClick={() => setPointDrawerOpen(true)}
        className="rounded-full"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">Point</span>
      </Button>
    </header>
  )
}
