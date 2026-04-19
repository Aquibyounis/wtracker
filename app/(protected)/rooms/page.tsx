'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatRelative, generateInitials } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Room } from '@/types'

export default function RoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms')
      if (res.ok) setRooms(await res.json())
    } catch {
      toast.error('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc }),
      })
      if (!res.ok) throw new Error()
      const room = await res.json()
      setRooms([room, ...rooms])
      setShowModal(false)
      setNewName('')
      setNewDesc('')
      toast.success('Room created')
    } catch {
      toast.error('Failed to create room')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/rooms/${deleteId}`, { method: 'DELETE' })
      setRooms(rooms.filter((r) => r.id !== deleteId))
      toast.success('Room deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Rooms</h2>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Room
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-border border-t-black animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted text-sm">No rooms yet. Create one to organize your work!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="p-5 group cursor-pointer hover:bg-surface/50 transition-colors"
              onClick={() => router.push(`/rooms/${room.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-medium flex-shrink-0">
                  {room.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-base">{room.name}</h4>
                  {room.description && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">{room.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted">
                    <span>{room._count?.days || 0} days</span>
                    <span>·</span>
                    <span>{room._count?.points || 0} points</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(room.id) }}
                  className="p-1 rounded text-muted hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Room Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Room" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Room Name" placeholder="e.g. Frontend, Research" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:border-black"
              rows={3}
              placeholder="What is this room for?"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Room"
        message="This will permanently delete this room and all associated data. This cannot be undone."
      />
    </PageWrapper>
  )
}
