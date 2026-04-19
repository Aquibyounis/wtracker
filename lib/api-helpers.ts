import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user?.id) {
    return { session: null, userId: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session, userId: session.user.id, error: null }
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
