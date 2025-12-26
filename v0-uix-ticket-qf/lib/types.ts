export type UserRole = "requester" | "assignee" | "admin"

export type TicketStatus = "created" | "in_progress" | "completed"

export type TicketPriority = "low" | "medium" | "high"

export interface User {
  id: number
  role: UserRole
  organizationId: number
  name?: string
  assigneeId?: number // For assignee role: the ID used when assigning tickets
  requesterName?: string // For requester role: the name used when creating tickets
}

export interface Organization {
  id: number
  name: string
}

export interface Topic {
  id: number
  name: string
  organizationId: number
  active: boolean
}

export interface Ticket {
  id: number
  requesterId: number
  requesterName: string
  title: string // added title field
  assigneeId?: number
  topicId: number
  priority: TicketPriority
  status: TicketStatus
  description: string
  createdAt: string
  updatedAt: string
  topic?: Topic
  assignee?: { id: number; name: string }
}

export interface TicketStats {
  total: number
  created: number
  inProgress: number
  completed: number
}
