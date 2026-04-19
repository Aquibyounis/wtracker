'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn, generateInitials } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import {
  LayoutDashboard,
  CalendarDays,
  Pin,
  BarChart2,
  Building2,
  Calendar,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navSections = [
  {
    label: 'WORKSPACE',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Days', href: '/days', icon: CalendarDays },
      { name: 'Points', href: '/points', icon: Pin },
      { name: 'Analysis', href: '/analysis', icon: BarChart2 },
    ],
  },
  {
    label: 'ORGANIZE',
    items: [
      { name: 'Rooms', href: '/rooms', icon: Building2 },
      { name: 'Calendar', href: '/calendar', icon: Calendar },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { name: 'Profile', href: '/profile', icon: User },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 bg-white border-r border-border flex flex-col transition-all duration-200',
          'lg:translate-x-0 lg:w-[240px]',
          sidebarOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="DockitUp Logo" className="w-5 h-5 object-contain" />
              <h1 className="text-[13px] font-bold tracking-[0.15em] text-black">
                DOCKITUP
              </h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1 rounded-md text-muted hover:text-black hover:bg-surface transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-6">
              <p className="px-3 mb-2 text-[10px] font-medium tracking-wider text-muted uppercase">
                {section.label}
              </p>
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-[9px] rounded-md text-sm font-[450] transition-all duration-150',
                      isActive
                        ? 'bg-black text-white'
                        : 'text-black hover:bg-surface'
                    )}
                    onClick={() => {
                      if (window.innerWidth < 1024) toggleSidebar()
                    }}
                  >
                    <Icon
                      size={18}
                      className={cn(isActive ? 'text-white' : 'text-muted')}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User section */}
        {session?.user && (
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                {generateInitials(session.user.name || '')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.user.name}</p>
                <p className="text-xs text-muted truncate">{session.user.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="p-1.5 rounded-md text-muted hover:text-black hover:bg-surface transition-colors flex-shrink-0"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
