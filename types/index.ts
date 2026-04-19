export interface User {
  id: string
  name: string
  email: string
  pinEnabled: boolean
  createdAt: Date
  settings?: UserSettings
}

export interface Room {
  id: string
  name: string
  description?: string
  icon: string
  colorLabel: string
  userId: string
  createdAt: Date
  updatedAt?: Date
  _count?: { days: number; points: number }
}

export interface Day {
  id: string
  title: string
  date: Date | string
  status: 'draft' | 'active' | 'completed'
  summary?: string | null
  mood?: number | null
  notes?: string | null
  userId: string
  roomId?: string | null
  room?: Room | null
  workBlocks?: WorkBlock[]
  points?: Point[]
  tags?: Tag[]
  createdAt: Date | string
  updatedAt: Date | string
  _count?: { workBlocks: number; points: number }
}

export interface WorkBlock {
  id: string
  title: string
  body?: string | null
  duration?: number | null
  timestamp?: string | null
  priority: 'normal' | 'high'
  order: number
  dayId: string
  tags?: Tag[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Point {
  id: string
  title: string
  body?: string | null
  priority: 'normal' | 'high'
  colorLabel: 'light' | 'mid' | 'dark' | 'black'
  userId: string
  dayId?: string | null
  roomId?: string | null
  day?: { id: string; title: string; date: Date | string } | null
  room?: Room | null
  tags?: Tag[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Tag {
  id: string
  name: string
  userId: string
}

export interface UserSettings {
  timezone: string
  dateFormat: string
  weekStart: string
  fontSize: string
  sidebarCollapsed: boolean
}

export interface AnalysisDaily {
  day: Day | null
  workBlocks: WorkBlock[]
  points: Point[]
  totalDuration: number
  tagBreakdown: { tag: string; count: number }[]
  productivityScore: number
}

export interface AnalysisWeekly {
  days: Day[]
  heatmapData: { date: string; count: number; intensity: 0 | 1 | 2 | 3 }[]
  totalDuration: number
  totalPoints: number
  totalBlocks: number
  avgBlocksPerDay: number
  mostProductiveDay: string
  tagBreakdown: { tag: string; count: number }[]
  comparisonLastWeek: { timeDelta: number; pointsDelta: number }
}

export interface AnalysisMonthly {
  calendarData: { date: string; count: number; intensity: 0 | 1 | 2 | 3 }[]
  cumulativeDays: { day: number; total: number }[]
  totalDays: number
  totalPoints: number
  avgTimePerDay: number
  bestStreak: number
  topTags: { tag: string; count: number }[]
  roomBreakdown: { room: string; days: number; points: number; avgTime: number }[]
}
