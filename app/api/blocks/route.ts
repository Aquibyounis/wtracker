import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { blockSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validation = blockSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message)
    }

    const { dayId, title, body: blockBody, duration, timestamp, priority, tags } = validation.data

    // Verify day belongs to user
    const day = await prisma.day.findFirst({
      where: { id: dayId, userId: session!.user.id },
    })
    if (!day) return errorResponse('Day not found', 404)

    // Get max order
    const maxBlock = await prisma.workBlock.findFirst({
      where: { dayId },
      orderBy: { order: 'desc' },
    })
    const order = (maxBlock?.order ?? -1) + 1

    const block = await prisma.workBlock.create({
      data: {
        title,
        body: blockBody,
        duration,
        timestamp,
        priority: priority || 'normal',
        order,
        dayId,
        workBlockTags: tags && tags.length > 0 ? {
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
        workBlockTags: { include: { tag: true } },
      },
    })

    return successResponse({
      ...block,
      tags: block.workBlockTags.map((wbt) => wbt.tag),
      workBlockTags: undefined,
    }, 201)
  } catch (error) {
    console.error('Create block error:', error)
    return errorResponse('Internal server error', 500)
  }
}
