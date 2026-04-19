import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { pointUpdateSchema } from '@/lib/validations'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const point = await prisma.point.findFirst({
      where: { id: params.id, userId: session!.user.id },
      include: {
        pointTags: { include: { tag: true } },
        day: { select: { id: true, title: true, date: true } },
      },
    })

    if (!point) return errorResponse('Point not found', 404)

    return successResponse({
      ...point,
      tags: point.pointTags.map((pt) => pt.tag),
      pointTags: undefined,
    })
  } catch (error) {
    console.error('Get point error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validation = pointUpdateSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message)
    }

    const point = await prisma.point.findFirst({
      where: { id: params.id, userId: session!.user.id },
    })
    if (!point) return errorResponse('Point not found', 404)

    const { tags, ...data } = validation.data

    await prisma.point.update({
      where: { id: params.id },
      data,
    })

    if (tags !== undefined) {
      await prisma.pointTag.deleteMany({ where: { pointId: params.id } })
      if (tags.length > 0) {
        for (const tagName of tags) {
          const tag = await prisma.tag.upsert({
            where: { name_userId: { name: tagName, userId: session!.user.id } },
            update: {},
            create: { name: tagName, userId: session!.user.id },
          })
          await prisma.pointTag.create({
            data: { pointId: params.id, tagId: tag.id },
          })
        }
      }
    }

    const updated = await prisma.point.findUnique({
      where: { id: params.id },
      include: {
        pointTags: { include: { tag: true } },
        day: { select: { id: true, title: true, date: true } },
      },
    })

    return successResponse({
      ...updated,
      tags: updated?.pointTags.map((pt) => pt.tag) || [],
      pointTags: undefined,
    })
  } catch (error) {
    console.error('Update point error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const point = await prisma.point.findFirst({
      where: { id: params.id, userId: session!.user.id },
    })
    if (!point) return errorResponse('Point not found', 404)

    await prisma.point.delete({ where: { id: params.id } })
    return successResponse({ success: true })
  } catch (error) {
    console.error('Delete point error:', error)
    return errorResponse('Internal server error', 500)
  }
}
