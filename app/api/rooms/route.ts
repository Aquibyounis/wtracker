import { NextResponse } from 'next/server'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { roomSchema } from '@/lib/validations'

export async function GET() {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const rooms = await prisma.room.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { days: true, points: true } },
      },
    })

    return successResponse(rooms)
  } catch (error) {
    console.error('Get rooms error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validation = roomSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message)
    }

    const room = await prisma.room.create({
      data: {
        ...validation.data,
        userId: session!.user.id,
      },
      include: {
        _count: { select: { days: true, points: true } },
      },
    })

    return successResponse(room, 201)
  } catch (error) {
    console.error('Create room error:', error)
    return errorResponse('Internal server error', 500)
  }
}
