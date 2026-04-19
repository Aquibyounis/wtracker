import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { hashPin } from '@/lib/pin'
import { pinSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validation = pinSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'PIN must be 4 digits' }, { status: 400 })
    }

    const { pin } = validation.data
    const pinHash = await hashPin(pin)

    await prisma.user.update({
      where: { id: session!.user.id },
      data: { pinHash },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Set PIN error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
