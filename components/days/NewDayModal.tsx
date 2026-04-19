'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface NewDayModalProps {
  open: boolean
  onClose: () => void
  onCreated: (id: string) => void
  defaultDate?: string
}

const templates = [
  { value: 'blank', label: 'Blank' },
  { value: 'standup', label: 'Daily Standup' },
  { value: 'sprint', label: 'Sprint Day' },
  { value: 'deepwork', label: 'Deep Work' },
]

export function NewDayModal({ open, onClose, onCreated, defaultDate }: NewDayModalProps) {
  const [date, setDate] = useState(defaultDate || format(new Date(), 'yyyy-MM-dd'))
  const [title, setTitle] = useState('')
  const [templateType, setTemplateType] = useState('blank')
  const [rooms, setRooms] = useState<Array<{ id: string; name: string }>>([])
  const [roomId, setRoomId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetch('/api/rooms')
        .then((res) => res.json())
        .then(setRooms)
        .catch(() => {})
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          date,
          roomId: roomId || undefined,
          templateType,
        }),
      })

      if (!res.ok) throw new Error()
      const day = await res.json()
      toast.success('Day created')
      onCreated(day.id)
      onClose()
      setTitle('')
      setTemplateType('blank')
      setRoomId('')
    } catch {
      toast.error('Failed to create day')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Day" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Title"
          placeholder="What are you working on?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium mb-1.5">Room</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black bg-white"
          >
            <option value="">No Room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Template</label>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTemplateType(t.value)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                  templateType === t.value
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-border hover:bg-surface'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create & Open →
          </Button>
        </div>
      </form>
    </Modal>
  )
}
