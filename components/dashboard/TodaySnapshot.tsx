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
    <Card className="p-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold">{dayName}</h3>
            {day && <Badge variant={statusVariant}>{day.status}</Badge>}
          </div>
          <p className="text-sm text-muted mt-1">{dateStr}</p>
        </div>

        {day ? (
          <div className="flex flex-col items-end gap-2">
            <p className="text-sm text-muted">
              {day._count.workBlocks} blocks · {day._count.points} points · Updated{' '}
              {formatRelative(day.updatedAt)}
            </p>
            <Link href={`/days/${day.id}`}>
              <Button variant="secondary" size="sm">
                Open Day <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <p className="text-sm text-muted">No work logged yet today.</p>
            <Link href="/days?create=true">
              <Button size="sm">
                Start Today&apos;s Log <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}
