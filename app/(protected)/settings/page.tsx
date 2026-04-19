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
import { Download, Trash2, Plus, ExternalLink, Settings2 } from 'lucide-react'
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
  const [editCompanyOpen, setEditCompanyOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<any>(null)
  const [editName, setEditName] = useState('')
  const [editDrive, setEditDrive] = useState('')
  const [editLoading, setEditLoading] = useState(false)

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

  const handleEditCompany = async () => {
    if (!editingCompany) return
    setEditLoading(true)
    try {
      const res = await fetch(`/api/companies/${editingCompany.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, driveLink: editDrive }),
      })
      if (res.ok) {
        toast.success('Company updated')
        setEditCompanyOpen(false)
        fetchCompanies()
      }
    } catch {
      toast.error('Failed to update company')
    } finally {
      setEditLoading(false)
    }
  }

  const openEditModal = (company: any) => {
    setEditingCompany(company)
    setEditName(company.name)
    setEditDrive(company.driveLink || '')
    setEditCompanyOpen(true)
  }

  return (
    <PageWrapper maxWidth="xl">
      <div className="mb-12 pt-4">
        <h2 className="text-4xl font-black text-[var(--foreground)] tracking-tighter leading-none">System Control</h2>
        <p className="text-[var(--muted)] text-[11px] font-black uppercase tracking-[0.4em] mt-3">
          Enterprise Configuration Vault
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-16">

          {/* Companies */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-[0.3em]">
                Workspaces &amp; Nodes
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                onClick={() => router.push('/setup/company')}
              >
                <Plus size={14} className="mr-2" /> Initialize New
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {companies.map((company) => (
                <Card
                  key={company.id}
                  className={cn(
                    'p-8 transition-all duration-300 group h-full flex flex-col justify-between overflow-hidden relative',
                    company.isDefault
                      ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-transparent shadow-xl'
                      : ''
                  )}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className={cn(
                        'text-sm font-black uppercase tracking-tight truncate flex-1',
                        company.isDefault ? 'text-[var(--accent-foreground)]' : 'text-[var(--foreground)]'
                      )}>
                        {company.name}
                      </p>
                      <button 
                        onClick={() => openEditModal(company)}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          company.isDefault ? "hover:bg-white/20 text-white/60" : "hover:bg-black/5 text-muted"
                        )}
                      >
                        <Settings2 size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      {company.isDefault && (
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-white/20 rounded">
                          PRIMARY
                        </span>
                      )}
                      {company.driveLink && (
                        <a 
                          href={company.driveLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] transition-all",
                            company.isDefault ? "text-white/80 hover:text-white" : "text-black/40 hover:text-black"
                          )}
                        >
                          <ExternalLink size={10} /> DRIVE ASSET
                        </a>
                      )}
                    </div>
                    <p className={cn(
                      'text-[9px] font-black uppercase tracking-[0.3em]',
                      company.isDefault ? 'opacity-40' : 'text-[var(--muted)]'
                    )}>
                      NODE CAPACITY: {company._count?.projects || 0} UNITS
                    </p>
                  </div>
                  {!company.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-8 h-10 w-full rounded-xl text-[10px] font-black uppercase tracking-widest"
                      onClick={() => handleSetDefault(company.id)}
                    >
                      Deploy Primary
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </section>

          <div className="h-px bg-[var(--border)]" />

          {/* Security */}
          <section>
            <h3 className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-[0.3em] mb-8">
              Security &amp; Shields
            </h3>
            <Card className="p-8">
              <div className="flex items-center justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">
                    Biometric Passcode
                  </p>
                  <p className="text-[10px] font-black text-[var(--muted)] mt-2 uppercase tracking-widest">
                    Enhanced 4-digit verification sequence
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0"
                  onClick={() => setChangePinOpen(true)}
                >
                  Update Access
                </Button>
              </div>
            </Card>
          </section>

          <div className="h-px bg-[var(--border)]" />

          {/* Data */}
          <section>
            <h3 className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-[0.3em] mb-8">
              Retention &amp; Persistence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Card className="p-8">
                <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">Cold Vault Export</p>
                <p className="text-[10px] font-black text-[var(--muted)] mt-2 uppercase tracking-widest mb-8">
                  Full Activity JSON Payload Capture
                </p>
                <a href="/api/export" download className="block">
                  <Button variant="outline" size="sm" className="h-10 w-full rounded-xl text-[10px] font-black uppercase tracking-widest">
                    <Download size={14} className="mr-2" /> Capture Backup
                  </Button>
                </a>
              </Card>
              <Card className="p-8 border-red-500/20">
                <p className="text-sm font-black text-red-500 uppercase tracking-tight">Terminate Instance</p>
                <p className="text-[10px] font-black text-[var(--muted)] mt-2 uppercase tracking-widest mb-8">
                  Irreversible discard of all workspace data
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  className="h-10 w-full rounded-xl text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={14} className="mr-2" /> Purge Records
                </Button>
              </Card>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-16">
          <section>
            <h3 className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-[0.3em] mb-8">
              Interface Schematics
            </h3>
            <div className="space-y-6">
              <Card className="p-8">
                <label className="block text-[10px] font-black text-[var(--muted)] mb-6 uppercase tracking-[0.2em]">
                  Typography Resolution
                </label>
                <div className="flex flex-col gap-2.5">
                  {[{ v: 'small', l: 'COMPACT' }, { v: 'medium', l: 'STANDARD' }, { v: 'large', l: 'MAX VALUE' }].map(f => (
                    <button
                      key={f.v}
                      onClick={() => setFontSize(f.v)}
                      className={cn(
                        'w-full px-6 py-3.5 rounded-xl text-[10px] font-black border transition-all duration-200 tracking-[0.2em] text-left',
                        fontSize === f.v
                          ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-transparent'
                          : 'bg-[var(--surface-hover)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--border-strong)]'
                      )}
                    >
                      {f.l}
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-8">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-[var(--muted)] mb-4 uppercase tracking-[0.2em]">
                      Temporal Format
                    </label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)] rounded-xl px-4 py-3 text-[10px] font-black focus:border-[var(--border-strong)] outline-none cursor-pointer transition-all uppercase tracking-widest"
                    >
                      <option value="DD/MM/YYYY">DD / MM / YYYY</option>
                      <option value="MM/DD/YYYY">MM / DD / YYYY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[var(--muted)] mb-4 uppercase tracking-[0.2em]">
                      Cycle Delta
                    </label>
                    <select
                      value={weekStart}
                      onChange={(e) => setWeekStart(e.target.value)}
                      className="w-full bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)] rounded-xl px-4 py-3 text-[10px] font-black focus:border-[var(--border-strong)] outline-none cursor-pointer transition-all uppercase tracking-widest"
                    >
                      <option value="monday">Shift Monday</option>
                      <option value="sunday">Shift Sunday</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card className="p-8 text-center border-dashed border-2 shadow-none bg-transparent">
                <p className="text-[10px] font-black text-[var(--muted)] mb-3 uppercase tracking-[0.3em]">System Release</p>
                <p className="text-2xl font-black tracking-tighter">v1.2.4-stable</p>
                <p className="text-[9px] font-black text-[var(--muted)] mt-3 uppercase tracking-tighter">LTS Distribution Enabled</p>
              </Card>
            </div>
          </section>
        </div>
      </div>

      {/* Edit Company Modal */}
      <Modal open={editCompanyOpen} onClose={() => setEditCompanyOpen(false)} title="Intelligence Node Config" size="sm">
        <div className="space-y-6">
          <Input label="Workspace Name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="ENTER COMPANY NAME..." />
          <Input label="Google Drive Asset Link" value={editDrive} onChange={(e) => setEditDrive(e.target.value)} placeholder="https://drive.google.com/..." />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setEditCompanyOpen(false)}>Cancel</Button>
            <Button loading={editLoading} onClick={handleEditCompany}>Synchronize</Button>
          </div>
        </div>
      </Modal>

      {/* Change PIN Modal */}
      <Modal open={changePinOpen} onClose={() => setChangePinOpen(false)} title="Security Protocol Update" size="sm">
        <div className="space-y-6">
          <Input label="Current Access PIN" type="password" maxLength={4} value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" />
          <Input label="New Sequence" type="password" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" />
          <Input label="Verify Sequence" type="password" maxLength={4} value={confirmNewPin} onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setChangePinOpen(false)}>Abort</Button>
            <Button loading={changePinLoading} onClick={async () => {
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
            }}>Update Protocol</Button>
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
