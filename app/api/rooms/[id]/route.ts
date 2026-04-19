import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'

// Room model does not exist in the current schema.
// These routes return appropriate stubs to prevent build errors.

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAuth()
  if (error) return error
  return NextResponse.json({ error: 'Room not found' }, { status: 404 })
}

export async function PUT(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAuth()
  if (error) return error
  return NextResponse.json({ error: 'Rooms feature is not available in this version.' }, { status: 501 })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAuth()
  if (error) return error
  return NextResponse.json({ error: 'Rooms feature is not available in this version.' }, { status: 501 })
}
