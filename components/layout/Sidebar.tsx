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
      { name: 'Analysis', href: '/analysis', icon: BarChart2 },
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
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 bg-white dark:bg-zinc-950 border-r border-black/[0.03] dark:border-white/[0.05] flex flex-col transition-all duration-300',
          'lg:translate-x-0 lg:w-[240px]',
          sidebarOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-5 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="DockitUp Logo" className="w-6 h-6 object-contain dark:grayscale dark:invert opacity-80" />
              <h1 className="text-[14px] font-black tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase">
                DOCKITUP
              </h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
          {navSections.map((section) => (
            <div key={section.label} className="mb-8">
              <p className="px-3 mb-3 text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group',
                        isActive
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-black/5'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      )}
                      onClick={() => {
                        if (window.innerWidth < 1024) toggleSidebar()
                      }}
                    >
                      <Icon
                        size={18}
                        className={cn('transition-colors', isActive ? 'text-current' : 'text-zinc-400 group-hover:text-current')}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section (Fixed at bottom) */}
        {session?.user && (
          <div className="px-4 py-8 border-t border-black/[0.03] dark:border-white/[0.05] bg-white dark:bg-zinc-950 mt-auto transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white flex items-center justify-center text-xs font-black shadow-2xl shadow-black/10 transition-all">
                {generateInitials(session.user.name || '')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate uppercase tracking-tight leading-none">{session.user.name}</p>
                <p className="text-[10px] font-bold text-zinc-400 truncate leading-none mt-1.5">{session.user.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="p-2.5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
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

