import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // A very lightweight query to keep the DB connection warm
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Keep-alive ping failed:', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
