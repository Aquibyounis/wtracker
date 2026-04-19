'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface NewDayModalProps {
  open: boolean
  onClose: () => void
  onCreated: (id: string) => void
  defaultDate?: string
}

const templates = [
  { value: 'blank', label: 'Blank' },
  { value: 'standup', label: 'Daily Standup' },
  { value: 'sprint', label: 'Sprint Day' },
  { value: 'deepwork', label: 'Deep Work' },
]

export function NewDayModal({ open, onClose, onCreated, defaultDate }: NewDayModalProps) {
  const [date, setDate] = useState(defaultDate || format(new Date(), 'yyyy-MM-dd'))
  const [title, setTitle] = useState('')
  const [templateType, setTemplateType] = useState('blank')
  const [projects, setProjects] = useState<Array<{ id: string; name: string; company: { name: string } }>>([])
  const [projectId, setProjectId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetch('/api/projects')
        .then((res) => res.json())
        .then(setProjects)
        .catch(() => {})
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!projectId) {
      toast.error('Please select a project')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          date,
          projectId,
          templateType,
        }),
      })

      if (!res.ok) throw new Error()
      const day = await res.json()
      toast.success('Day created')
      onCreated(day.id)
      onClose()
      setTitle('')
      setTemplateType('blank')
      setProjectId('')
    } catch {
      toast.error('Failed to create day')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Log entry" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Input
          label="Title"
          placeholder="e.g. Frontend Refactor, Sprint Review..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div>
          <label className="block text-sm font-bold tracking-tight mb-1.5 uppercase text-[10px] text-muted">Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full border border-border rounded-lg px-3.5 py-3 text-sm font-medium focus:outline-none focus:border-black bg-white shadow-sm"
          >
            <option value="">Select a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.company.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold tracking-tight mb-2 uppercase text-[10px] text-muted">Structure Template</label>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTemplateType(t.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold border transition-all duration-200',
                  templateType === t.value
                    ? 'bg-black text-white border-black shadow-lg shadow-black/10'
                    : 'bg-white text-black border-border hover:border-black/20 hover:bg-surface'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
          <Button type="button" variant="ghost" onClick={onClose} className="font-bold text-xs uppercase tracking-wider">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="px-6 font-bold text-xs uppercase tracking-wider">
            Initialize Entry →
          </Button>
        </div>
      </form>
    </Modal>
  )
}

