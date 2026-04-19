'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  PieChart,
  Pin,
  Flame,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'

// ─── tiny animated counter ───────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0
        const step = Math.ceil(to / 60)
        const timer = setInterval(() => {
          start += step
          if (start >= to) { setCount(to); clearInterval(timer) }
          else setCount(start)
        }, 16)
        observer.disconnect()
      }
    }, { threshold: 0.4 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [to])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const features = [
  {
    icon: CalendarDays,
    title: 'Daily Log Engine',
    desc: 'Log every working day with rich work blocks, notes, and point tracking. Never lose context on what you shipped.',
  },
  {
    icon: Pin,
    title: 'Point System',
    desc: 'Pin important moments, decisions, and achievements as points. Build a living archive of your best work.',
  },
  {
    icon: Briefcase,
    title: 'Project & Client Tracking',
    desc: 'Organize logs under projects and companies. See which clients get the most of your energy at a glance.',
  },
  {
    icon: PieChart,
    title: 'Analytics Dashboard',
    desc: 'Weekly grids, streaks, monthly breakdowns — know your rhythm and identify when you operate at peak output.',
  },
  {
    icon: LayoutDashboard,
    title: 'Unified Workspace',
    desc: 'Everything in one place. No tabs, no spreadsheets, no friction. Your entire work history, instantly accessible.',
  },
  {
    icon: Flame,
    title: 'Streak & Momentum',
    desc: 'Gamified consistency tracking motivates you to log daily. See your current streak and never break the chain.',
  },
]

const steps = [
  { n: '01', title: 'Create your company', desc: 'Set up your workspace with your company or client name in seconds.' },
  { n: '02', title: 'Add a project', desc: 'Organize your logs under projects — one per client or deliverable.' },
  { n: '03', title: 'Log your day', desc: 'Open a day, add work blocks and pin your key points and wins.' },
  { n: '04', title: 'Track your growth', desc: 'Watch streaks build, review weekly grids, and export your data anytime.' },
]

