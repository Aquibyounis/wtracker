import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const token = req.headers.get('x-health-token')
    if (token !== process.env.HEALTH_CHECK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      dbPing: true,
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString(), dbPing: false },
      { status: 500 }
    )
  }
}
