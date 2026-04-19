import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { verifyPin } from '@/lib/pin'

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const { pin, check } = body

    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { pinHash: true, pinEnabled: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user has no PIN set
    if (!user.pinHash) {
      return NextResponse.json({ valid: false, noPinSet: true })
    }

    // If PIN is disabled, auto-verify
    if (!user.pinEnabled) {
      return NextResponse.json({ valid: true })
    }

    // Check mode: just see if PIN exists
    if (check) {
      return NextResponse.json({ valid: false, noPinSet: false })
    }

    if (!pin || pin.length !== 4) {
      return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 })
    }

    const valid = await verifyPin(pin, user.pinHash)
    return NextResponse.json({ valid })
  } catch (error) {
    console.error('Verify PIN error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
