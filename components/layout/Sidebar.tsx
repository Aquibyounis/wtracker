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
  Briefcase,
  PieChart,
  Calendar,
  User,
  Settings,
  LogOut,
  X,
} from 'lucide-react'

const navSections = [
  {
    label: 'WORKSPACE',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Days', href: '/days', icon: CalendarDays },
      { name: 'Analysis', href: '/analysis', icon: PieChart },
      { name: 'Projects', href: '/projects', icon: Briefcase },
    ],
  },
  {
    label: 'ORGANIZE',
    items: [
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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 lg:left-4 lg:top-4 lg:bottom-4 z-50 w-[240px]',
          'bg-[var(--sidebar-bg)] border-r lg:border border-[var(--sidebar-border)]',
          'lg:rounded-[2rem] flex flex-col transition-all duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-5 h-5 object-contain invert"
              />
            </div>
            <h1 className="text-[14px] font-black tracking-[0.25em] text-[var(--sidebar-foreground)] uppercase">
              DOCKITUP
            </h1>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl text-white/40 hover:text-white/80 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAV (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {navSections.map((section) => (
            <div key={section.label} className="mb-6">
              <p className="px-3 mb-2 text-[9px] font-black tracking-[0.3em] text-white/30 uppercase">
                {section.label}
              </p>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname?.startsWith(item.href + '/')

                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200',
                        isActive
                          ? 'bg-white text-black'
                          : 'text-white/50 hover:text-white hover:bg-white/10'
                      )}
                      onClick={() => {
                        if (window.innerWidth < 1024) toggleSidebar()
                      }}
                    >
                      <Icon
                        size={17}
                        className={cn(
                          isActive ? 'text-black' : 'text-white/40'
                        )}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* PROFILE — anchored to bottom */}
        {session?.user && (
          <div className="flex-shrink-0 p-3 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center text-xs font-black flex-shrink-0">
                {generateInitials(session.user.name || '')}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white truncate leading-tight">
                  {session.user.name}
                </p>
                <p className="text-[11px] text-white/40 truncate leading-tight">
                  {session.user.email}
                </p>
              </div>

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
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