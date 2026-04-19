'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { NewDayModal } from '@/components/days/NewDayModal'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
  addMonths, subMonths,
} from 'date-fns'
import type { Day } from '@/types'

export default function CalendarPage() {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [days, setDays] = useState<Day[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    const month = format(currentMonth, 'yyyy-MM')
    fetch(`/api/days?month=${month}`)
      .then((r) => r.json())
      .then(setDays)
      .catch(() => {})
  }, [currentMonth])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd })

  const getDayData = (date: Date) => {
    return days.find((d) => format(new Date(d.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
  }

  const handleCellClick = (date: Date) => {
    const dayData = getDayData(date)
    if (dayData) {
      router.push(`/days/${dayData.id}`)
    } else {
      setSelectedDate(format(date, 'yyyy-MM-dd'))
      setShowCreate(true)
    }
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex gap-1">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-md text-muted hover:text-black hover:bg-surface transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-md text-muted hover:text-black hover:bg-surface transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setCurrentMonth(new Date())}>
          Today
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center text-label text-muted font-medium py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border border-border rounded-lg overflow-hidden">
        {calDays.map((date) => {
          const dayData = getDayData(date)
          const inMonth = isSameMonth(date, currentMonth)
          const today = isToday(date)

          return (
            <div
              key={date.toISOString()}
              onClick={() => handleCellClick(date)}
              className={cn(
                'min-h-[80px] p-2 border-b border-r border-border cursor-pointer transition-colors hover:bg-surface',
                !inMonth && 'text-border',
                today && 'ring-1 ring-inset ring-black'
              )}
            >
              <span className={cn('text-sm', today && 'font-bold')}>
                {format(date, 'd')}
              </span>
              <div className="mt-1 flex items-center gap-1">
                {dayData && (
                  <div className="w-2 h-2 rounded-full bg-black" />
                )}
                {dayData && (dayData._count?.points || 0) > 0 && (
                  <span className="text-[10px] text-muted">
                    {dayData._count?.points}pt
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-black" />
          Logged day
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full border border-muted" />
          No activity
        </div>
      </div>

      <NewDayModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(id) => router.push(`/days/${id}`)}
        defaultDate={selectedDate}
      />
    </PageWrapper>
  )
}
