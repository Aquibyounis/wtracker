import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { hashPin, verifyPin } from '@/lib/pin'
import { changePinSchema } from '@/lib/validations'

export async function PUT(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validation = changePinSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 })
    }

    const { currentPin, newPin } = validation.data

    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { pinHash: true },
    })

    if (!user?.pinHash) {
      return NextResponse.json({ error: 'No PIN set' }, { status: 400 })
    }

    const valid = await verifyPin(currentPin, user.pinHash)
    if (!valid) {
      return NextResponse.json({ error: 'Current PIN is incorrect' }, { status: 403 })
    }

    const newPinHash = await hashPin(newPin)
    await prisma.user.update({
      where: { id: session!.user.id },
      data: { pinHash: newPinHash },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Change PIN error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
