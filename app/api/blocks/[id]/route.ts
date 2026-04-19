import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { blockUpdateSchema } from '@/lib/validations'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validation = blockUpdateSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message)
    }

    const { tags, ...data } = validation.data

    // Verify ownership through day
    const block = await prisma.workBlock.findFirst({
      where: { id: params.id },
      include: { day: { select: { userId: true } } },
    })
    if (!block || block.day.userId !== session!.user.id) {
      return errorResponse('Block not found', 404)
    }

    // Update block
    const updated = await prisma.workBlock.update({
      where: { id: params.id },
      data,
    })

    // Update tags if provided
    if (tags !== undefined) {
      // Remove old tags
      await prisma.workBlockTag.deleteMany({ where: { workBlockId: params.id } })

      // Add new tags
      if (tags.length > 0) {
        for (const tagName of tags) {
          const tag = await prisma.tag.upsert({
            where: { name_userId: { name: tagName, userId: session!.user.id } },
            update: {},
            create: { name: tagName, userId: session!.user.id },
          })
          await prisma.workBlockTag.create({
            data: { workBlockId: params.id, tagId: tag.id },
          })
        }
      }
    }

    const result = await prisma.workBlock.findUnique({
      where: { id: params.id },
      include: { workBlockTags: { include: { tag: true } } },
    })

    return successResponse({
      ...result,
      tags: result?.workBlockTags.map((wbt) => wbt.tag) || [],
      workBlockTags: undefined,
    })
  } catch (error) {
    console.error('Update block error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const block = await prisma.workBlock.findFirst({
      where: { id: params.id },
      include: { day: { select: { userId: true } } },
    })
    if (!block || block.day.userId !== session!.user.id) {
      return errorResponse('Block not found', 404)
    }

    await prisma.workBlock.delete({ where: { id: params.id } })
    return successResponse({ success: true })
  } catch (error) {
    console.error('Delete block error:', error)
    return errorResponse('Internal server error', 500)
  }
}
