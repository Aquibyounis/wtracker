import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { isDefault, name, description, driveLink } = await req.json()

    // If setting as default, unset all others for this user
    if (isDefault) {
      await prisma.company.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      })
    }

    const company = await prisma.company.update({
      where: { id: params.id, userId: session.user.id },
      data: {
        isDefault: isDefault !== undefined ? !!isDefault : undefined,
        name: name || undefined,
        description: description || undefined,
        driveLink: driveLink !== undefined ? driveLink : undefined,
      },
    })

    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.company.delete({
      where: { id: params.id, userId: session.user.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })
  }
}
