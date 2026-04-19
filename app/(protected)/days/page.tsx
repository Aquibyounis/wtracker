'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { DayCard } from '@/components/days/DayCard'
import { NewDayModal } from '@/components/days/NewDayModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { Plus, Grid3X3, List, Calendar, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Day } from '@/types'

export default function DaysPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [days, setDays] = useState<Day[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list' | 'calendar'>('grid')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [showNewModal, setShowNewModal] = useState(false)

  useEffect(() => {
    if (searchParams?.get('create') === 'true') {
      setShowNewModal(true)
    }
  }, [searchParams])

  useEffect(() => {
    fetchDays()
  }, [sort])

  const fetchDays = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ sort })
      if (search) params.set('search', search)
      const res = await fetch(`/api/days?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDays(data)
      }
    } catch {
      toast.error('Failed to load days')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchDays()
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/days/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDays(days.filter((d) => d.id !== id))
        toast.success('Day deleted')
      }
    } catch {
      toast.error('Failed to delete day')
    }
  }

  const handleCopy = async (id: string) => {
    try {
      const res = await fetch(`/api/days/${id}/copy`, { method: 'POST' })
      if (res.ok) {
        const newDay = await res.json()
        router.push(`/days/${newDay.id}`)
      }
    } catch {
      toast.error('Failed to copy day')
    }
  }

  return (
    <PageWrapper>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1 border border-border rounded-md">
          {[
            { key: 'grid', icon: Grid3X3 },
            { key: 'list', icon: List },
            { key: 'calendar', icon: Calendar },
          ].map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key as typeof view)}
              className={cn(
                'px-3 py-1.5 transition-all duration-150',
                view === key ? 'bg-black text-white' : 'text-muted hover:text-black'
              )}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Search days..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-md w-48 focus:outline-none focus:border-black"
            />
          </form>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border border-border rounded-md px-3 py-1.5 focus:outline-none focus:border-black bg-white"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

          <Button size="sm" onClick={() => setShowNewModal(true)}>
            <Plus size={16} /> New Day
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-border border-t-black animate-spin" />
        </div>
      ) : days.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted text-sm">No days found. Create your first day!</p>
          <Button className="mt-4" onClick={() => setShowNewModal(true)}>
            <Plus size={16} /> Create Day
          </Button>
        </div>
      ) : view === 'list' ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-label uppercase text-muted font-medium px-4 py-3">Date</th>
                <th className="text-left text-label uppercase text-muted font-medium px-4 py-3">Title</th>
                <th className="text-left text-label uppercase text-muted font-medium px-4 py-3">Room</th>
                <th className="text-left text-label uppercase text-muted font-medium px-4 py-3">Blocks</th>
                <th className="text-left text-label uppercase text-muted font-medium px-4 py-3">Points</th>
                <th className="text-left text-label uppercase text-muted font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr
                  key={day.id}
                  className="border-b border-border hover:bg-surface cursor-pointer transition-colors"
                  onClick={() => router.push(`/days/${day.id}`)}
                >
                  <td className="px-4 py-3 text-sm">{new Date(day.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm font-medium">{day.title}</td>
                  <td className="px-4 py-3 text-sm text-muted">{(day.room as any)?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted">{day._count?.workBlocks || 0}</td>
                  <td className="px-4 py-3 text-sm text-muted">{day._count?.points || 0}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-label px-2 py-0.5 rounded-full',
                      day.status === 'completed' ? 'bg-black text-white' : day.status === 'active' ? 'bg-black text-white' : 'bg-surface text-muted'
                    )}>
                      {day.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              onDelete={() => handleDelete(day.id)}
              onCopy={() => handleCopy(day.id)}
            />
          ))}
        </div>
      )}

      <NewDayModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={(id) => router.push(`/days/${id}`)}
      />
    </PageWrapper>
  )
}
