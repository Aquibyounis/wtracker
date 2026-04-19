import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'

// Room model does not exist in the current schema.
// These routes return empty data to prevent build errors.

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error
  return NextResponse.json([])
}

export async function POST() {
  const { error } = await requireAuth()
  if (error) return error
  return NextResponse.json({ error: 'Rooms feature is not available in this version.' }, { status: 501 })
}
