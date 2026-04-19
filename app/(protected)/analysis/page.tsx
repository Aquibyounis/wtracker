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
      <div className="flex gap-1 border border-border rounded-md w-fit mb-8">
        {(['daily', 'weekly', 'monthly'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2 text-sm font-medium transition-all duration-150',
              tab === t ? 'bg-black text-white' : 'text-muted hover:text-black'
            )}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : tab === 'daily' && dailyData ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-black" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-5 text-center">
              <p className="text-2xl font-bold">{getDurationLabel(dailyData.totalDuration)}</p>
              <p className="text-xs text-muted mt-1">Time Logged</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-2xl font-bold">{dailyData.workBlocks.length}</p>
              <p className="text-xs text-muted mt-1">Blocks</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-2xl font-bold">{dailyData.points.length}</p>
              <p className="text-xs text-muted mt-1">Points</p>
            </Card>
          </div>
          <Card className="p-6 text-center">
            <p className="text-5xl font-bold">{dailyData.productivityScore}</p>
            <p className="text-xs text-muted mt-2">Productivity Score</p>
          </Card>
          {dailyData.workBlocks.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Work Blocks</h3>
              <ResponsiveContainer width="100%" height={Math.max(200, dailyData.workBlocks.length * 40)}>
                <BarChart data={dailyData.workBlocks.map(wb => ({ name: wb.title.slice(0, 20), duration: wb.duration || 0 }))} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => [`${v}m`, 'Duration']} contentStyle={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="duration" fill="#000" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
          {dailyData.tagBreakdown.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-3">Tags Used</h3>
              <div className="flex flex-wrap gap-2">
                {dailyData.tagBreakdown.map(t => (
                  <span key={t.tag} className="text-xs bg-surface px-2.5 py-1 rounded-full">{t.tag} ({t.count})</span>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : tab === 'weekly' && weeklyData ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setSelectedWeek(w => w - 1)} className="p-1.5 rounded-md text-muted hover:text-black hover:bg-surface"><ChevronLeft size={18} /></button>
            <span className="text-sm font-medium">Week {selectedWeek}, {selectedYear}</span>
            <button onClick={() => setSelectedWeek(w => w + 1)} className="p-1.5 rounded-md text-muted hover:text-black hover:bg-surface"><ChevronRight size={18} /></button>
          </div>
          {/* Heatmap */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4">Activity Heatmap</h3>
            <div className="grid grid-cols-7 gap-3">
              {weeklyData.heatmapData.map(d => (
                <div key={d.date} className="text-center">
                  <p className="text-label text-muted mb-1">{format(new Date(d.date), 'EEE')}</p>
                  <div className={cn('w-full aspect-square rounded-md flex items-center justify-center text-sm font-medium', {
                    'bg-white border border-border text-muted': d.intensity === 0,
                    'bg-[#E0E0E0]': d.intensity === 1,
                    'bg-[#888] text-white': d.intensity === 2,
                    'bg-black text-white': d.intensity === 3,
                  })}>
                    {d.count}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 text-center"><p className="text-2xl font-bold">{weeklyData.mostProductiveDay}</p><p className="text-xs text-muted mt-1">Most Productive</p></Card>
            <Card className="p-5 text-center"><p className="text-2xl font-bold">{weeklyData.totalPoints}</p><p className="text-xs text-muted mt-1">Total Points</p></Card>
            <Card className="p-5 text-center"><p className="text-2xl font-bold">{getDurationLabel(weeklyData.totalDuration)}</p><p className="text-xs text-muted mt-1">Total Time</p></Card>
            <Card className="p-5 text-center"><p className="text-2xl font-bold">{weeklyData.avgBlocksPerDay}</p><p className="text-xs text-muted mt-1">Avg Blocks/Day</p></Card>
          </div>
          {weeklyData.tagBreakdown.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Tag Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={weeklyData.tagBreakdown.map(t => ({ name: t.tag, value: t.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {weeklyData.tagBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      ) : tab === 'monthly' && monthlyData ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-black bg-white">
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{format(new Date(2024, i), 'MMMM')}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-black bg-white">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 text-center"><p className="text-2xl font-bold">{monthlyData.totalDays}</p><p className="text-xs text-muted mt-1">Days Logged</p></Card>
            <Card className="p-5 text-center"><p className="text-2xl font-bold">{monthlyData.totalPoints}</p><p className="text-xs text-muted mt-1">Total Points</p></Card>
            <Card className="p-5 text-center"><p className="text-2xl font-bold">{getDurationLabel(monthlyData.avgTimePerDay)}</p><p className="text-xs text-muted mt-1">Avg Time/Day</p></Card>
            <Card className="p-5 text-center"><p className="text-2xl font-bold">{monthlyData.bestStreak}</p><p className="text-xs text-muted mt-1">Best Streak</p></Card>
          </div>
          {/* Cumulative chart */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4">Cumulative Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData.cumulativeDays}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 12 }} />
                <Line type="monotone" dataKey="total" stroke="#000" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          {monthlyData.topTags.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Top Tags</h3>
              <ResponsiveContainer width="100%" height={Math.max(150, monthlyData.topTags.length * 32)}>
                <BarChart data={monthlyData.topTags.map(t => ({ name: t.tag, count: t.count }))} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#000" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
          {monthlyData.roomBreakdown.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Room Breakdown</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left py-2 text-xs text-muted uppercase">Room</th>
                  <th className="text-left py-2 text-xs text-muted uppercase">Days</th>
                  <th className="text-left py-2 text-xs text-muted uppercase">Points</th>
                  <th className="text-left py-2 text-xs text-muted uppercase">Avg Time</th>
                </tr></thead>
                <tbody>{monthlyData.roomBreakdown.map(r => (
                  <tr key={r.room} className="border-b border-border">
                    <td className="py-2 font-medium">{r.room}</td>
                    <td className="py-2 text-muted">{r.days}</td>
                    <td className="py-2 text-muted">{r.points}</td>
                    <td className="py-2 text-muted">{getDurationLabel(r.avgTime)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-muted text-sm">No data available.</div>
      )}
    </PageWrapper>
  )
}
