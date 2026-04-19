import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { generateInitials, formatDate } from '@/lib/utils'
import { Download } from 'lucide-react'
import Link from 'next/link'
import { subDays, startOfDay, endOfDay } from 'date-fns'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const userId = session.user.id

  const [user, totalDays, totalPoints, rooms] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, createdAt: true } }),
    prisma.day.count({ where: { userId } }),
    prisma.point.count({ where: { userId } }),
    prisma.room.findMany({ where: { userId }, select: { id: true, name: true }, take: 10 }),
  ])

  // Current streak
  let currentStreak = 0
  let checkDate = startOfDay(new Date())
  while (true) {
    const exists = await prisma.day.findFirst({
      where: { userId, date: { gte: startOfDay(checkDate), lte: endOfDay(checkDate) } },
    })
    if (exists) { currentStreak++; checkDate = subDays(checkDate, 1) } else break
  }

  return (
    <PageWrapper maxWidth="md">
      <div className="flex items-center gap-6 mb-10">
        <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-[32px] font-medium flex-shrink-0">
          {generateInitials(user?.name || '')}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-sm text-muted">{user?.email}</p>
          <p className="text-xs text-muted mt-1">Member since {formatDate(user?.createdAt || new Date())}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Card className="p-5 text-center">
          <p className="text-2xl font-bold">{totalDays}</p>
          <p className="text-xs text-muted mt-1">Days Logged</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-2xl font-bold">{totalPoints}</p>
          <p className="text-xs text-muted mt-1">Points Created</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-2xl font-bold">{currentStreak}</p>
          <p className="text-xs text-muted mt-1">Current Streak</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-2xl font-bold">{rooms.length}</p>
          <p className="text-xs text-muted mt-1">Rooms</p>
        </Card>
      </div>

      {rooms.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-semibold mb-3">Rooms</h3>
          <div className="flex flex-wrap gap-2">
            {rooms.map(room => (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <span className="text-xs bg-surface px-3 py-1.5 rounded-full hover:bg-border transition-colors">
                  {room.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-3">Export</h3>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Download All Data (JSON)</p>
              <p className="text-xs text-muted mt-1">Includes all days, blocks, points, and rooms</p>
            </div>
            <a href="/api/export" download>
              <Button variant="secondary" size="sm">
                <Download size={14} /> Export
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
