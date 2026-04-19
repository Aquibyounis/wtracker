import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

export async function GET(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const date = parseISO(dateStr)

    const day = await prisma.day.findFirst({
      where: {
        userId: session!.user.id,
        date: { gte: startOfDay(date), lte: endOfDay(date) },
      },
      include: {
        workBlocks: {
          orderBy: { order: 'asc' },
          include: { workBlockTags: { include: { tag: true } } },
        },
        points: true,
      },
    })

    const workBlocks = day?.workBlocks || []
    const points = day?.points || []
    const totalDuration = workBlocks.reduce((sum, wb) => sum + (wb.duration || 0), 0)

    // Tag breakdown
    const tagMap = new Map<string, number>()
    workBlocks.forEach((wb) => {
      wb.workBlockTags.forEach((wbt) => {
        tagMap.set(wbt.tag.name, (tagMap.get(wbt.tag.name) || 0) + 1)
      })
    })
    const tagBreakdown = Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)

    // Productivity score
    const completionFactor = day?.status === 'completed' ? 1.0 : day?.status === 'active' ? 0.6 : 0.2
    const productivityScore = Math.round(
      (workBlocks.length * Math.max(points.length, 1) * completionFactor * 10) / 10
    )

    return successResponse({
      day: day ? { ...day, workBlocks: undefined, points: undefined } : null,
      workBlocks: workBlocks.map((wb) => ({
        ...wb,
        tags: wb.workBlockTags.map((wbt) => wbt.tag),
        workBlockTags: undefined,
      })),
      points,
      totalDuration,
      tagBreakdown,
      productivityScore: Math.min(productivityScore, 100),
    })
  } catch (error) {
    console.error('Daily analysis error:', error)
    return errorResponse('Internal server error', 500)
  }
}