const testimonials = [
  { quote: "Replaced three different apps for me. I log every day now without even thinking about it.", name: 'Ayaan M.', role: 'Freelance Developer' },
  { quote: "The point system is brilliant — I finally have receipts for everything I accomplished this quarter.", name: 'Priya S.', role: 'Product Designer' },
  { quote: "My daily standups became effortless once I started using DockitUp the night before.", name: 'Omar K.', role: 'Engineering Lead' },
]

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f4f5f6] text-[#0a0a0a] font-sans overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16 bg-[#f4f5f6]/90 backdrop-blur-md border-b border-black/[0.06]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0a0a0a] flex items-center justify-center">
            <img src="/logo.png" alt="DockitUp" className="w-4 h-4 object-contain invert" />
          </div>
          <span className="text-[13px] font-black tracking-[0.25em] uppercase">DOCKITUP</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-xs font-black uppercase tracking-widest text-[#0a0a0a]/50 hover:text-[#0a0a0a] transition-colors">Features</a>
          <a href="#how" className="text-xs font-black uppercase tracking-widest text-[#0a0a0a]/50 hover:text-[#0a0a0a] transition-colors">How it works</a>
          <a href="#testimonials" className="text-xs font-black uppercase tracking-widest text-[#0a0a0a]/50 hover:text-[#0a0a0a] transition-colors">Reviews</a>
          <Link href="/auth/login" className="text-xs font-black uppercase tracking-widest text-[#0a0a0a]/50 hover:text-[#0a0a0a] transition-colors">Sign In</Link>
          <Link href="/auth/register" className="bg-[#0a0a0a] text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-black/80 transition-all active:scale-95">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#f4f5f6] pt-16 flex flex-col items-center justify-center gap-8">
          {[['#features','Features'],['#how','How it works'],['#testimonials','Reviews']].map(([h,l]) => (
            <a key={h} href={h} onClick={() => setMobileOpen(false)} className="text-2xl font-black uppercase tracking-widest">{l}</a>
          ))}
          <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="text-2xl font-black uppercase tracking-widest opacity-50">Sign In</Link>
          <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="mt-4 bg-[#0a0a0a] text-white text-sm font-black uppercase tracking-widest px-8 py-4 rounded-2xl">
            Get Started →
          </Link>
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white text-[10px] font-black uppercase tracking-[0.25em] px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free to use · No credit card required
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-center leading-[0.95] max-w-5xl mx-auto">
          Your Work.<br />
          <span className="relative inline-block">
            <span className="relative z-10">Logged.</span>
            <span className="absolute bottom-1 left-0 right-0 h-4 bg-[#0a0a0a]/10 -rotate-1 rounded" />
          </span>{' '}
          <span className="text-[#0a0a0a]/20">Every Day.</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-[#0a0a0a]/50 font-medium text-center max-w-2xl mx-auto leading-relaxed">
          DockitUp is the daily work tracker built for professionals who care about shipping. Log days, pin wins, track streaks — all in one ruthlessly minimal workspace.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 bg-[#0a0a0a] text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-black/80 transition-all active:scale-[0.97] shadow-xl shadow-black/10"
          >
            Start For Free <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 bg-white text-[#0a0a0a] font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl border border-black/10 hover:border-black/30 transition-all active:scale-[0.97]"
          >
            Sign In <ChevronRight size={16} />
          </Link>
        </div>

        {/* Social proof strip */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-[#0a0a0a]/30">
          {['No Spreadsheets', 'No Google Docs', 'No Context Loss'].map((t, i) => (
            <React.Fragment key={t}>
              <span>{t}</span>
              {i < 2 && <span className="w-1 h-1 rounded-full bg-[#0a0a0a]/20" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── MOCK APP PREVIEW ────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 max-w-6xl mx-auto mb-28">
        <div className="bg-[#0a0a0a] rounded-[2rem] p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.35)] overflow-hidden">
          {/* Fake window bar */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="ml-auto text-[10px] font-black uppercase tracking-widest text-white/20">dockitup.app</div>
          </div>
          {/* Fake dashboard UI */}
          <div className="grid grid-cols-4 gap-4">
            {/* Sidebar mockup */}
            <div className="col-span-1 bg-white/5 rounded-2xl p-4 flex flex-col gap-3">
              <div className="w-full h-2 bg-white/20 rounded-full" />
              {[80,60,90,50,70].map((w,i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-lg bg-white/10 flex-shrink-0" />
                  <div className="h-2 bg-white/10 rounded-full" style={{ width: `${w}%` }} />
                </div>
              ))}
              <div className="mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/20" />
                  <div className="flex-1">
                    <div className="h-2 bg-white/20 rounded-full w-3/4 mb-1" />
                    <div className="h-1.5 bg-white/10 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            </div>
            {/* Main content */}
            <div className="col-span-3 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3">
                {['142', '38', '12', '29'].map((v, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-4">
                    <p className="text-2xl font-black text-white leading-none">{v}</p>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest mt-2 font-black">
                      {['Days Logged','Points','Streak','This Mo.'][i]}
                    </p>
                  </div>
                ))}
              </div>
              {/* Today card */}
              <div className="bg-white/5 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xl font-black text-white">Sunday</p>
                  <p className="text-xs text-white/30 font-black uppercase tracking-widest mt-1">20 April 2025</p>
                </div>
                <div className="bg-white text-[#0a0a0a] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">
                  Open Workspace →
                </div>
              </div>
              {/* Weekly grid */}
              <div className="grid grid-cols-7 gap-2">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className={`rounded-xl p-2 text-center ${i < 5 ? 'bg-white/10' : 'bg-white/4'}`}>
                    <p className="text-[8px] font-black text-white/30 uppercase">{d}</p>
                    <p className="text-base font-black text-white mt-1">{14+i}</p>
                    <div className={`mx-auto mt-2 w-1.5 h-1.5 rounded-full ${i < 5 ? 'bg-emerald-400' : 'bg-white/10'}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────────── */}
      <section className="border-y border-black/[0.06] bg-white py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: 1200, suffix: '+', label: 'Days Logged' },
            { val: 98, suffix: '%', label: 'Retention Rate' },
            { val: 340, suffix: '+', label: 'Active Users' },
            { val: 5, suffix: 'min', label: 'Avg. Daily Log Time' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-black tracking-tighter leading-none">
                <Counter to={s.val} suffix={s.suffix} />
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0a0a0a]/40 mt-3">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0a0a0a]/30 mb-4">Everything you need</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Built for daily discipline.</h2>
          <p className="mt-4 text-[#0a0a0a]/50 font-medium max-w-lg mx-auto">
            Six focused tools, one unified workspace. No bloat, no distractions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="group bg-white border border-black/[0.06] rounded-2xl p-8 hover:border-black/30 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-default"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#0a0a0a] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-base font-black tracking-tight mb-2">{f.title}</h3>
                <p className="text-sm text-[#0a0a0a]/50 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" className="py-28 bg-[#0a0a0a] px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">The flow</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Up and running in 60 seconds.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-white/10 z-0" style={{ width: 'calc(100% - 3rem)' }} />
                )}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative z-10 hover:bg-white/8 transition-all">
                  <p className="text-4xl font-black text-white/10 mb-4 leading-none">{s.n}</p>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2">{s.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-28 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0a0a0a]/30 mb-4">Real users</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Loved by people who ship.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-black/[0.06] rounded-2xl p-8 hover:shadow-xl hover:shadow-black/5 hover:border-black/20 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[1,2,3,4,5].map(s => (
                  <div key={s} className="w-4 h-4 rounded bg-[#0a0a0a] opacity-80" />
                ))}
              </div>
              <p className="text-sm font-medium text-[#0a0a0a]/70 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-6 border-t border-black/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-[#0a0a0a] flex items-center justify-center text-white text-xs font-black">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-black">{t.name}</p>
                  <p className="text-[10px] text-[#0a0a0a]/40 font-medium uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE COMPARISON ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="bg-[#0a0a0a] rounded-[2rem] p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 text-center">vs. the alternatives</p>
          <h2 className="text-3xl font-black tracking-tighter text-white text-center mb-10">Why not Google Sheets?</h2>
          <div className="space-y-3">
            {[
              ['Built-in streak tracking', true, false],
              ['Point & achievement pins', true, false],
              ['Project & client grouping', true, false],
              ['Instant analytics dashboard', true, false],
              ['Daily log templates', true, false],
              ['Designed for daily use', true, false],
            ].map(([feat, dock, sheet]) => (
              <div key={String(feat)} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <span className="text-sm font-medium text-white/60">{String(feat)}</span>
                <div className="flex items-center gap-12">
                  <CheckCircle2 size={18} className={dock ? 'text-emerald-400' : 'text-white/10'} />
                  <span className={`text-sm font-black ${sheet ? 'text-white/50' : 'text-white/20 line-through'}`}>
                    {sheet ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4">
              <span className="invisible">x</span>
              <div className="flex items-center gap-8">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">DockitUp</span>
                <span className="text-xs font-black uppercase tracking-widest text-white/20">Google Sheets</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 lg:px-12 max-w-4xl mx-auto text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0a0a0a]/30 mb-6">Start now</p>
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-6">
          Stop losing track<br />of your best work.
        </h2>
        <p className="text-[#0a0a0a]/50 font-medium text-lg max-w-md mx-auto mb-10">
          Join hundreds of professionals who log daily with DockitUp. Free forever.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 bg-[#0a0a0a] text-white font-black text-sm uppercase tracking-widest px-10 py-5 rounded-2xl hover:bg-black/80 transition-all active:scale-[0.97] shadow-2xl shadow-black/20"
          >
            Create Free Account <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth/login"
            className="text-xs font-black uppercase tracking-widest text-[#0a0a0a]/40 hover:text-[#0a0a0a] transition-colors"
          >
            Already have one? Sign in →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-black/[0.06] bg-white py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#0a0a0a] flex items-center justify-center">
              <img src="/logo.png" alt="DockitUp" className="w-4 h-4 object-contain invert" />
            </div>
            <span className="text-[12px] font-black tracking-[0.25em] uppercase text-[#0a0a0a]">DOCKITUP</span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-[#0a0a0a]/20">
            © 2025 DockitUp · Built for daily discipline
          </p>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-[11px] font-black uppercase tracking-widest text-[#0a0a0a]/30 hover:text-[#0a0a0a] transition-colors">Sign In</Link>
            <Link href="/auth/register" className="text-[11px] font-black uppercase tracking-widest text-[#0a0a0a]/30 hover:text-[#0a0a0a] transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
