'use client'

import React, { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { cn, getDurationLabel } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import { format, getWeek, startOfWeek } from 'date-fns'
import type { AnalysisDaily, AnalysisWeekly, AnalysisMonthly } from '@/types'

const PIE_COLORS = ['#000', '#333', '#666', '#999', '#CCC']

export default function AnalysisPage() {
  const [tab, setTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [dailyData, setDailyData] = useState<AnalysisDaily | null>(null)
  const [weeklyData, setWeeklyData] = useState<AnalysisWeekly | null>(null)
  const [monthlyData, setMonthlyData] = useState<AnalysisMonthly | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedWeek, setSelectedWeek] = useState(getWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    setLoading(true)
    if (tab === 'daily') {
      fetch(`/api/analysis/daily?date=${selectedDate}`)
        .then(r => r.json()).then(setDailyData).finally(() => setLoading(false))
    } else if (tab === 'weekly') {
      fetch(`/api/analysis/weekly?year=${selectedYear}&week=${selectedWeek}`)
        .then(r => r.json()).then(setWeeklyData).finally(() => setLoading(false))
    } else {
      fetch(`/api/analysis/monthly?year=${selectedYear}&month=${selectedMonth}`)
        .then(r => r.json()).then(setMonthlyData).finally(() => setLoading(false))
    }
  }, [tab, selectedDate, selectedYear, selectedWeek, selectedMonth])

  return (
    <PageWrapper>
      {/* Tab bar */}
      <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] p-1 rounded-xl w-fit mb-10 shadow-sm transition-colors">
        {(['daily', 'weekly', 'monthly'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all duration-300',
              tab === t 
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl shadow-black/10' 
                : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : tab === 'daily' && dailyData ? (
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-6">
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-sm" 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-8 text-center border-[var(--border)] group hover:scale-[1.02] transition-transform">
              <p className="text-3xl font-black text-[var(--foreground)] tracking-tight">{getDurationLabel(dailyData.totalDuration)}</p>
              <p className="text-[10px] font-black text-[var(--muted)] mt-2 uppercase tracking-[0.15em] opacity-60">Time Logged</p>
            </Card>
            <Card className="p-8 text-center border-[var(--border)] group hover:scale-[1.02] transition-transform">
              <p className="text-3xl font-black text-[var(--foreground)] tracking-tight">{dailyData.workBlocks.length}</p>
              <p className="text-[10px] font-black text-[var(--muted)] mt-2 uppercase tracking-[0.15em] opacity-60">Work Blocks</p>
            </Card>
            <Card className="p-8 text-center border-[var(--border)] group hover:scale-[1.02] transition-transform">
              <p className="text-3xl font-black text-[var(--foreground)] tracking-tight">{dailyData.points.length}</p>
              <p className="text-[10px] font-black text-[var(--muted)] mt-2 uppercase tracking-[0.15em] opacity-60">Points Earned</p>
            </Card>
          </div>
          <Card className="p-12 text-center border-[var(--border)] relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-7xl font-black text-[var(--foreground)] tracking-tighter transition-all group-hover:scale-110 duration-500">
                {dailyData.productivityScore}
              </p>
              <p className="text-[10px] font-black text-[var(--muted)] mt-4 uppercase tracking-[0.3em] opacity-80">Productivity Score Index</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-900/[0.02] dark:to-white/[0.02] pointer-events-none" />
          </Card>
          
          {dailyData.workBlocks.length > 0 && (
            <Card className="p-8 border-[var(--border)]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] mb-8">Work Dynamics Breakdown</h3>
              <ResponsiveContainer width="100%" height={Math.max(240, dailyData.workBlocks.length * 50)}>
                <BarChart data={dailyData.workBlocks.map(wb => ({ name: wb.title.slice(0, 20), duration: wb.duration || 0 }))} layout="vertical">
                  <XAxis type="number" stroke="var(--muted)" fontSize={10} tickFormatter={(v) => `${v}m`} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--muted)' }} />
                  <Tooltip 
                    cursor={{ fill: 'var(--surface-hover)', opacity: 0.5 }}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11, fontWeight: 700, color: 'var(--foreground)' }} 
                  />
                  <Bar dataKey="duration" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      ) : tab === 'weekly' && weeklyData ? (
        <div className="space-y-8">
          <div className="flex items-center gap-6 mb-8">
            <button onClick={() => setSelectedWeek(w => w - 1)} className="p-2.5 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all active:scale-90"><ChevronLeft size={20} /></button>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">Fiscal Cycle</span>
              <span className="text-sm font-black tracking-tight text-[var(--foreground)] uppercase">Week {selectedWeek}, {selectedYear}</span>
            </div>
            <button onClick={() => setSelectedWeek(w => w + 1)} className="p-2.5 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all active:scale-90"><ChevronRight size={20} /></button>
          </div>
          
          {/* Heatmap */}
          <Card className="p-8 border-[var(--border)]">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] mb-8">Frequency Heatmap</h3>
            <div className="grid grid-cols-7 gap-4">
              {weeklyData.heatmapData.map(d => (
                <div key={d.date} className="text-center group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3 group-hover:text-[var(--foreground)] transition-colors">{format(new Date(d.date), 'EEE')}</p>
                  <div className={cn('w-full aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300 transform group-hover:scale-110', {
                    'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] opacity-30': d.intensity === 0,
                    'bg-zinc-200 dark:bg-zinc-800 text-[var(--foreground)]': d.intensity === 1,
                    'bg-zinc-500 dark:bg-zinc-400 text-white dark:text-zinc-900': d.intensity === 2,
                    'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl shadow-black/10': d.intensity === 3,
                  })}>
                    {d.count}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center border-[var(--border)]"><p className="text-2xl font-black">{weeklyData.mostProductiveDay}</p><p className="text-[9px] font-black text-[var(--muted)] mt-2 uppercase tracking-widest opacity-60">Peak Day</p></Card>
            <Card className="p-6 text-center border-[var(--border)]"><p className="text-2xl font-black">{weeklyData.totalPoints}</p><p className="text-[9px] font-black text-[var(--muted)] mt-2 uppercase tracking-widest opacity-60">Points</p></Card>
            <Card className="p-6 text-center border-[var(--border)]"><p className="text-2xl font-black">{getDurationLabel(weeklyData.totalDuration)}</p><p className="text-[9px] font-black text-[var(--muted)] mt-2 uppercase tracking-widest opacity-60">Total Clock</p></Card>
            <Card className="p-6 text-center border-[var(--border)]"><p className="text-2xl font-black">{weeklyData.avgBlocksPerDay}</p><p className="text-[9px] font-black text-[var(--muted)] mt-2 uppercase tracking-widest opacity-60">Avg Blocks</p></Card>
          </div>
        </div>
      ) : tab === 'monthly' && monthlyData ? (
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-sm outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{format(new Date(2024, i), 'MMMM')}</option>)}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-sm outline-none"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center border-[var(--border)]"><p className="text-2xl font-black">{monthlyData.totalDays}</p><p className="text-[9px] font-black text-[var(--muted)] mt-2 uppercase tracking-widest opacity-60">Active Days</p></Card>
            <Card className="p-6 text-center border-[var(--border)]"><p className="text-2xl font-black">{monthlyData.totalPoints}</p><p className="text-[9px] font-black text-[var(--muted)] mt-2 uppercase tracking-widest opacity-60">Score Aggregation</p></Card>
            <Card className="p-6 text-center border-[var(--border)]"><p className="text-2xl font-black">{getDurationLabel(monthlyData.avgTimePerDay)}</p><p className="text-[9px] font-black text-[var(--muted)] mt-2 uppercase tracking-widest opacity-60">Avg/Day</p></Card>
            <Card className="p-6 text-center border-[var(--border)]"><p className="text-2xl font-black">{monthlyData.bestStreak}</p><p className="text-[9px] font-black text-[var(--muted)] mt-2 uppercase tracking-widest opacity-60">Max Persistence</p></Card>
          </div>
          {/* Cumulative chart */}
          <Card className="p-8 border-[var(--border)]">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] mb-8">Persistence Velocity</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData.cumulativeDays}>
                <XAxis dataKey="day" stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11, fontWeight: 700, color: 'var(--foreground)' }} 
                />
                <Line type="monotone" dataKey="total" stroke="currentColor" className="text-zinc-900 dark:text-zinc-100" strokeWidth={3} dot={false} animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      ) : (
        <div className="text-center py-32 text-[var(--muted)] text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Zero state: No analytical records found.</div>
      )}
    </PageWrapper>
  )
}
