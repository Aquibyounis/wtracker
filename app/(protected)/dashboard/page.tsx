import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { TodaySnapshot } from '@/components/dashboard/TodaySnapshot'
import { WeeklyGrid } from '@/components/dashboard/WeeklyGrid'
import { RecentPoints } from '@/components/dashboard/RecentPoints'
import { RecentProjects } from '@/components/dashboard/RecentProjects'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const userId = session.user.id

  // Check if user has any companies. If not, redirect to setup.
  const companyCount = await prisma.company.count({ where: { userId } })
  if (companyCount === 0) {
    const { redirect } = await import('next/navigation')
    redirect('/setup/company')
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [totalDays, pointsThisWeek, thisMonthDays, todayDay, weekDays, recentPoints, recentProjects] =
    await Promise.all([
      prisma.day.count({ where: { userId } }),
      prisma.point.count({
        where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.day.count({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.day.findFirst({
        where: { userId, date: { gte: todayStart, lte: todayEnd } },
        include: { _count: { select: { workBlocks: true, points: true } } },
      }),
      prisma.day.findMany({
        where: { userId, date: { gte: weekStart, lte: weekEnd } },
        include: { _count: { select: { workBlocks: true, points: true } } },
        orderBy: { date: 'asc' },
      }),
      prisma.point.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          day: { 
            include: { 
              project: { include: { company: true } } 
            } 
          },
        },
      }),
      prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 4,
        include: { _count: { select: { days: true } } },
      }),
    ])

  const flattenedRecentPoints = recentPoints.map((p: any) => ({
    ...p,
    project: p.day?.project || null,
  }))

  // Calculate streak
  let currentStreak = 0
  let checkDate = todayStart
  while (true) {
    const dayExists = await prisma.day.findFirst({
      where: {
        userId,
        date: { gte: startOfDay(checkDate), lte: endOfDay(checkDate) },
      },
    })
    if (dayExists) {
      currentStreak++
      checkDate = subDays(checkDate, 1)
    } else {
      break
    }
  }

  const stats = { totalDays, pointsThisWeek, currentStreak, thisMonthDays }

  return (
    <PageWrapper>
      <StatsBar stats={stats} />
      <div className="mt-8">
        <TodaySnapshot day={todayDay ? JSON.parse(JSON.stringify(todayDay)) : null} />
      </div>
      <div className="mt-8">
        <WeeklyGrid
          weekDays={JSON.parse(JSON.stringify(weekDays))}
          weekStart={weekStart.toISOString()}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <RecentPoints points={JSON.parse(JSON.stringify(flattenedRecentPoints))} />
        <RecentProjects projects={JSON.parse(JSON.stringify(recentProjects))} />
      </div>
    </PageWrapper>
  )
}

