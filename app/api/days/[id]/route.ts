import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { dayUpdateSchema } from '@/lib/validations'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const day = await prisma.day.findFirst({
      where: { id: params.id, userId: session!.user.id },
      include: {
        workBlocks: {
          orderBy: { order: 'asc' },
          include: {
            workBlockTags: { include: { tag: true } },
          },
        },
        points: {
          include: { pointTags: { include: { tag: true } } },
        },
        dayTags: { include: { tag: true } },
        project: { include: { company: true } },
      },
    })

    if (!day) return errorResponse('Day not found', 404)

    // Transform to include tags as flat arrays
    const transformed = {
      ...day,
      workBlocks: day.workBlocks.map((wb) => ({
        ...wb,
        tags: wb.workBlockTags.map((wbt) => wbt.tag),
        workBlockTags: undefined,
      })),
      points: day.points.map((p) => ({
        ...p,
        tags: p.pointTags.map((pt) => pt.tag),
        pointTags: undefined,
      })),
      tags: day.dayTags.map((dt) => dt.tag),
      dayTags: undefined,
    }

    return successResponse(transformed)
  } catch (error) {
    console.error('Get day error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validation = dayUpdateSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message)
    }

    const day = await prisma.day.findFirst({
      where: { id: params.id, userId: session!.user.id },
    })
    if (!day) return errorResponse('Day not found', 404)

    const updated = await prisma.day.update({
      where: { id: params.id },
      data: validation.data,
      include: {
        project: { include: { company: true } },
        _count: { select: { workBlocks: true, points: true } },
      },
    })

    return successResponse(updated)

  } catch (error) {
    console.error('Update day error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const day = await prisma.day.findFirst({
      where: { id: params.id, userId: session!.user.id },
    })
    if (!day) return errorResponse('Day not found', 404)

    await prisma.day.delete({ where: { id: params.id } })
    return successResponse({ success: true })
  } catch (error) {
    console.error('Delete day error:', error)
    return errorResponse('Internal server error', 500)
  }
}
