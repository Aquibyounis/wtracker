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
          <p className="text-xs text-muted font-medium mt-1 uppercase tracking-wider">Organize your work by project and company</p>
        </div>
        <Button size="sm" className="gap-2 font-bold text-[10px] uppercase tracking-widest h-9 px-4">
          <Plus size={14} /> New Project
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-border border-t-black animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-20 border-dashed border-2">
          <Briefcase size={40} className="text-muted/20 mb-4" />
          <h3 className="font-bold text-sm uppercase">No projects configured</h3>
          <p className="text-xs text-muted mt-2 text-center max-w-xs"> Create your first project to start tracking your daily progress and meetings.</p>
          <Button variant="outline" size="sm" className="mt-6 font-bold text-[10px] uppercase tracking-widest">
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedProjects).map(([companyName, companyProjects]) => (
            <div key={companyName} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-black/[0.03]" />
                <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{companyName}</h2>
                <div className="h-[1px] flex-1 bg-black/[0.03]" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="group">
                    <Card className="p-6 h-full hover:border-black/30 transition-all duration-300 relative overflow-hidden group-hover:shadow-xl group-hover:shadow-black/[0.02]">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-surface rounded-lg group-hover:bg-black group-hover:text-white transition-colors duration-300">
                          <Briefcase size={16} />
                        </div>
                        <ChevronRight size={14} className="text-muted/20 group-hover:text-black transition-all group-hover:translate-x-1" />
                      </div>
                      
                      <h3 className="font-bold text-base leading-tight group-hover:translate-x-0.5 transition-transform">{project.name}</h3>
                      {project.description && (
                        <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">{project.description}</p>
                      )}
                      
                      <div className="mt-6 pt-4 border-t border-black/[0.03] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase">
                          <Calendar size={10} />
                          <span>{project._count.days} {project._count.days === 1 ? 'LOG' : 'LOGS'}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-black/10 group-hover:bg-black transition-colors" />
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
