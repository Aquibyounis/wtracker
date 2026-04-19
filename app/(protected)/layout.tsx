import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { PinGate } from '@/components/layout/PinGate'
import { FloatingPointButton } from '@/components/points/FloatingPointButton'
import { PointDrawer } from '@/components/points/PointDrawer'
import { KeepAlive } from '@/components/utils/KeepAlive'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  // Check if user has at least one company
  const companyCount = await prisma.company.count({
    where: { userId: session.user.id }
  })

  // Strict onboarding: We'll wrap the content but for a clean redirect 
  // we usually do this at the page level or middleware.
  // Given the current structure, we'll use a CSS overlay or a simple conditional.
  return (
    <PinGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-[240px] min-h-screen">
          <TopBar />
          <div className="fade-in px-4 lg:px-8 py-6 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
        <FloatingPointButton />
        <PointDrawer />
        <KeepAlive />
      </div>
    </PinGate>
  )
}

