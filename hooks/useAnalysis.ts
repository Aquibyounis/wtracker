import { useState, useCallback } from 'react'
import type { AnalysisDaily, AnalysisWeekly, AnalysisMonthly } from '@/types'

export function useAnalysis() {
  const [loading, setLoading] = useState(false)

  const fetchDaily = useCallback(async (date: string): Promise<AnalysisDaily | null> => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analysis/daily?date=${date}`)
      if (res.ok) return res.json()
      return null
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchWeekly = useCallback(async (year: number, week: number): Promise<AnalysisWeekly | null> => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analysis/weekly?year=${year}&week=${week}`)
      if (res.ok) return res.json()
      return null
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMonthly = useCallback(async (year: number, month: number): Promise<AnalysisMonthly | null> => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analysis/monthly?year=${year}&month=${month}`)
      if (res.ok) return res.json()
      return null
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, fetchDaily, fetchWeekly, fetchMonthly }
}
