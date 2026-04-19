'use client'

import React, { useState } from 'react'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const colorOptions = [
  { value: 'light', bg: '#E0E0E0' },
  { value: 'mid', bg: '#888888' },
  { value: 'dark', bg: '#444444' },
  { value: 'black', bg: '#000000' },
]

export function PointDrawer() {
  const { pointDrawerOpen, setPointDrawerOpen, activeDrawerPoint, setActiveDrawerPoint } = useUIStore()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState<'normal' | 'high'>('normal')
  const [colorLabel, setColorLabel] = useState('light')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const isEditing = !!activeDrawerPoint

  React.useEffect(() => {
    if (activeDrawerPoint) {
      setTitle(activeDrawerPoint.title)
      setBody(activeDrawerPoint.body || '')
      setPriority(activeDrawerPoint.priority)
      setColorLabel(activeDrawerPoint.colorLabel)
      setTags(activeDrawerPoint.tags?.map((t) => t.name) || [])
    } else {
      resetForm()
    }
  }, [activeDrawerPoint])

  const resetForm = () => {
    setTitle('')
    setBody('')
    setPriority('normal')
    setColorLabel('light')
    setTagInput('')
    setTags([])
  }

  const handleClose = () => {
    setPointDrawerOpen(false)
    setActiveDrawerPoint(null)
    resetForm()
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().replace(',', '')
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    }
  }

  const handleSave = async (addAnother = false) => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    setLoading(true)
    try {
      const url = isEditing ? `/api/points/${activeDrawerPoint!.id}` : '/api/points'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, priority, colorLabel, tags }),
      })

      if (!res.ok) throw new Error('Failed to save')

      toast.success(isEditing ? 'Point updated' : 'Point created')

      if (addAnother) {
        resetForm()
      } else {
        handleClose()
      }
    } catch {
      toast.error('Failed to save point')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      open={pointDrawerOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Point' : 'New Point'}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          {!isEditing && (
            <Button variant="secondary" size="sm" loading={loading} onClick={() => handleSave(true)}>
              Save & Add Another
            </Button>
          )}
          <Button size="sm" loading={loading} onClick={() => handleSave(false)}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Point title..."
          className="w-full text-lg font-medium border-none outline-none placeholder:text-muted"
        />

        {/* Body */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your point..."
          rows={6}
          className="w-full text-sm border border-border rounded-md px-3 py-2 resize-none placeholder:text-muted focus:outline-none focus:border-black"
        />

        {/* Priority */}
        <div>
          <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Priority</label>
          <div className="flex gap-2">
            {(['normal', 'high'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                  priority === p
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-border hover:bg-surface'
                )}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Color label */}
        <div>
          <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Color</label>
          <div className="flex gap-3">
            {colorOptions.map((c) => (
              <button
                key={c.value}
                onClick={() => setColorLabel(c.value)}
                className={cn(
                  'w-6 h-6 rounded-sm transition-all duration-150',
                  colorLabel === c.value && 'ring-2 ring-offset-2 ring-black'
                )}
                style={{ backgroundColor: c.bg }}
              />
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs bg-surface px-2.5 py-1 rounded-full"
              >
                {tag}
                <button
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                  className="text-muted hover:text-black"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <Input
            placeholder="Add tag, press Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </div>
      </div>
    </Drawer>
  )
}
