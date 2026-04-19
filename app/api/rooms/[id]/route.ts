import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { roomSchema } from '@/lib/validations'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const room = await prisma.room.findFirst({
      where: { id: params.id, userId: session!.user.id },
      include: {
        _count: { select: { days: true, points: true } },
      },
    })

    if (!room) return errorResponse('Room not found', 404)
    return successResponse(room)
  } catch (error) {
    console.error('Get room error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validation = roomSchema.partial().safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message)
    }

    const room = await prisma.room.findFirst({
      where: { id: params.id, userId: session!.user.id },
    })
    if (!room) return errorResponse('Room not found', 404)

    const updated = await prisma.room.update({
      where: { id: params.id },
      data: validation.data,
      include: { _count: { select: { days: true, points: true } } },
    })

    return successResponse(updated)
  } catch (error) {
    console.error('Update room error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const room = await prisma.room.findFirst({
      where: { id: params.id, userId: session!.user.id },
    })
    if (!room) return errorResponse('Room not found', 404)

    await prisma.room.delete({ where: { id: params.id } })
    return successResponse({ success: true })
  } catch (error) {
    console.error('Delete room error:', error)
    return errorResponse('Internal server error', 500)
  }
}
