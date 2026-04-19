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

        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] px-1">
            Project
          </label>
          <div className="relative group">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-[1.25rem] px-5 py-4 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--border-strong)] focus:bg-[var(--surface)] transition-all hover:bg-[var(--surface-active)] appearance-none cursor-pointer"
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.company.name}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] px-1">
            Structure Template
          </label>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTemplateType(t.value)}
                className={cn(
                  'px-4 py-4 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest border transition-all duration-200 text-center',
                  templateType === t.value
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)] shadow-xl shadow-black/10 scale-[1.02]'
                    : 'bg-[var(--surface-hover)] text-[var(--muted)] border-[var(--border)] hover:bg-[var(--surface-active)] hover:text-[var(--foreground)]'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-8 border-t border-[var(--border)] mt-10">
          <Button type="button" variant="ghost" onClick={onClose} className="font-black text-[10px] uppercase tracking-[0.2em] h-12 px-6">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="px-8 font-black text-[10px] uppercase tracking-[0.2em] h-12 shadow-xl shadow-black/5">
            Initialize Entry →
          </Button>
        </div>
      </form>
    </Modal>
  )
}

