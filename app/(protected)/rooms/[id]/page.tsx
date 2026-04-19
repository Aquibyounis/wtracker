'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DayCard } from '@/components/days/DayCard'
import { Spinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Room, Day, Point } from '@/types'

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [days, setDays] = useState<Day[]>([])
  const [points, setPoints] = useState<Point[]>([])
  const [tab, setTab] = useState<'days' | 'points' | 'settings'>('days')
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const roomId = params?.id as string

  useEffect(() => {
    fetchRoom()
    fetchDays()
    fetchPoints()
  }, [roomId])

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`)
      if (res.ok) {
        const data = await res.json()
        setRoom(data)
        setName(data.name)
        setDescription(data.description || '')
      }
    } catch {} finally { setLoading(false) }
  }

  const fetchDays = async () => {
    const res = await fetch(`/api/days?roomId=${roomId}`)
    if (res.ok) setDays(await res.json())
  }

  const fetchPoints = async () => {
    const res = await fetch(`/api/points?roomId=${roomId}`)
    if (res.ok) setPoints(await res.json())
  }

  const handleSave = async () => {
    try {
      await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      toast.success('Room updated')
    } catch { toast.error('Failed to save') }
  }

  const handleDelete = async () => {
    try {
      await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' })
      toast.success('Room deleted')
      router.push('/rooms')
    } catch { toast.error('Failed to delete') }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!room) return null

  return (
    <PageWrapper>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/rooms')} className="p-1.5 rounded-md text-muted hover:text-black hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-medium">
          {room.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{room.name}</h2>
          {room.description && <p className="text-sm text-muted">{room.description}</p>}
          <div className="flex gap-3 text-xs text-muted mt-1">
            <span>{room._count?.days || 0} days</span>
            <span>{room._count?.points || 0} points</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border mb-6">
        {(['days', 'points', 'settings'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2',
              tab === t ? 'border-black text-black' : 'border-transparent text-muted hover:text-black'
            )}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'days' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.length === 0 ? (
            <p className="text-sm text-muted col-span-full py-10 text-center">No days in this room yet.</p>
          ) : days.map((day) => <DayCard key={day.id} day={day} />)}
        </div>
      )}

      {tab === 'points' && (
        <div className="space-y-2">
          {points.length === 0 ? (
            <p className="text-sm text-muted py-10 text-center">No points in this room yet.</p>
          ) : points.map((point) => (
            <Card key={point.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">{point.title}</h4>
                  {point.body && <p className="text-xs text-muted mt-1 line-clamp-1">{point.body}</p>}
                </div>
                <div className={cn('w-2 h-2 rounded-full', point.priority === 'high' ? 'bg-black' : 'border border-muted')} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className="max-w-md space-y-4">
          <Input label="Room Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:border-black" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 size={14} /> Delete Room
            </Button>
          </div>
          <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Room" message="This will permanently delete this room and all data. This cannot be undone." />
        </div>
      )}
    </PageWrapper>
  )
}
