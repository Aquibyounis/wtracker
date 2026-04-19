'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatRelative } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

interface TodaySnapshotProps {
  day: {
    id: string
    title: string
    date: string
    status: string
    updatedAt: string
    _count: { workBlocks: number; points: number }
  } | null
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  active:    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  draft:     'bg-[var(--surface-active)] text-[var(--muted)]',
}

export function TodaySnapshot({ day }: TodaySnapshotProps) {
  const now = new Date()
  const dayName = format(now, 'EEEE')
  const dateStr = format(now, 'd MMMM yyyy')

  const statusKey = day?.status ?? 'draft'
  const statusClass = statusColors[statusKey] ?? statusColors.draft

  return (
    <Card className="p-8 overflow-hidden relative group">
      <div className="flex items-start justify-between flex-wrap gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black tracking-tight">{dayName}</h3>
            {day && (
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusClass}`}>
                {day.status}
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-[var(--muted)] mt-1.5 uppercase tracking-widest leading-none">
            {dateStr}
          </p>
        </div>

        {day ? (
          <div className="flex flex-col md:items-end gap-3">
            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--foreground)]" />
                {day._count.workBlocks} Blocks
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--foreground)]" />
                {day._count.points} Points
              </span>
            </div>
            <p className="text-[10px] font-bold text-[var(--muted)] opacity-60">
              Last update {formatRelative(day.updatedAt)}
            </p>
            <Link href={`/days/${day.id}`}>
              <Button variant="outline" size="sm" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest">
                Open Workspace <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col md:items-end gap-3">
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">No progress tracked yet</p>
            <Link href="/days?create=true">
              <Button size="sm" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest">
                Start Tracking <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--foreground)]/[0.01] -mr-32 -mt-32 rounded-full blur-3xl pointer-events-none" />
    </Card>
  )
}
