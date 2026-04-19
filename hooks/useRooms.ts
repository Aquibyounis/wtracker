import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import type { Room } from '@/types'

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rooms')
      if (res.ok) setRooms(await res.json())
    } catch {
      toast.error('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }, [])

  const createRoom = useCallback(async (data: { name: string; description?: string }) => {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create room')
    const room = await res.json()
    setRooms(prev => [room, ...prev])
    return room
  }, [])

  const deleteRoom = useCallback(async (id: string) => {
    const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setRooms(prev => prev.filter(r => r.id !== id))
      toast.success('Room deleted')
    }
  }, [])

  return { rooms, loading, fetchRooms, createRoom, deleteRoom }
}
