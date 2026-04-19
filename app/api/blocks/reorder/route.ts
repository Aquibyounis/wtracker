import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { reorderSchema } from '@/lib/validations'

export async function PUT(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validation = reorderSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message)
    }

    const { dayId, orderedIds } = validation.data

    // Verify ownership
    const day = await prisma.day.findFirst({
      where: { id: dayId, userId: session!.user.id },
    })
    if (!day) return errorResponse('Day not found', 404)

    // Update order in transaction
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.workBlock.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    return successResponse({ success: true })
  } catch (error) {
    console.error('Reorder blocks error:', error)
    return errorResponse('Internal server error', 500)
  }
}
