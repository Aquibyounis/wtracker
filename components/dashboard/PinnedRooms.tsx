'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { formatRelative } from '@/lib/utils'

interface PinnedRoomsProps {
  rooms: Array<{
    id: string
    name: string
    description?: string | null
    _count: { days: number; points: number }
    updatedAt: string
  }>
}

export function PinnedRooms({ rooms }: PinnedRoomsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Rooms</h3>
        <Link href="/rooms" className="text-xs text-muted hover:text-black transition-colors">
          View all →
        </Link>
      </div>
      {rooms.length === 0 ? (
        <p className="text-sm text-muted py-4">No rooms yet. Create one to organize your work!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`}>
              <Card className="p-4 hover:bg-surface transition-colors cursor-pointer">
                <h4 className="font-medium text-sm">{room.name}</h4>
                {room.description && (
                  <p className="text-xs text-muted mt-1 line-clamp-2">{room.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-muted">
                  <span>{room._count.days} days</span>
                  <span>·</span>
                  <span>{room._count.points} points</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
