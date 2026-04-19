'use client'

import React, { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/store/uiStore'
import { cn, formatDate, formatRelative } from '@/lib/utils'
import { Plus, Search, Grid3X3, List, Trash2, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Point } from '@/types'

const colorBorders: Record<string, string> = {
  light: 'border-l-[#E0E0E0]',
  mid: 'border-l-[#888888]',
  dark: 'border-l-[#444444]',
  black: 'border-l-[#000000]',
}

export default function PointsPage() {
  const { setPointDrawerOpen, setActiveDrawerPoint } = useUIStore()
  const [points, setPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [priority, setPriority] = useState('all')

  useEffect(() => {
    fetchPoints()
  }, [sort, priority])

  const fetchPoints = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ sort })
      if (search) params.set('search', search)
      if (priority !== 'all') params.set('priority', priority)
      const res = await fetch(`/api/points?${params}`)
      if (res.ok) setPoints(await res.json())
    } catch {
      toast.error('Failed to load points')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/points/${id}`, { method: 'DELETE' })
      setPoints(points.filter((p) => p.id !== id))
      toast.success('Point deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <PageWrapper>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex border border-border rounded-md">
            {[
              { key: 'grid', icon: Grid3X3 },
              { key: 'list', icon: List },
            ].map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key as 'grid' | 'list')}
                className={cn(
                  'px-3 py-1.5 transition-all duration-150',
                  view === key ? 'bg-black text-white' : 'text-muted hover:text-black'
                )}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>

          <div className="flex border border-border rounded-md">
            {['all', 'normal', 'high'].map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-all duration-150',
                  priority === p ? 'bg-black text-white' : 'text-muted hover:text-black'
                )}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPoints()}
              className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-md w-40 focus:outline-none focus:border-black"
            />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm border border-border rounded-md px-3 py-1.5 focus:outline-none focus:border-black bg-white">
            <option value="newest">Newest</option>
            <option value="priority">Priority</option>
            <option value="alphabetical">A-Z</option>
          </select>
          <Button size="sm" onClick={() => { setActiveDrawerPoint(null); setPointDrawerOpen(true) }}>
            <Plus size={16} /> New Point
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-border border-t-black animate-spin" />
        </div>
      ) : points.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted text-sm">No points found.</p>
          <Button className="mt-4" onClick={() => { setActiveDrawerPoint(null); setPointDrawerOpen(true) }}>
            <Plus size={16} /> Create Point
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {points.map((point) => (
            <Card
              key={point.id}
              className={cn('p-5 border-l-4 group', colorBorders[point.colorLabel] || 'border-l-border')}
            >
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-[15px] line-clamp-1">{point.title}</h4>
                <div className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0 mt-1.5',
                  point.priority === 'high' ? 'bg-black' : 'border border-muted'
                )} />
              </div>
              {point.body && (
                <p className="text-[13px] text-muted mt-2 line-clamp-3">{point.body}</p>
              )}
              {point.day && (
                <span className="inline-block text-xs bg-surface text-muted px-2 py-0.5 rounded-full mt-3">
                  {formatDate(point.day.date, 'MMM d')}
                </span>
              )}
              {point.tags && point.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {point.tags.map((tag) => (
                    <span key={tag.id} className="text-[10px] bg-surface text-muted px-2 py-0.5 rounded-full">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted">{formatRelative(point.createdAt)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setActiveDrawerPoint(point); setPointDrawerOpen(true) }}
                    className="p-1 rounded text-muted hover:text-black"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(point.id)}
                    className="p-1 rounded text-muted hover:text-black"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-label uppercase text-muted font-medium px-4 py-3">Priority</th>
                <th className="text-left text-label uppercase text-muted font-medium px-4 py-3">Title</th>
                <th className="text-left text-label uppercase text-muted font-medium px-4 py-3">Day</th>
                <th className="text-left text-label uppercase text-muted font-medium px-4 py-3">Tags</th>
                <th className="text-left text-label uppercase text-muted font-medium px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.id} className="border-b border-border hover:bg-surface transition-colors">
                  <td className="px-4 py-3">
                    <div className={cn('w-2 h-2 rounded-full', point.priority === 'high' ? 'bg-black' : 'border border-muted')} />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{point.title}</td>
                  <td className="px-4 py-3 text-sm text-muted">{point.day ? formatDate(point.day.date, 'MMM d') : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">{point.tags?.map(t => <Badge key={t.id} className="text-[10px]">{t.name}</Badge>)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{formatRelative(point.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  )
}
