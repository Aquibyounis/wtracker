import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const companies = await prisma.company.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { projects: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(companies)
}


export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, description, isDefault } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // If this is set as default, unset others
    if (isDefault) {
      await prisma.company.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      })
    }

    const company = await prisma.company.create({
      data: {
        name,
        description,
        isDefault: !!isDefault,
        userId: session.user.id,
      },
    })

    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  }
}
