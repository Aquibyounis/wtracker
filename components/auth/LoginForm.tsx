'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { loginSchema } from '@/lib/validations'
import toast from 'react-hot-toast'
import { ArrowRight, Lock } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const validation = loginSchema.safeParse({ email, password })
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
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setErrors({ email: 'Invalid email or password' })
      } else {
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
            Track every day.<br />
            Ship with clarity.
          </p>
          <p className="text-sm text-white/40 font-medium leading-relaxed">
            Your workspace for logging progress, pinning points, and staying accountable — daily.
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
              <img src="/logo.png" alt="DockitUp" className="w-5 h-5 object-contain" style={{ filter: 'invert(var(--logo-invert, 1))' }} />
            </div>
            <span className="text-[13px] font-black tracking-[0.25em] text-[var(--foreground)] uppercase">DOCKITUP</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)]">Welcome back</h1>
            <p className="text-[var(--muted)] text-sm font-medium mt-1.5">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full h-12 font-black uppercase tracking-widest text-xs"
            >
              Sign In <ArrowRight size={15} className="ml-1" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--muted)]">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="text-[var(--foreground)] font-bold hover:underline underline-offset-4"
              >
                Create one →
              </Link>
            </p>
          </div>

          {/* Security note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[var(--muted)]">
            <Lock size={12} />
            <p className="text-[11px] font-medium">Secured with encrypted credentials</p>
          </div>
        </div>
      </div>
    </div>
  )
}
