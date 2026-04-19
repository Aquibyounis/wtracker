import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns'

export async function GET(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))

    const monthStart = startOfMonth(new Date(year, month - 1))
    const monthEnd = endOfMonth(new Date(year, month - 1))

    const days = await prisma.day.findMany({
      where: {
        userId: session!.user.id,
        date: { gte: monthStart, lte: monthEnd },
      },
      include: {
        workBlocks: { include: { workBlockTags: { include: { tag: true } } } },
        points: true,
        project: { select: { name: true } },
      },
    })

    // Calendar data
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const calendarData = allDays.map((d) => {
      const dayData = days.find((day) => format(new Date(day.date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'))
      const count = dayData ? dayData.points.length + dayData.workBlocks.length : 0
      const intensity = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : 3
      return { date: format(d, 'yyyy-MM-dd'), count, intensity: intensity as 0 | 1 | 2 | 3 }
    })

    // Cumulative days
    let cumTotal = 0
    const cumulativeDays = allDays.map((d) => {
      const hasDay = days.some((day) => format(new Date(day.date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'))
      if (hasDay) cumTotal++
      return { day: parseInt(format(d, 'd')), total: cumTotal }
    })

    const totalDays = days.length
    const totalPoints = days.reduce((sum, d) => sum + d.points.length, 0)
    const totalDuration = days.reduce((sum, d) =>
      sum + d.workBlocks.reduce((bSum, wb) => bSum + (wb.duration || 0), 0), 0)
    const avgTimePerDay = totalDays > 0 ? Math.round(totalDuration / totalDays) : 0

    // Best streak
    let bestStreak = 0
    let currentStreak = 0
    const dayDates = new Set(days.map((d) => format(new Date(d.date), 'yyyy-MM-dd')))
    allDays.forEach((d) => {
      if (dayDates.has(format(d, 'yyyy-MM-dd'))) {
        currentStreak++
        bestStreak = Math.max(bestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    })

    // Top tags
    const tagMap = new Map<string, number>()
    days.forEach((d) => {
      d.workBlocks.forEach((wb) => {
        wb.workBlockTags.forEach((wbt) => {
          tagMap.set(wbt.tag.name, (tagMap.get(wbt.tag.name) || 0) + 1)
        })
      })
    })
    const topTags = Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Project breakdown
    const roomMap = new Map<string, { days: number; points: number; totalTime: number }>()
    days.forEach((d) => {
      const roomName = (d as any).project?.name || 'No Project'
      const existing = roomMap.get(roomName) || { days: 0, points: 0, totalTime: 0 }
      existing.days++
      existing.points += d.points.length
      existing.totalTime += d.workBlocks.reduce((sum, wb) => sum + (wb.duration || 0), 0)
      roomMap.set(roomName, existing)
    })
    const roomBreakdown = Array.from(roomMap.entries()).map(([room, data]) => ({
      room,
      days: data.days,
      points: data.points,
      avgTime: data.days > 0 ? Math.round(data.totalTime / data.days) : 0,
    }))

    return successResponse({
      calendarData,
      cumulativeDays,
      totalDays,
      totalPoints,
      avgTimePerDay,
      bestStreak,
      topTags,
      roomBreakdown,
    })
  } catch (error) {
    console.error('Monthly analysis error:', error)
    return errorResponse('Internal server error', 500)
  }
}
