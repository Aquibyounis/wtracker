import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-helpers'

export async function POST(req: Request) {
  const { userId, error } = await requireAuth()
  if (error) return error

  try {
    const { dayId, title, body, duration, timestamp, priority } = await req.json()

    if (!dayId) {
      return NextResponse.json({ error: 'dayId is required' }, { status: 400 })
    }

    // Get the highest order to append to the end
    const lastBlock = await prisma.workBlock.findFirst({
      where: { dayId },
      orderBy: { order: 'desc' },
    })

    const block = await prisma.workBlock.create({
      data: {
        dayId,
        title: title || 'New Task',
        body: body || '',
        duration: duration || 0,
        timestamp: timestamp || '',
        priority: priority || 'normal',
        order: (lastBlock?.order ?? -1) + 1,
      },
    })

    return NextResponse.json(block)
  } catch (err) {
    console.error('[BLOCK_POST]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
