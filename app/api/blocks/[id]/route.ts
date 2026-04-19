import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-helpers'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId, error } = await requireAuth()
  if (error) return error

  try {
    const body = await req.json()
    const blockId = params.id

    // Verify ownership via Day
    const block = await prisma.workBlock.findUnique({
      where: { id: blockId },
      include: { day: true }
    })

    if (!block || block.day.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 404 })
    }

    const updatedBlock = await prisma.workBlock.update({
      where: { id: blockId },
      data: {
        title: body.title,
        body: body.body,
        duration: body.duration,
        timestamp: body.timestamp,
        priority: body.priority,
        order: body.order,
      },
    })

    return NextResponse.json(updatedBlock)
  } catch (err) {
    console.error('[BLOCK_PUT]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId, error } = await requireAuth()
  if (error) return error

  try {
    const blockId = params.id

    // Verify ownership via Day
    const block = await prisma.workBlock.findUnique({
      where: { id: blockId },
      include: { day: true }
    })

    if (!block || block.day.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 404 })
    }

    await prisma.workBlock.delete({
      where: { id: blockId }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[BLOCK_DELETE]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
