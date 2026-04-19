import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { PinGate } from '@/components/layout/PinGate'
import { FloatingPointButton } from '@/components/points/FloatingPointButton'
import { PointDrawer } from '@/components/points/PointDrawer'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <PinGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-[240px] min-h-screen">
          <TopBar />
          <div className="fade-in">{children}</div>
        </main>
        <FloatingPointButton />
        <PointDrawer />
      </div>
    </PinGate>
  )
}
