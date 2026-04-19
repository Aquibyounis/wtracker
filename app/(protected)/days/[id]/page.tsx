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

  const copyTasksToClipboard = () => {
    const taskList = blocks
      .map((b, i) => `${i + 1}. ${b.title}${b.body ? ` - ${b.body}` : ''}${b.duration ? ` (${getDurationLabel(b.duration)})` : ''}`)
      .join('\n')
    
    const intro = `Daily Log: ${currentDay.title} (${format(date, 'MMM d, yyyy')})\n\n`
    const meeting = currentDay.hasMeeting ? `\nMinutes of Meeting:\n${currentDay.meetingPoints || 'None'}\n` : ''
    const impPoints = currentDay.notes ? `\nImportant Points:\n${currentDay.notes}` : ''
    
    const fullText = intro + 'Completed Tasks:\n' + (taskList || 'No tasks recorded.') + meeting + impPoints

    navigator.clipboard.writeText(fullText)
    toast.success('Tasks copied to clipboard')
  }

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
            <span className="text-xs text-muted font-medium bg-surface px-2 py-0.5 rounded">
              {currentDay.project?.company?.name} / {currentDay.project?.name}
            </span>
            <span className="text-xs text-muted">{format(date, 'EEEE, d MMMM yyyy')}</span>
            <button onClick={handleStatusCycle}>
              <Badge variant={statusVariant}>{currentDay.status}</Badge>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={copyTasksToClipboard} className="gap-2">
            <Copy size={14} /> Copy Log
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            fetch(`/api/days/${dayId}/copy`, { method: 'POST' })
              .then(r => r.json())
              .then(d => { router.push(`/days/${d.id}`); toast.success('Day duplicated') })
              .catch(() => toast.error('Failed'))
          }}>
            Duplicate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Left — Work Log */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-xs text-muted uppercase tracking-wider font-bold">Tasks Executed</p>
              <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded-full border border-black/[0.03]">
                <label className="text-[10px] font-bold text-muted uppercase cursor-pointer select-none" htmlFor="meeting-toggle">Meeting Held?</label>
                <input 
                  id="meeting-toggle"
                  type="checkbox" 
                  className="w-3 h-3 rounded border-border focus:ring-black accent-black shadow-sm"
                  checked={currentDay.hasMeeting}
                  onChange={(e) => {
                    setCurrentDay({ ...currentDay, hasMeeting: e.target.checked })
                    saveField('hasMeeting', e.target.checked)
                  }}
                />
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleAddBlock} className="h-8 text-[11px] font-bold uppercase tracking-tight">
              <Plus size={14} className="mr-1" /> Add Task
            </Button>
          </div>

          {currentDay.hasMeeting && (
            <Card className="p-5 border-2 border-black/5 bg-surface/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 bg-black rounded-full" />
                <h4 className="text-[11px] font-bold text-black uppercase tracking-wider">Minutes of Meeting</h4>
              </div>
              <textarea
                className="w-full text-sm bg-white border border-black/5 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-black/5 min-h-[120px]"
                placeholder="Key decisions, action items, participants..."
                value={currentDay.meetingPoints || ''}
                onChange={(e) => setCurrentDay({ ...currentDay, meetingPoints: e.target.value })}
                onBlur={(e) => saveField('meetingPoints', e.target.value)}
              />
            </Card>
          )}

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
                            'border border-border rounded-xl p-5 bg-white transition-all duration-200 group relative',
                            snapshot.isDragging ? 'shadow-2xl border-black ring-4 ring-black/5' : 'hover:border-black/20 hover:shadow-md'
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div {...provided.dragHandleProps} className="pt-2 cursor-grab text-muted hover:text-black transition-colors">
                              <GripVertical size={16} />
                            </div>
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <input
                                    placeholder="09:00"
                                    className="w-20 text-[11px] font-bold tracking-widest text-black bg-surface rounded-md px-2 py-1.5 border-none outline-none text-center shadow-inner"
                                    value={block.timestamp || ''}
                                    onChange={(e) => handleBlockChange(block.id, 'timestamp', e.target.value)}
                                  />
                                  <button
                                    onClick={() => handleBlockChange(block.id, 'priority', block.priority === 'high' ? 'normal' : 'high')}
                                    className={cn(
                                      'w-4 h-4 rounded-full border-2 transition-all flex-shrink-0',
                                      block.priority === 'high' ? 'bg-black border-black shadow-lg shadow-black/20 scale-110' : 'border-muted active:scale-95'
                                    )}
                                    title="Major Task"
                                  />
                                </div>
                                <input
                                  className="flex-1 text-[16px] font-semibold bg-transparent border-none outline-none placeholder:text-muted/40"
                                  placeholder="What did you achieve?"
                                  value={block.title}
                                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                  onBlur={(e) => handleBlockChange(block.id, 'title', e.target.value)}
                                />
                              </div>
                              <textarea
                                placeholder="Context, outcomes, or notes..."
                                className="w-full text-[13px] leading-relaxed text-muted bg-transparent border-none outline-none resize-none focus:placeholder:opacity-0 transition-all"
                                rows={2}
                                value={block.body || ''}
                                onChange={(e) => updateBlock(block.id, { body: e.target.value })}
                                onBlur={(e) => handleBlockChange(block.id, 'body', e.target.value)}
                              />
                              <div className="flex items-center gap-4 pt-1">
                                <div className="flex items-center gap-2 bg-surface/50 px-3 py-1 rounded-full border border-black/[0.02]">
                                  <span className="text-[10px] font-bold text-muted/60 uppercase">Duration</span>
                                  <input
                                    placeholder="20m"
                                    className="w-12 text-[11px] font-bold text-black bg-transparent border-none outline-none"
                                    value={block.duration || ''}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0
                                      handleBlockChange(block.id, 'duration', val)
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteBlock(block.id)}
                              className="p-2 rounded-lg text-muted hover:text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                            >
                              <Trash2 size={16} />
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
            className="w-full py-5 border-2 border-dashed border-border rounded-xl text-sm font-bold text-muted hover:text-black hover:border-black/40 hover:bg-surface/30 transition-all flex items-center justify-center gap-2 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
            RECORD NEW TASK
          </button>
        </div>

        {/* Right — Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6 space-y-4 shadow-xl shadow-black/[0.02] border-black/5">
            <div>
              <label className="block text-[10px] font-bold text-muted mb-3 uppercase tracking-widest">EOD Summary</label>
              <textarea
                className="w-full text-sm bg-white border border-border rounded-xl p-4 resize-none focus:outline-none focus:ring-4 focus:ring-black/5 min-h-[160px] transition-all"
                placeholder="Synthesize your overall progress today..."
                value={currentDay.summary || ''}
                onChange={(e) => setCurrentDay({ ...currentDay, summary: e.target.value })}
                onBlur={(e) => saveField('summary', e.target.value)}
              />
            </div>
            
            <div className="pt-4 border-t border-black/[0.03]">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Work Intensity</label>
                <span className="text-[10px] font-bold text-black">{currentDay.mood || 0}/5</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setCurrentDay({ ...currentDay, mood: level })
                      saveField('mood', level)
                    }}
                    className={cn(
                      'flex-1 h-2 rounded-full transition-all duration-300',
                      (currentDay.mood || 0) >= level ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.1)]' : 'bg-surface border border-black/[0.02]'
                    )}
                  />
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-black text-white rounded-2xl shadow-2xl shadow-black/20">
            <label className="block text-[10px] font-bold text-white/50 mb-1 uppercase tracking-widest">Total Investment</label>
            <p className="text-3xl font-black tracking-tighter">{getDurationLabel(totalDuration)}</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase">
              <div className="w-1 h-1 bg-white/40 rounded-full" />
              <span>{blocks.length} Tasks Recorded</span>
            </div>
          </Card>

          <Card className="p-6 space-y-4 border-black/5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Important Points</label>
              <Plus size={12} className="text-muted/40" />
            </div>
            <textarea
              className="w-full text-sm bg-surface/50 border-none rounded-xl p-4 resize-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-black/5 min-h-[100px] transition-all"
              placeholder="Significant observations, blockers, or ideas..."
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
