import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import type { Point } from '@/types'

export function usePoints() {
  const [points, setPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPoints = useCallback(async (params?: Record<string, string>) => {
    setLoading(true)
    try {
      const searchParams = new URLSearchParams(params || {})
      const res = await fetch(`/api/points?${searchParams}`)
      if (res.ok) setPoints(await res.json())
    } catch {
      toast.error('Failed to load points')
    } finally {
      setLoading(false)
    }
  }, [])

  const createPoint = useCallback(async (data: Record<string, unknown>) => {
    const res = await fetch('/api/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create point')
    const point = await res.json()
    setPoints(prev => [point, ...prev])
    return point
  }, [])

  const deletePoint = useCallback(async (id: string) => {
    const res = await fetch(`/api/points/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPoints(prev => prev.filter(p => p.id !== id))
      toast.success('Point deleted')
    }
  }, [])

  return { points, loading, fetchPoints, createPoint, deletePoint }
}
