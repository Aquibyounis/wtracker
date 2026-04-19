'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatRelative } from '@/lib/utils'
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

export function TodaySnapshot({ day }: TodaySnapshotProps) {
  const now = new Date()
  const dayName = format(now, 'EEEE')
  const dateStr = format(now, 'd MMMM yyyy')

  const statusVariant = day?.status === 'completed' ? 'completed' : day?.status === 'active' ? 'active' : 'draft'

  return (
    <Card className="p-8 border-[var(--border)] shadow-2xl shadow-black/5 overflow-hidden relative group">
      <div className="flex items-start justify-between flex-wrap gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black tracking-tight text-[var(--foreground)]">{dayName}</h3>
            {day && (
              <Badge variant={statusVariant} className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em]">
                {day.status}
              </Badge>
            )}
          </div>
          <p className="text-sm font-bold text-[var(--muted)] mt-1.5 uppercase tracking-widest leading-none">
            {dateStr}
          </p>
        </div>

        {day ? (
          <div className="flex flex-col md:items-end gap-3">
            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" /> {day._count.workBlocks} Blocks</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" /> {day._count.points} Points</span>
            </div>
            <p className="text-[10px] font-bold text-[var(--muted)] opacity-60">
              Last update {formatRelative(day.updatedAt)}
            </p>
            <Link href={`/days/${day.id}`}>
              <Button variant="secondary" size="sm" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all">
                Open Workspace <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col md:items-end gap-3 text-center md:text-right">
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">No progress tracked yet</p>
            <Link href="/days?create=true">
              <Button size="sm" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Start Tracking <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-900/[0.01] dark:bg-white/[0.01] -mr-32 -mt-32 rounded-full blur-3xl pointer-events-none" />
    </Card>
  )
}
