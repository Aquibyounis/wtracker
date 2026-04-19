'use client'

import React from 'react'
import Link from 'next/link'
import { formatDate, formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RecentPointsProps {
  points: Array<{
    id: string
    title: string
    priority: string
    createdAt: string
    room?: { name: string } | null
  }>
}

export function RecentPoints({ points }: RecentPointsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Recent Points</h3>
        <Link href="/points" className="text-xs text-muted hover:text-black transition-colors">
          View all →
        </Link>
      </div>
      <div className="space-y-0">
        {points.length === 0 ? (
          <p className="text-sm text-muted py-4">No points yet. Create your first one!</p>
        ) : (
          points.map((point, i) => (
            <div
              key={point.id}
              className={cn(
                'flex items-center gap-3 py-3',
                i < points.length - 1 && 'border-b border-border'
              )}
            >
              <span className="text-xs bg-surface text-muted px-2 py-0.5 rounded-full flex-shrink-0">
                {formatDate(point.createdAt, 'MMM d')}
              </span>
              <span className="text-sm flex-1 truncate">{point.title}</span>
              {point.room && (
                <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full flex-shrink-0">
                  {point.room.name}
                </span>
              )}
              <div
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  point.priority === 'high' ? 'bg-black' : 'border border-muted'
                )}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
