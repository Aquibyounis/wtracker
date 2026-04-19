'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { format } from 'date-fns'
import { Copy, Trash2, ExternalLink } from 'lucide-react'
import type { Day } from '@/types'

interface DayCardProps {
  day: Day
  onDelete?: () => void
  onCopy?: () => void
}

export function DayCard({ day, onDelete, onCopy }: DayCardProps) {
  const date = new Date(day.date)
  const statusVariant = day.status === 'completed' ? 'completed' : day.status === 'active' ? 'active' : 'draft'

  return (
    <Card className="group relative p-5 hover:bg-surface/50 transition-all duration-150">
      <Link href={`/days/${day.id}`} className="block">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[48px] font-bold leading-none">{format(date, 'd')}</p>
            <p className="text-xs text-muted mt-1">{format(date, 'MMM yyyy')}</p>
          </div>
          <Badge variant={statusVariant}>{day.status}</Badge>
        </div>

        <h4 className="text-base font-medium mt-4 line-clamp-1">{day.title}</h4>

        {(day.room as any)?.name && (
          <span className="inline-block text-xs bg-surface text-muted px-2 py-0.5 rounded-full mt-2">
            {(day.room as any).name}
          </span>
        )}

        <div className="flex items-center gap-4 mt-3 text-xs text-muted">
          <span>{day._count?.workBlocks || 0} blocks</span>
          <span>{day._count?.points || 0} points</span>
        </div>
      </Link>

      {/* Hover actions */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <Link
          href={`/days/${day.id}`}
          className="p-1.5 rounded-md text-muted hover:text-black hover:bg-white transition-colors"
        >
          <ExternalLink size={14} />
        </Link>
        {onCopy && (
          <button
            onClick={(e) => { e.preventDefault(); onCopy() }}
            className="p-1.5 rounded-md text-muted hover:text-black hover:bg-white transition-colors"
          >
            <Copy size={14} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.preventDefault(); onDelete() }}
            className="p-1.5 rounded-md text-muted hover:text-black hover:bg-white transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </Card>
  )
}
