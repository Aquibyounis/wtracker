import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import type { Day } from '@/types'

export function useDays() {
  const [days, setDays] = useState<Day[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDays = useCallback(async (params?: Record<string, string>) => {
    setLoading(true)
    try {
      const searchParams = new URLSearchParams(params || {})
      const res = await fetch(`/api/days?${searchParams}`)
      if (res.ok) {
        setDays(await res.json())
      }
    } catch {
      toast.error('Failed to load days')
    } finally {
      setLoading(false)
    }
  }, [])

  const createDay = useCallback(async (data: Record<string, unknown>) => {
    const res = await fetch('/api/days', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create day')
    return res.json()
  }, [])

  const deleteDay = useCallback(async (id: string) => {
    const res = await fetch(`/api/days/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setDays(prev => prev.filter(d => d.id !== id))
      toast.success('Day deleted')
    }
  }, [])

  return { days, loading, fetchDays, createDay, deleteDay }
}
