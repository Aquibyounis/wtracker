'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Briefcase } from 'lucide-react'

interface RecentProjectsProps {
  projects: Array<{
    id: string
    name: string
    description?: string | null
    _count: { days: number }
    updatedAt: string
  }>
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black tracking-[0.2em] text-[var(--muted)] uppercase">Recent Projects</h3>
        <Link href="/projects" className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          View all →
        </Link>
      </div>
      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 border-dashed border-2 bg-transparent text-center">
          <Briefcase className="text-[var(--muted)] opacity-20 mb-4" size={32} />
          <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest">No projects available</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="p-5 hover:bg-[var(--surface-hover)] transition-all cursor-pointer group border-[var(--border)] relative overflow-hidden">
                <div className="flex items-start justify-between relative z-10">
                  <h4 className="font-black text-sm group-hover:translate-x-1 transition-transform tracking-tight">{project.name}</h4>
                  <Briefcase size={16} className="text-[var(--muted)] opacity-20 group-hover:opacity-100 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-all" />
                </div>
                {project.description && (
                  <p className="text-[11px] font-medium text-[var(--muted)] mt-1.5 line-clamp-1 relative z-10">{project.description}</p>
                )}
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[var(--border)] text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.15em] relative z-10">
                  <span>{project._count.days} {project._count.days === 1 ? 'Log' : 'Logs'}</span>
                </div>
                {/* Subtle highlight effect on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-900/[0.02] dark:bg-white/[0.02] -mr-12 -mt-12 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
