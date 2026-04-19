import { requireAuth, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session!.user.id

    const [user, companies, days, points, tags] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      prisma.company.findMany({ where: { userId } }),
      prisma.day.findMany({
        where: { userId },
        include: {
          workBlocks: { include: { workBlockTags: { include: { tag: true } } } },
        },
      }),
      prisma.point.findMany({
        where: { userId },
        include: { pointTags: { include: { tag: true } } },
      }),
      prisma.tag.findMany({ where: { userId } }),
    ])

    const exportData = {
      exportDate: new Date().toISOString(),
      user,
      companies,
      days: days.map((d) => ({
        ...d,
        workBlocks: d.workBlocks.map((wb) => ({
          ...wb,
          tags: wb.workBlockTags.map((wbt) => wbt.tag.name),
          workBlockTags: undefined,
        })),
      })),
      points: points.map((p) => ({
        ...p,
        tags: p.pointTags.map((pt) => pt.tag.name),
        pointTags: undefined,
      })),
      tags,
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="antigravity-export.json"',
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return errorResponse('Internal server error', 500)
  }
}
