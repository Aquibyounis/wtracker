'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Folder, Building2, Calendar, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Project {
  id: string
  name: string
  createdAt: string
  company: {
    name: string
  }
  _count: {
    days: number
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Project not found')
            router.push('/projects')
            return
          }
          throw new Error('Failed to fetch project')
        }
        const data = await response.json()
        setProject(data)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load project details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id, router])

  const deleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        toast.success('Project deleted')
        router.push('/projects')
      } else {
        throw new Error('Failed to delete project')
      }
    } catch {
      toast.error('Error deleting project')
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 bg-[var(--surface-active)] animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[var(--surface-active)] animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Back link */}
      <Link
        href="/projects"
        className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)]">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{project.name}</h1>
            <p className="text-[var(--muted)] text-sm font-medium">Project Overview</p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          onClick={deleteProject}
        >
          <Trash2 className="w-4 h-4" />
          Delete Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Building2 className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">Company</span>
          </div>
          <span className="text-xl font-black">{project.company.name}</span>
        </Card>

        <Card className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">Logged Days</span>
          </div>
          <span className="text-xl font-black">{project._count.days} {project._count.days === 1 ? 'day' : 'days'}</span>
        </Card>

        <Card className="p-6 flex flex-col justify-center">
          <Button variant="primary" className="w-full h-12 font-black uppercase tracking-widest text-xs">
            Log Progress
          </Button>
        </Card>
      </div>

      {/* Empty timeline placeholder */}
      <Card className="p-12 border-dashed border-2 bg-transparent shadow-none flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[var(--surface-active)] flex items-center justify-center text-[var(--muted)]">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-black uppercase tracking-tight">No progress logged yet</h3>
          <p className="text-[var(--muted)] text-sm max-w-xs mx-auto mt-2">
            Start logging your daily progress to build your project timeline.
          </p>
        </div>
      </Card>
    </div>
  )
}
