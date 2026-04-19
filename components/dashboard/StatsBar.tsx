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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfigs.map((config) => {
        const Icon = config.icon
        const value = stats[config.key as keyof typeof stats]
        return (
          <Card key={config.key} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[32px] font-bold leading-none">{value}</p>
                <p className="text-caption text-muted mt-2">{config.label}</p>
              </div>
              <Icon size={20} className="text-muted" />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
