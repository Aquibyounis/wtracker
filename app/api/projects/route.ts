import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')

  const projects = await prisma.project.findMany({
    where: { 
      userId: session.user.id,
      ...(companyId && { companyId })
    },
    include: { company: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, companyId, description } = await req.json()

    if (!name || !companyId) {
      return NextResponse.json({ error: 'Name and Company ID are required' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        companyId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
