import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { daySchema } from '@/lib/validations'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, parseISO } from 'date-fns'

export async function GET(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId')
    const month = searchParams.get('month') // YYYY-MM
    const week = searchParams.get('week') // YYYY-WW
    const sort = searchParams.get('sort') || 'newest'
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { userId: session!.user.id }
    if (roomId) where.roomId = roomId
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (month) {
      const date = parseISO(`${month}-01`)
      where.date = { gte: startOfMonth(date), lte: endOfMonth(date) }
    } else if (week) {
      const [year, weekNum] = week.split('-W').map(Number)
      const jan1 = new Date(year, 0, 1)
      const targetDate = new Date(jan1.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000)
      where.date = {
        gte: startOfWeek(targetDate, { weekStartsOn: 1 }),
        lte: endOfWeek(targetDate, { weekStartsOn: 1 }),
      }
    }

    let orderBy: Record<string, string> = { date: 'desc' }
    if (sort === 'oldest') orderBy = { date: 'asc' }

    const days = await prisma.day.findMany({
      where: where as any,
      orderBy,
      include: {
        room: { select: { id: true, name: true, icon: true } },
        _count: { select: { workBlocks: true, points: true } },
      },
    })

    return successResponse(days)
  } catch (error) {
    console.error('Get days error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validation = daySchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message)
    }

    const { title, date, roomId, status: dayStatus, templateType } = validation.data

    // Template blocks
    const templateBlocks: { title: string; order: number }[] = []
    if (templateType === 'standup') {
      templateBlocks.push(
        { title: 'Yesterday', order: 0 },
        { title: 'Today', order: 1 },
        { title: 'Blockers', order: 2 }
      )
    } else if (templateType === 'sprint') {
      templateBlocks.push(
        { title: 'Planning', order: 0 },
        { title: 'Development', order: 1 },
        { title: 'Review', order: 2 },
        { title: 'Retrospective', order: 3 }
      )
    } else if (templateType === 'deepwork') {
      templateBlocks.push(
        { title: 'Focus Session 1', order: 0 },
        { title: 'Focus Session 2', order: 1 },
        { title: 'Review', order: 2 }
      )
    }

    const day = await prisma.day.create({
      data: {
        title,
        date: new Date(date),
        status: dayStatus || 'draft',
        userId: session!.user.id,
        roomId: roomId || null,
        workBlocks: templateBlocks.length > 0 ? {
          create: templateBlocks,
        } : undefined,
      },
      include: {
        workBlocks: { orderBy: { order: 'asc' } },
        room: { select: { id: true, name: true, icon: true } },
        _count: { select: { workBlocks: true, points: true } },
      },
    })

    return successResponse(day, 201)
  } catch (error) {
    console.error('Create day error:', error)
    return errorResponse('Internal server error', 500)
  }
}
