'use client'

import React, { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Briefcase, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Project {
  id: string
  name: string
  description?: string
  company: {
    id: string
    name: string
  }
  _count: {
    days: number
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  // Group projects by company
  const groupedProjects = projects.reduce((acc, project) => {
    const companyName = project.company.name
    if (!acc[companyName]) acc[companyName] = []
    acc[companyName].push(project)
    return acc
  }, {} as Record<string, Project[]>)

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">Projects</h1>
          <p className="text-xs text-[var(--muted)] font-medium mt-1 uppercase tracking-wider">
            Organize your work by project and company
          </p>
        </div>
        <Button size="sm" className="gap-2 font-black text-[10px] uppercase tracking-widest h-9 px-4">
          <Plus size={14} /> New Project
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)] animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-20 border-dashed border-2 shadow-none bg-transparent">
          <Briefcase size={40} className="text-[var(--muted)] opacity-20 mb-4" />
          <h3 className="font-black text-sm uppercase">No projects configured</h3>
          <p className="text-xs text-[var(--muted)] mt-2 text-center max-w-xs">
            Create your first project to start tracking your daily progress.
          </p>
          <Button variant="outline" size="sm" className="mt-6 font-black text-[10px] uppercase tracking-widest">
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedProjects).map(([companyName, companyProjects]) => (
            <div key={companyName} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <h2 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">
                  {companyName}
                </h2>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="group">
                    <Card className="p-6 h-full hover:border-[var(--border-strong)] transition-all duration-300 relative overflow-hidden cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-[var(--surface-active)] rounded-xl group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-colors duration-300">
                          <Briefcase size={16} />
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-[var(--muted)] opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                        />
                      </div>

                      <h3 className="font-black text-base leading-tight group-hover:translate-x-0.5 transition-transform">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-[var(--muted)] mt-2 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}

                      <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">
                          <Calendar size={10} />
                          <span>{project._count.days} {project._count.days === 1 ? 'LOG' : 'LOGS'}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)] group-hover:bg-[var(--foreground)] transition-colors" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
