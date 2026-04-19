'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'
import { Download, Upload, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [changePinOpen, setChangePinOpen] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmNewPin, setConfirmNewPin] = useState('')
  const [changePinLoading, setChangePinLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [fontSize, setFontSize] = useState('medium')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [weekStart, setWeekStart] = useState('monday')
  
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies')
      if (res.ok) {
        const data = await res.json()
        setCompanies(data)
      }
    } catch {
      toast.error('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (companyId: string) => {
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })
      if (res.ok) {
        toast.success('Default company updated')
        fetchCompanies()
      }
    } catch {
      toast.error('Failed to set default company')
    }
  }

  const handleChangePin = async () => {
    if (newPin !== confirmNewPin) {
      toast.error("New PINs don't match")
      return
    }
    if (newPin.length !== 4 || currentPin.length !== 4) {
      toast.error('PIN must be 4 digits')
      return
    }
    setChangePinLoading(true)
    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to change PIN')
        return
      }
      toast.success('PIN changed successfully')
      setChangePinOpen(false)
      setCurrentPin('')
      setNewPin('')
      setConfirmNewPin('')
    } catch {
      toast.error('Failed to change PIN')
    } finally {
      setChangePinLoading(false)
    }
  }

  return (
    <PageWrapper maxWidth="xl">
      <div className="mb-10 pt-2">
        <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tighter">System Control</h2>
        <p className="text-[var(--muted)] text-[10px] font-black uppercase tracking-[0.3em] mt-2">Enterprise Configuration Vault</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column - Organizations & Security */}
        <div className="lg:col-span-2 space-y-12">
          {/* Companies & Organization */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.25em]">Workspaces & Nodes</h3>
              <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all" onClick={() => router.push('/setup/company')}>
                <Plus size={14} className="mr-2" /> Initialize New
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {companies.map((company) => (
                <Card key={company.id} className={cn(
                  "p-6 transition-all duration-300 border-[var(--border)] group h-full flex flex-col justify-between",
                  company.isDefault 
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xl shadow-black/10 scale-[1.01]" 
                    : "hover:bg-[var(--surface-hover)] hover:border-[var(--muted-foreground)]/20"
                )}>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-sm font-black uppercase tracking-tight truncate flex-1">{company.name}</p>
                      {company.isDefault && <Badge variant="active" className="bg-white/10 dark:bg-black/10 text-white dark:text-zinc-900 border-none text-[9px] font-black px-2.5">PRIMARY</Badge>}
                    </div>
                    <p className={cn("text-[10px] font-bold uppercase tracking-tighter", company.isDefault ? "text-white/60" : "text-[var(--muted)]")}>
                      Operational Capacity: {company._count?.projects || 0} Projects Active
                    </p>
                  </div>
                  {!company.isDefault && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="mt-6 h-9 w-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border-[var(--border)] hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900"
                      onClick={() => handleSetDefault(company.id)}
                    >
                      Deploy Primary
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </section>

          <div className="h-px bg-[var(--border)] opacity-50" />

          {/* Security */}
          <section>
            <h3 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.25em] mb-8">Security & Shields</h3>
            <Card className="p-6 border-[var(--border)] group hover:bg-[var(--surface-hover)] transition-all">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">Biometric Passcode</p>
                  <p className="text-[10px] font-bold text-[var(--muted)] mt-1.5 uppercase tracking-tighter">System-wide 4-digit verification sequence for protected access</p>
                </div>
                <Button variant="outline" size="sm" className="h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest border-[var(--border)] hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900 transition-all shrink-0" onClick={() => setChangePinOpen(true)}>
                  Update Access
                </Button>
              </div>
            </Card>
          </section>

          <div className="h-px bg-[var(--border)] opacity-50" />
          
          {/* Data */}
          <section>
            <h3 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.25em] mb-8">Retention & Persistence</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-6 border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all group">
                <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">Cold Vault Export</p>
                <p className="text-[10px] font-bold text-[var(--muted)] mt-1.5 uppercase tracking-tighter mb-6">Full Activity JSON Payload Capture</p>
                <a href="/api/export" download className="block">
                  <Button variant="secondary" size="sm" className="h-9 w-full rounded-xl text-[10px] font-black uppercase tracking-widest border-[var(--border)] hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900 transition-all"><Download size={14} className="mr-2" /> Capture Backup</Button>
                </a>
              </Card>
              <Card className="p-6 border-[var(--border)] border-red-500/10 dark:border-red-500/20 hover:bg-red-500/[0.03] transition-all group">
                <p className="text-sm font-black text-red-500 uppercase tracking-tight">Terminate Instance</p>
                <p className="text-[10px] font-bold text-[var(--muted)] mt-1.5 uppercase tracking-tighter mb-6">Irreversible discard of all encrypted workspace data</p>
                <Button variant="ghost" size="sm" className="h-9 w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all border border-transparent hover:border-red-500" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={14} className="mr-2" /> Purge Records
                </Button>
              </Card>
            </div>
          </section>
        </div>

        {/* Right Column - Appearance / Config */}
        <div className="space-y-12">
          {/* Appearance */}
          <section>
            <h3 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.25em] mb-8">Interface Schematics</h3>
            <div className="space-y-8">
              <Card className="p-6 border-[var(--border)] bg-[var(--surface)]">
                <label className="block text-[10px] font-black text-[var(--muted)] mb-5 uppercase tracking-[0.15em]">Typography Resolution</label>
                <div className="flex flex-col gap-2">
                  {[{ v: 'small', l: 'COMPACT' }, { v: 'medium', l: 'STANDARD' }, { v: 'large', l: 'MAX VALUE' }].map(f => (
                    <button key={f.v} onClick={() => setFontSize(f.v)} className={cn(
                      'w-full px-6 py-3 rounded-xl text-[10px] font-black border transition-all duration-300 tracking-widest text-left',
                      fontSize === f.v 
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xl shadow-black/10' 
                        : 'bg-[var(--background)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--muted-foreground)]/50'
                    )}>{f.l}</button>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-[var(--border)] bg-[var(--surface)]">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-[var(--muted)] mb-3 uppercase tracking-[0.15em]">Temporal Format</label>
                    <select 
                      value={dateFormat} 
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-5 py-3 text-xs font-black focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none appearance-none cursor-pointer transition-all uppercase tracking-tighter"
                    >
                      <option value="DD/MM/YYYY">DD / MM / YYYY</option>
                      <option value="MM/DD/YYYY">MM / DD / YYYY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[var(--muted)] mb-3 uppercase tracking-[0.15em]">Cycle Delta</label>
                    <select 
                      value={weekStart} 
                      onChange={(e) => setWeekStart(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-5 py-3 text-xs font-black focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none appearance-none cursor-pointer transition-all uppercase tracking-tighter"
                    >
                      <option value="monday">Shift Monday</option>
                      <option value="sunday">Shift Sunday</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-[var(--border)] bg-[var(--background)] text-center">
                <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-2">Version</p>
                <p className="text-xl font-black text-[var(--foreground)] tracking-tighter">v1.2.4-stable</p>
                <p className="text-[9px] font-bold text-[var(--muted-foreground)] mt-2 uppercase">LTS Distribution Enabled</p>
              </Card>
            </div>
          </section>
        </div>
      </div>


      {/* Change PIN Modal */}
      <Modal open={changePinOpen} onClose={() => setChangePinOpen(false)} title="Change PIN" size="sm">
        <div className="space-y-4">
          <Input label="Current PIN" type="password" maxLength={4} value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" />
          <Input label="New PIN" type="password" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" />
          <Input label="Confirm New PIN" type="password" maxLength={4} value={confirmNewPin} onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setChangePinOpen(false)}>Cancel</Button>
            <Button loading={changePinLoading} onClick={handleChangePin}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => toast.error('Account deletion not implemented in v1')}
        title="Delete Account"
        message="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmLabel="Delete Account"
      />
    </PageWrapper>
  )
}
