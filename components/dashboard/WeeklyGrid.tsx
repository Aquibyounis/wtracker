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
      <h3 className="text-sm font-semibold mb-4">This Week</h3>
      <div className="grid grid-cols-7 gap-3">
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
                  'p-3 text-center hover:bg-surface transition-colors duration-150 cursor-pointer',
                  isToday && 'border-black'
                )}
              >
                <p className="text-label text-muted">{format(d, 'EEE')}</p>
                <p className="text-xl font-bold mt-1">{format(d, 'd')}</p>
                <div className="mt-2 flex justify-center">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      dayData ? 'bg-black' : 'border border-border'
                    )}
                  />
                </div>
                {dayData && dayData._count.points > 0 && (
                  <p className="text-[10px] text-muted mt-1">{dayData._count.points}pt</p>
                )}
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
