import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const pinSchema = z.object({
  pin: z.string().length(4, 'PIN must be 4 digits').regex(/^\d{4}$/, 'PIN must be numeric'),
})

export const changePinSchema = z.object({
  currentPin: z.string().length(4).regex(/^\d{4}$/),
  newPin: z.string().length(4).regex(/^\d{4}$/),
})

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(50),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
})

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(50),
  description: z.string().max(500).optional(),
  companyId: z.string().min(1, 'Company ID is required'),
})

export const daySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  date: z.string().or(z.date()),
  projectId: z.string().min(1, 'Project ID is required'),
  status: z.enum(['draft', 'active', 'completed']).optional(),
  templateType: z.enum(['blank', 'standup', 'sprint', 'deepwork']).optional(),
})

export const dayUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.enum(['draft', 'active', 'completed']).optional(),
  summary: z.string().max(2000).optional().nullable(),
  mood: z.number().min(1).max(5).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  projectId: z.string().optional(),
  hasMeeting: z.boolean().optional(),
  meetingPoints: z.string().optional().nullable(),
})

export const blockSchema = z.object({
  dayId: z.string(),
  title: z.string().min(1, 'Block title is required').max(200),
  body: z.string().max(10000).optional(),
  duration: z.number().min(0).optional().nullable(),
  timestamp: z.string().max(10).optional().nullable(),
  priority: z.enum(['normal', 'high']).optional(),
  tags: z.array(z.string()).optional(),
})

export const blockUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(10000).optional().nullable(),
  duration: z.number().min(0).optional().nullable(),
  timestamp: z.string().max(10).optional().nullable(),
  priority: z.enum(['normal', 'high']).optional(),
  tags: z.array(z.string()).optional(),
})

export const reorderSchema = z.object({
  dayId: z.string(),
  orderedIds: z.array(z.string()),
})

export const pointSchema = z.object({
  title: z.string().min(1, 'Point title is required').max(200),
  body: z.string().max(10000).optional(),
  priority: z.enum(['normal', 'high']).optional(),
  colorLabel: z.enum(['light', 'mid', 'dark', 'black']).optional(),
  dayId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export const pointUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(10000).optional().nullable(),
  priority: z.enum(['normal', 'high']).optional(),
  colorLabel: z.enum(['light', 'mid', 'dark', 'black']).optional(),
  dayId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export const roomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(50).optional(),
})

export const roomUpdateSchema = roomSchema.partial()
