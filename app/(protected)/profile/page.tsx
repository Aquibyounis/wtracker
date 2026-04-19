import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { generateInitials, formatDate } from '@/lib/utils'
import { Download, Briefcase, Calendar, Star, Settings } from 'lucide-react'
import Link from 'next/link'
import { subDays, startOfDay, endOfDay } from 'date-fns'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const userId = session.user.id

  const [user, totalDays, totalPoints, companies, projectCount] = await Promise.all([
    prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { name: true, email: true, createdAt: true } 
    }),
    prisma.day.count({ where: { userId } }),
    prisma.point.count({ where: { userId } }),
    prisma.company.findMany({ 
      where: { userId }, 
      select: { id: true, name: true, isDefault: true }, 
      take: 5 
    }),
    prisma.project.count({ where: { company: { userId } } })
  ])

  // Current streak
  let currentStreak = 0
  let checkDate = startOfDay(new Date())
  while (true) {
    const exists = await prisma.day.findFirst({
      where: { userId, date: { gte: startOfDay(checkDate), lte: endOfDay(checkDate) } },
    })
    if (exists) { 
      currentStreak++
      checkDate = subDays(checkDate, 1) 
    } else break
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-[32px] bg-[var(--surface)] border border-[var(--border)] p-8 lg:p-14 shadow-2xl shadow-black/5 transition-colors">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-zinc-900/[0.02] dark:bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
            <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-[32px] bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white flex items-center justify-center text-3xl lg:text-4xl font-black shadow-2xl shadow-black/20 ring-4 ring-white dark:ring-zinc-900 transition-all">
              {generateInitials(user?.name || '')}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[var(--foreground)] mb-3">{user?.name}</h1>
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">
                <span className="flex items-center gap-2">{user?.email}</span>
                <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                <span>Joined {formatDate(user?.createdAt || new Date())}</span>
              </div>
              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 bg-transparent border-[var(--border)] hover:bg-[var(--surface-hover)]">
                    <Settings size={14} /> Edit Profile
                  </Button>
                </Link>
                <a href="/api/export" download>
                  <Button variant="secondary" size="sm" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 border-[var(--border)] hover:bg-[var(--surface-hover)]">
                    <Download size={14} /> Export Backup
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-7 border-[var(--border)] hover:scale-[1.02] transition-transform group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-zinc-900/[0.03] dark:bg-white/[0.03] rounded-2xl text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                <Calendar size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Activity</span>
            </div>
            <p className="text-4xl font-black text-[var(--foreground)] tracking-tighter">{totalDays}</p>
            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mt-2 opacity-60">Days Logged</p>
          </Card>

          <Card className="p-7 border-[var(--border)] hover:scale-[1.02] transition-transform group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-zinc-900/[0.03] dark:bg-white/[0.03] rounded-2xl text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                <Star size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Engagement</span>
            </div>
            <p className="text-4xl font-black text-[var(--foreground)] tracking-tighter">{totalPoints}</p>
            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mt-2 opacity-60">Points Earned</p>
          </Card>

          <Card className="p-7 border-[var(--border)] hover:scale-[1.02] transition-transform group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-zinc-900/[0.03] dark:bg-white/[0.03] rounded-2xl text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                <Briefcase size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Scope</span>
            </div>
            <p className="text-4xl font-black text-[var(--foreground)] tracking-tighter">{projectCount}</p>
            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mt-2 opacity-60">Total Projects</p>
          </Card>

          <Card className="p-7 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-none shadow-2xl shadow-black/10 hover:scale-[1.02] transition-transform group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 dark:bg-black/10 rounded-2xl">
                <Star size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Current Streak</span>
            </div>
            <p className="text-4xl font-black tracking-tighter">{currentStreak}</p>
            <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-50">Daily Discipline</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Organizations List */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] mb-4">Core Organizations</h2>
            <div className="space-y-4">
              {companies.map(company => (
                <Card key={company.id} className="p-6 border-[var(--border)] flex items-center justify-between hover:bg-[var(--surface-hover)] transition-all group">
                  <div>
                    <p className="text-md font-black text-[var(--foreground)] uppercase tracking-tight">{company.name}</p>
                    {company.isDefault && <span className="text-[9px] font-black uppercase text-[var(--muted)] tracking-widest mt-2 block opacity-60">Default Workspace</span>}
                  </div>
                  <Link href="/settings">
                    <Button variant="ghost" size="sm" className="h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent group-hover:border-[var(--border)] group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all">Manage</Button>
                  </Link>
                </Card>
              ))}
              <Link href="/setup/company" className="block">
                <Card className="p-6 border-dashed border-2 border-[var(--border)] bg-transparent hover:bg-[var(--surface-hover)] transition-all flex items-center justify-center gap-3 group">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-[var(--foreground)]">+ Add New Company</span>
                </Card>
              </Link>
            </div>
          </div>

          {/* Backup Section */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] mb-4">Persistence</h2>
            <Card className="p-8 border-[var(--border)] bg-[var(--surface)] space-y-6">
              <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                <p className="text-[11px] font-bold text-[var(--muted)] leading-relaxed text-center uppercase tracking-tighter">
                  End-to-End Encrypted activity vault.
                </p>
              </div>
              <p className="text-[11px] font-medium text-[var(--muted-foreground)] leading-relaxed">
                Your data is securely stored and versioned. You can download a complete activity dump for local archival at any time.
              </p>
              <a href="/api/export" download className="block">
                <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-12 rounded-xl border-[var(--border)] hover:bg-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 hover:text-white transition-all shadow-sm">
                  Download JSON Vault
                </Button>
              </a>
            </Card>
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
