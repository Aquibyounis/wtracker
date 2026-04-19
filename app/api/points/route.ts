import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { pointSchema } from '@/lib/validations'

export async function GET(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId')
    const dayId = searchParams.get('dayId')
    const priority = searchParams.get('priority')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'

    const where: Record<string, unknown> = { userId: session!.user.id }
    if (roomId) where.roomId = roomId
    if (dayId) where.dayId = dayId
    if (priority) where.priority = priority
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (tag) {
      where.pointTags = { some: { tag: { name: tag } } }
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' }
    if (sort === 'priority') orderBy = { priority: 'desc' }
    if (sort === 'alphabetical') orderBy = { title: 'asc' }

    const points = await prisma.point.findMany({
      where: where as any,
      orderBy,
      include: {
        pointTags: { include: { tag: true } },
        day: { select: { id: true, title: true, date: true } },
        room: { select: { id: true, name: true } },
      },
    })

    const transformed = points.map((p) => ({
      ...p,
      tags: p.pointTags.map((pt) => pt.tag),
      pointTags: undefined,
    }))

    return successResponse(transformed)
  } catch (error) {
    console.error('Get points error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validation = pointSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message)
    }

    const { title, body: pointBody, priority, colorLabel, dayId, roomId, tags } = validation.data

    const point = await prisma.point.create({
      data: {
        title,
        body: pointBody,
        priority: priority || 'normal',
        colorLabel: colorLabel || 'light',
        userId: session!.user.id,
        dayId: dayId || null,
        roomId: roomId || null,
        pointTags: tags && tags.length > 0 ? {
          create: await Promise.all(
            tags.map(async (tagName) => {
              const tag = await prisma.tag.upsert({
                where: { name_userId: { name: tagName, userId: session!.user.id } },
                update: {},
                create: { name: tagName, userId: session!.user.id },
              })
              return { tagId: tag.id }
            })
          ),
        } : undefined,
      },
      include: {
        pointTags: { include: { tag: true } },
        day: { select: { id: true, title: true, date: true } },
        room: { select: { id: true, name: true } },
      },
    })

    return successResponse({
      ...point,
      tags: point.pointTags.map((pt) => pt.tag),
      pointTags: undefined,
    }, 201)
  } catch (error) {
    console.error('Create point error:', error)
    return errorResponse('Internal server error', 500)
  }
}
