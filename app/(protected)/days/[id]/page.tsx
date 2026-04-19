'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useDayStore } from '@/store/dayStore'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { ArrowLeft, Plus, GripVertical, Trash2, Copy } from 'lucide-react'
import { format } from 'date-fns'
import { cn, getDurationLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Day, WorkBlock } from '@/types'

export default function DayEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { currentDay, setCurrentDay, blocks, setBlocks, addBlock, removeBlock, reorderBlocks, updateBlock } = useDayStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const dayId = params?.id as string

  useEffect(() => {
    fetchDay()
    return () => {
      setCurrentDay(null)
      setBlocks([])
    }
  }, [dayId])

  const fetchDay = async () => {
    try {
      const res = await fetch(`/api/days/${dayId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCurrentDay(data)
      setBlocks(data.workBlocks || [])
    } catch {
      toast.error('Failed to load day')
      router.push('/days')
    } finally {
      setLoading(false)
    }
  }

  const saveField = useCallback(async (field: string, value: unknown) => {
    try {
      await fetch(`/api/days/${dayId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
    } catch {
      toast.error('Failed to save')
    }
  }, [dayId])

  const handleStatusCycle = async () => {
    const statusOrder = ['draft', 'active', 'completed'] as const
    const currentIndex = statusOrder.indexOf(currentDay?.status as any) || 0
    const nextStatus = statusOrder[(currentIndex + 1) % 3]
    setCurrentDay({ ...currentDay!, status: nextStatus })
    await saveField('status', nextStatus)
  }

  const handleAddBlock = async () => {
    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId, title: 'New Block' }),
      })
      if (!res.ok) throw new Error()
      const block = await res.json()
      addBlock(block)
    } catch {
      toast.error('Failed to add block')
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await fetch(`/api/blocks/${blockId}`, { method: 'DELETE' })
      removeBlock(blockId)
      toast.success('Block removed')
    } catch {
      toast.error('Failed to delete block')
    }
  }

  const handleBlockChange = useCallback(async (blockId: string, field: string, value: unknown) => {
    updateBlock(blockId, { [field]: value })
    try {
      await fetch(`/api/blocks/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
    } catch {
      // Silent fail for auto-save
    }
  }, [updateBlock])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const { source, destination } = result
    if (source.index === destination.index) return

    reorderBlocks(source.index, destination.index)

    const reorderedIds = [...blocks]
    const [moved] = reorderedIds.splice(source.index, 1)
    reorderedIds.splice(destination.index, 0, moved)

    try {
      await fetch('/api/blocks/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId, orderedIds: reorderedIds.map((b) => b.id) }),
      })
    } catch {
      toast.error('Failed to reorder')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    )
  }

  if (!currentDay) return null

  const date = new Date(currentDay.date)
  const totalDuration = blocks.reduce((sum, b) => sum + (b.duration || 0), 0)
  const statusVariant = currentDay.status === 'completed' ? 'completed' : currentDay.status === 'active' ? 'active' : 'draft'

  return (
    <PageWrapper maxWidth="full" className="px-4 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/days')} className="p-1.5 rounded-md text-muted hover:text-black hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <input
            className="text-xl font-semibold bg-transparent border-none outline-none w-full"
            value={currentDay.title}
            onChange={(e) => setCurrentDay({ ...currentDay, title: e.target.value })}
            onBlur={(e) => saveField('title', e.target.value)}
          />
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted">{format(date, 'EEEE, d MMMM yyyy')}</span>
            <button onClick={handleStatusCycle}>
              <Badge variant={statusVariant}>{currentDay.status}</Badge>
            </button>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => {
          fetch(`/api/days/${dayId}/copy`, { method: 'POST' })
            .then(r => r.json())
            .then(d => { router.push(`/days/${d.id}`); toast.success('Day copied') })
            .catch(() => toast.error('Failed'))
        }}>
          <Copy size={14} /> Copy
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Left — Work Log */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted uppercase tracking-wider font-medium">Work Log</p>
            <Button variant="ghost" size="sm" onClick={handleAddBlock}>
              <Plus size={14} /> Add Block
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                  {blocks.map((block, index) => (
                    <Draggable key={block.id} draggableId={block.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            'border border-border rounded-lg p-4 bg-white transition-all duration-150',
                            snapshot.isDragging && 'border-black'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div {...provided.dragHandleProps} className="pt-1 cursor-grab text-muted hover:text-black">
                              <GripVertical size={16} />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <input
                                  placeholder="--:--"
                                  className="w-16 text-xs text-muted bg-surface rounded px-2 py-1 border-none outline-none"
                                  value={block.timestamp || ''}
                                  onChange={(e) => handleBlockChange(block.id, 'timestamp', e.target.value)}
                                />
                                <button
                                  onClick={() => handleBlockChange(block.id, 'priority', block.priority === 'high' ? 'normal' : 'high')}
                                  className={cn(
                                    'w-3 h-3 rounded-full border-2 transition-all',
                                    block.priority === 'high' ? 'bg-black border-black' : 'border-muted'
                                  )}
                                />
                                <input
                                  className="flex-1 text-[15px] font-medium bg-transparent border-none outline-none"
                                  value={block.title}
                                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                  onBlur={(e) => handleBlockChange(block.id, 'title', e.target.value)}
                                />
                              </div>
                              <textarea
                                placeholder="Add details, bullets, code..."
                                className="w-full text-sm text-muted bg-transparent border-none outline-none resize-none"
                                rows={2}
                                value={block.body || ''}
                                onChange={(e) => updateBlock(block.id, { body: e.target.value })}
                                onBlur={(e) => handleBlockChange(block.id, 'body', e.target.value)}
                              />
                              <div className="flex items-center gap-3">
                                <input
                                  placeholder="0m"
                                  className="w-16 text-xs text-muted bg-surface rounded px-2 py-1 border-none outline-none"
                                  value={block.duration || ''}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0
                                    handleBlockChange(block.id, 'duration', val)
                                  }}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteBlock(block.id)}
                              className="p-1 rounded text-muted hover:text-black opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <button
            onClick={handleAddBlock}
            className="w-full mt-4 py-3 border-2 border-dashed border-border rounded-lg text-sm text-muted hover:text-black hover:border-black transition-colors"
          >
            + Add Block
          </button>
        </div>

        {/* Right — Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card className="p-4">
            <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Summary</label>
            <textarea
              className="w-full text-sm border border-border rounded-md p-3 resize-none focus:outline-none focus:border-black"
              rows={4}
              placeholder="Write a summary of today's work..."
              value={currentDay.summary || ''}
              onChange={(e) => setCurrentDay({ ...currentDay, summary: e.target.value })}
              onBlur={(e) => saveField('summary', e.target.value)}
            />
          </Card>

          <Card className="p-4">
            <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Time Logged</label>
            <p className="text-xl font-bold">{getDurationLabel(totalDuration)}</p>
          </Card>

          <Card className="p-4">
            <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Energy Level</label>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setCurrentDay({ ...currentDay, mood: level })
                    saveField('mood', level)
                  }}
                  className={cn(
                    'w-4 h-4 rounded-full transition-all',
                    (currentDay.mood || 0) >= level ? 'bg-black' : 'border-2 border-border'
                  )}
                />
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Notes</label>
            <textarea
              className="w-full text-sm border border-border rounded-md p-3 resize-none focus:outline-none focus:border-black"
              rows={3}
              placeholder="Quick notes..."
              value={currentDay.notes || ''}
              onChange={(e) => setCurrentDay({ ...currentDay, notes: e.target.value })}
              onBlur={(e) => saveField('notes', e.target.value)}
            />
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}
