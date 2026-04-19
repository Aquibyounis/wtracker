'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { format, eachDayOfInterval, parseISO, startOfWeek, endOfWeek } from 'date-fns'
import { cn } from '@/lib/utils'

interface WeeklyGridProps {
  weekDays: Array<{
    id: string
    date: string
    _count: { workBlocks: number; points: number }
  }>
  weekStart: string
}

export function WeeklyGrid({ weekDays, weekStart }: WeeklyGridProps) {
  const start = startOfWeek(parseISO(weekStart), { weekStartsOn: 1 })
  const end = endOfWeek(start, { weekStartsOn: 1 })
  const allDays = eachDayOfInterval({ start, end })

  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-widest text-[var(--muted)] mb-4">This Week</h3>
      <div className="grid grid-cols-7 gap-2">
        {allDays.map((d) => {
          const dateStr = format(d, 'yyyy-MM-dd')
          const dayData = weekDays.find(
            (wd) => format(parseISO(wd.date), 'yyyy-MM-dd') === dateStr
          )
          const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr

          return (
            <Link
              key={dateStr}
              href={dayData ? `/days/${dayData.id}` : `/days?create=true&date=${dateStr}`}
            >
              <Card
                className={cn(
                  'p-3 text-center min-h-[90px] group transition-all duration-300 cursor-pointer hover:border-[var(--border-strong)]',
                  isToday && 'ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--background)]'
                )}
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                  {format(d, 'EEE')}
                </p>
                <p className="text-xl font-black mt-1 leading-none">{format(d, 'd')}</p>
                <div className="mt-3 flex justify-center">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      dayData
                        ? 'bg-[var(--foreground)] scale-110'
                        : 'border border-[var(--border)] bg-transparent opacity-40'
                    )}
                  />
                </div>
                {dayData && (dayData._count.points > 0 || dayData._count.workBlocks > 0) && (
                  <div className="mt-1.5 text-[9px] font-black uppercase tracking-tighter text-[var(--muted)]">
                    {dayData._count.points}PT
                  </div>
                )}
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
