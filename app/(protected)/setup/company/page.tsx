'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Rocket } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

export default function SetupCompanyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    projectName: 'Internal Work',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.companyName || !formData.projectName) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      // 1. Create company
      const companyRes = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.companyName, isDefault: true }),
      })
      if (!companyRes.ok) throw new Error('Failed to create company')
      const company = await companyRes.json()

      // 2. Create first project
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.projectName, 
          companyId: company.id 
        }),
      })
      if (!projectRes.ok) throw new Error('Failed to create project')

      toast.success('Workspace ready!')
      router.refresh() // This will trigger the ProtectedLayout to re-check companyCount
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[480px] w-full mx-auto px-4 py-16 min-h-screen flex flex-col justify-center">
      <div className="text-center mb-12 relative">
        <div className="w-20 h-20 bg-zinc-900 dark:bg-zinc-100 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-black/10 transition-all">
          <Rocket className="text-white dark:text-zinc-900" size={32} />
        </div>
        <h1 className="text-4xl font-black text-[var(--foreground)] mb-3 tracking-tighter">Begin Your Journey</h1>
        <p className="text-[var(--muted)] font-black text-[10px] uppercase tracking-[0.2em]">Deployment of first workspace</p>
      </div>

      <Card className="p-10 border-[var(--border)] shadow-2xl shadow-black/5 bg-[var(--surface)] transition-all">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black tracking-[0.2em] text-[var(--muted)] uppercase">
              Organization Identity
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
              <Input
                placeholder="e.g. Acme Corporation"
                className="pl-12 h-14 text-base font-bold bg-[var(--background)] border-[var(--border)] rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black tracking-[0.2em] text-[var(--muted)] uppercase">
              Default Project Alpha
            </label>
            <div className="relative">
              <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
              <Input
                placeholder="e.g. Internal Infrastructure"
                className="pl-12 h-14 text-base font-bold bg-[var(--background)] border-[var(--border)] rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                disabled={loading}
              />
            </div>
            <p className="text-[10px] font-bold text-[var(--muted-foreground)] mt-2 px-1 uppercase tracking-tighter opacity-70">
              Projects aggregate your daily logs for focused analysis.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-[11px] font-black uppercase tracking-[0.2em] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-black/10"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : 'Finalize Deployment'}
          </Button>
        </form>
      </Card>

      <p className="text-center mt-10 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.1em] opacity-60">
        DockitUp requires a default company and project to start tracking work.
      </p>
    </div>
  )
}
