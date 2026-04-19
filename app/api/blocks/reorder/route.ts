import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-helpers'

export async function PUT(req: Request) {
  const { userId, error } = await requireAuth()
  if (error) return error

  try {
    const { orderedIds } = await req.json()

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds array is required' }, { status: 400 })
    }

    // Perform batch updates for the order
    const updates = orderedIds.map((id, index) => {
      return prisma.workBlock.update({
        where: { id },
        data: { order: index },
      })
    })

    await prisma.$transaction(updates)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[BLOCK_REORDER_PUT]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
