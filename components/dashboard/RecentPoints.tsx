'use client'

import React from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
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
        <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">Recent Activity</h3>
        <Link href="/points" className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          View all →
        </Link>
      </div>
      <div className="space-y-1">
        {points.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-4 font-medium italic">No recent points recorded.</p>
        ) : (
          points.map((point, i) => (
            <div
              key={point.id}
              className={cn(
                'flex items-center gap-4 py-3.5 px-3 rounded-xl transition-all duration-200 hover:bg-[var(--surface-hover)]',
                i < points.length - 1 && 'border-b border-[var(--border)]'
              )}
            >
              <div className="flex flex-col items-center justify-center min-w-[40px] h-10 rounded-xl bg-[var(--surface-active)] border border-[var(--border)]">
                <span className="text-[9px] font-black uppercase tracking-tighter text-[var(--muted)]">
                  {formatDate(point.createdAt, 'MMM')}
                </span>
                <span className="text-[12px] font-black leading-none text-[var(--foreground)]">
                  {formatDate(point.createdAt, 'd')}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold block truncate text-[var(--foreground)]">{point.title}</span>
                {point.room && (
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--muted)] mt-0.5 block">
                    {point.room.name}
                  </span>
                )}
              </div>

              <div
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300',
                  point.priority === 'high'
                    ? 'bg-[var(--foreground)] scale-110'
                    : 'border border-[var(--border)]'
                )}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
