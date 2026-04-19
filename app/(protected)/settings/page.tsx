'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'
import { Download, Upload, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [changePinOpen, setChangePinOpen] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmNewPin, setConfirmNewPin] = useState('')
  const [changePinLoading, setChangePinLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [fontSize, setFontSize] = useState('medium')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [weekStart, setWeekStart] = useState('monday')

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
    <PageWrapper maxWidth="md">
      <h2 className="text-lg font-semibold mb-8">Settings</h2>

      {/* General */}
      <section className="mb-8">
        <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">General</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Display Name</label>
            <p className="text-sm">{session?.user?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <p className="text-sm text-muted">{session?.user?.email}</p>
          </div>
        </div>
      </section>

      <hr className="border-border mb-8" />

      {/* Security */}
      <section className="mb-8">
        <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">Security</h3>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">PIN Lock</p>
              <p className="text-xs text-muted mt-1">Change your 4-digit PIN</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setChangePinOpen(true)}>
              Change PIN
            </Button>
          </div>
        </Card>
      </section>

      <hr className="border-border mb-8" />

      {/* Appearance */}
      <section className="mb-8">
        <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">Appearance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Font Size</label>
            <div className="flex gap-2">
              {[{ v: 'small', l: 'Small' }, { v: 'medium', l: 'Medium' }, { v: 'large', l: 'Large' }].map(f => (
                <button key={f.v} onClick={() => setFontSize(f.v)} className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-medium border transition-all',
                  fontSize === f.v ? 'bg-black text-white border-black' : 'border-border hover:bg-surface'
                )}>{f.l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date Format</label>
            <div className="flex gap-2">
              {['DD/MM/YYYY', 'MM/DD/YYYY'].map(f => (
                <button key={f} onClick={() => setDateFormat(f)} className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-medium border transition-all',
                  dateFormat === f ? 'bg-black text-white border-black' : 'border-border hover:bg-surface'
                )}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Week Starts On</label>
            <div className="flex gap-2">
              {['monday', 'sunday'].map(w => (
                <button key={w} onClick={() => setWeekStart(w)} className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-medium border transition-all capitalize',
                  weekStart === w ? 'bg-black text-white border-black' : 'border-border hover:bg-surface'
                )}>{w}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="border-border mb-8" />

      {/* Data */}
      <section className="mb-8">
        <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">Data</h3>
        <div className="space-y-3">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Export all data</p>
                <p className="text-xs text-muted mt-1">Download a JSON backup of all your data</p>
              </div>
              <a href="/api/export" download>
                <Button variant="secondary" size="sm"><Download size={14} /> Export</Button>
              </a>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Delete Account</p>
                <p className="text-xs text-muted mt-1">Permanently delete your account and all data</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </Card>
        </div>
      </section>

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
