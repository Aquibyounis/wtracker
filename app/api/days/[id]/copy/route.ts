import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json().catch(() => ({}))

    const originalDay = await prisma.day.findFirst({
      where: { id: params.id, userId: session!.user.id },
      include: { workBlocks: { orderBy: { order: 'asc' } } },
    })

    if (!originalDay) return errorResponse('Day not found', 404)

    const newDay = await prisma.day.create({
      data: {
        title: body.title || `Copy of ${originalDay.title}`,
        date: body.date ? new Date(body.date) : new Date(),
        status: 'draft',
        userId: session!.user.id,
        projectId: originalDay.projectId,
        workBlocks: {
          create: originalDay.workBlocks.map((wb, i) => ({
            title: wb.title,
            order: i,
            priority: wb.priority,
          })),
        },
      },
      include: {
        workBlocks: { orderBy: { order: 'asc' } },
        _count: { select: { workBlocks: true, points: true } },
      },
    })

    return successResponse(newDay, 201)
  } catch (error) {
    console.error('Copy day error:', error)
    return errorResponse('Internal server error', 500)
  }
}
