'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { registerSchema } from '@/lib/validations'
import toast from 'react-hot-toast'
import { ArrowRight, Lock } from 'lucide-react'

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const validation = registerSchema.safeParse({ name, email, password, confirmPassword })
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 409) {
          setErrors({ email: 'An account with this email already exists' })
        } else {
          toast.error(data.error || 'Registration failed')
        }
        return
      }

      // Auto sign in
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — black brand column */}
      <div className="hidden lg:flex w-[380px] flex-shrink-0 bg-[#0a0a0a] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
            <img src="/logo.png" alt="DockitUp" className="w-5 h-5 object-contain invert" />
          </div>
          <span className="text-[13px] font-black tracking-[0.25em] text-white uppercase">DOCKITUP</span>
        </div>

        <div>
          <p className="text-3xl font-black text-white leading-snug tracking-tight mb-4">
            Start your streak.<br />
            Own your work.
          </p>
          <p className="text-sm text-white/40 font-medium leading-relaxed">
            Create your account and begin tracking your daily progress in seconds.
          </p>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
          © 2025 DockitUp · All rights reserved
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-[var(--background)] px-6 py-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-2xl bg-[var(--accent)] flex items-center justify-center">
              <img src="/logo.png" alt="DockitUp" className="w-5 h-5 object-contain invert" />
            </div>
            <span className="text-[13px] font-black tracking-[0.25em] text-[var(--foreground)] uppercase">DOCKITUP</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)]">Create account</h1>
            <p className="text-[var(--muted)] text-sm font-medium mt-1.5">Set up your workspace in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              helpText="Minimum 8 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />

            <div className="pt-1">
              <Button
                type="submit"
                loading={loading}
                className="w-full h-12 font-black uppercase tracking-widest text-xs"
              >
                Create Account <ArrowRight size={15} className="ml-1" />
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--muted)]">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-[var(--foreground)] font-bold hover:underline underline-offset-4"
              >
                Sign in →
              </Link>
            </p>
          </div>

          {/* Security note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[var(--muted)]">
            <Lock size={12} />
            <p className="text-[11px] font-medium">Your data is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  )
}
