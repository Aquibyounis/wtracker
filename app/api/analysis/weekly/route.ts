import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek, subWeeks, format, eachDayOfInterval } from 'date-fns'

export async function GET(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    const week = parseInt(searchParams.get('week') || '1')

    const jan1 = new Date(year, 0, 1)
    const targetDate = new Date(jan1.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000)
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 })

    const days = await prisma.day.findMany({
      where: {
        userId: session!.user.id,
        date: { gte: weekStart, lte: weekEnd },
      },
      include: {
        workBlocks: { include: { workBlockTags: { include: { tag: true } } } },
        points: true,
      },
    })

    // Heatmap data
    const allDaysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })
    const heatmapData = allDaysInWeek.map((d) => {
      const dayData = days.find((day) => format(new Date(day.date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'))
      const count = dayData ? dayData.points.length + dayData.workBlocks.length : 0
      const intensity = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : 3
      return { date: format(d, 'yyyy-MM-dd'), count, intensity: intensity as 0 | 1 | 2 | 3 }
    })

    const totalDuration = days.reduce((sum, d) =>
      sum + d.workBlocks.reduce((bSum, wb) => bSum + (wb.duration || 0), 0), 0)
    const totalPoints = days.reduce((sum, d) => sum + d.points.length, 0)
    const totalBlocks = days.reduce((sum, d) => sum + d.workBlocks.length, 0)
    const avgBlocksPerDay = days.length > 0 ? Math.round(totalBlocks / days.length * 10) / 10 : 0

    // Most productive day
    let mostProductiveDay = ''
    let maxActivity = 0
    days.forEach((d) => {
      const activity = d.workBlocks.length + d.points.length
      if (activity > maxActivity) {
        maxActivity = activity
        mostProductiveDay = format(new Date(d.date), 'EEEE')
      }
    })

    // Tag breakdown
    const tagMap = new Map<string, number>()
    days.forEach((d) => {
      d.workBlocks.forEach((wb) => {
        wb.workBlockTags.forEach((wbt) => {
          tagMap.set(wbt.tag.name, (tagMap.get(wbt.tag.name) || 0) + 1)
        })
      })
    })
    const tagBreakdown = Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)

    // Comparison with last week
    const lastWeekStart = subWeeks(weekStart, 1)
    const lastWeekEnd = subWeeks(weekEnd, 1)
    const lastWeekDays = await prisma.day.findMany({
      where: {
        userId: session!.user.id,
        date: { gte: lastWeekStart, lte: lastWeekEnd },
      },
      include: {
        workBlocks: true,
        points: true,
      },
    })
    const lastWeekDuration = lastWeekDays.reduce((sum, d) =>
      sum + d.workBlocks.reduce((bSum, wb) => bSum + (wb.duration || 0), 0), 0)
    const lastWeekPoints = lastWeekDays.reduce((sum, d) => sum + d.points.length, 0)

    return successResponse({
      days: days.map((d) => ({ ...d, workBlocks: undefined, points: undefined })),
      heatmapData,
      totalDuration,
      totalPoints,
      totalBlocks,
      avgBlocksPerDay,
      mostProductiveDay: mostProductiveDay || 'N/A',
      tagBreakdown,
      comparisonLastWeek: {
        timeDelta: totalDuration - lastWeekDuration,
        pointsDelta: totalPoints - lastWeekPoints,
      },
    })
  } catch (error) {
    console.error('Weekly analysis error:', error)
    return errorResponse('Internal server error', 500)
  }
}
