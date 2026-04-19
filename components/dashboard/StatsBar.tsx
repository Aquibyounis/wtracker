'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { CalendarDays, Pin, Flame, Calendar } from 'lucide-react'

interface StatsBarProps {
  stats: {
    totalDays: number
    pointsThisWeek: number
    currentStreak: number
    thisMonthDays: number
  }
}

const statConfigs = [
  { key: 'totalDays', label: 'Total Days Logged', icon: CalendarDays },
  { key: 'pointsThisWeek', label: 'Points This Week', icon: Pin },
  { key: 'currentStreak', label: 'Current Streak', icon: Flame },
  { key: 'thisMonthDays', label: "This Month's Days", icon: Calendar },
]

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {statConfigs.map((config) => {
        const Icon = config.icon
        const value = stats[config.key as keyof typeof stats]
        return (
          <Card key={config.key} className="p-8 hover:border-[var(--border-strong)] transition-all group active:scale-[0.98]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-black leading-none tracking-tighter text-[var(--foreground)]">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] mt-3 group-hover:text-[var(--foreground)] transition-colors">
                  {config.label}
                </p>
              </div>
              <Icon size={18} className="text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
