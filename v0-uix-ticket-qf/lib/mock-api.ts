import type { Ticket, Topic, TicketStats } from "./types"

// Mock data
const mockTopics: Topic[] = [
  { id: 1, name: "Technical Support", organizationId: 1, active: true },
  { id: 2, name: "Billing", organizationId: 1, active: true },
  { id: 3, name: "Feature Request", organizationId: 1, active: true },
  { id: 4, name: "Bug Report", organizationId: 1, active: true },
  { id: 5, name: "General Inquiry", organizationId: 1, active: false },
]

const mockTickets: Ticket[] = [
  {
    id: 1,
    requesterId: 1,
    requesterName: "John Doe",
    title: "Dashboard Access Issue", // added title
    assigneeId: 2,
    topicId: 1,
    priority: "high",
    status: "in_progress",
    description: "Unable to access the dashboard after latest update",
    createdAt: "2025-01-10T10:30:00Z",
    updatedAt: "2025-01-10T14:20:00Z",
  },
  {
    id: 2,
    requesterId: 1,
    requesterName: "John Doe",
    title: "Dark Mode Feature Request", // added title
    topicId: 3,
    priority: "medium",
    status: "created",
    description: "Would like to see dark mode support",
    createdAt: "2025-01-11T09:15:00Z",
    updatedAt: "2025-01-11T09:15:00Z",
  },
  {
    id: 3,
    requesterId: 3,
    requesterName: "Alice Johnson",
    title: "Payment Processing Error", // added title
    assigneeId: 2,
    topicId: 2,
    priority: "high",
    status: "completed",
    description: "Payment not processed for invoice #1234",
    createdAt: "2025-01-09T14:00:00Z",
    updatedAt: "2025-01-12T16:30:00Z",
  },
  {
    id: 4,
    requesterId: 4,
    requesterName: "Bob Smith",
    title: "Mobile UI Alignment", // added title
    topicId: 4,
    priority: "low",
    status: "created",
    description: "Minor UI alignment issue on mobile",
    createdAt: "2025-01-12T11:20:00Z",
    updatedAt: "2025-01-12T11:20:00Z",
  },
]

// Mock API functions
export async function fetchTickets(requesterId?: number): Promise<Ticket[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  let tickets = [...mockTickets]

  if (requesterId) {
    tickets = tickets.filter((t) => t.requesterId === requesterId)
  }

  // Enrich with topic and assignee data
  return tickets.map((ticket) => ({
    ...ticket,
    topic: mockTopics.find((t) => t.id === ticket.topicId),
    assignee: ticket.assigneeId ? { id: ticket.assigneeId, name: "Support Agent" } : undefined,
  }))
}

export async function fetchTicket(id: number): Promise<Ticket | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const ticket = mockTickets.find((t) => t.id === id)
  if (!ticket) return null

  return {
    ...ticket,
    topic: mockTopics.find((t) => t.id === ticket.topicId),
    assignee: ticket.assigneeId ? { id: ticket.assigneeId, name: "Support Agent" } : undefined,
  }
}

export async function createTicket(data: {
  requesterName: string
  title: string // added title parameter
  topicId: number
  priority: string
  description: string
  requesterId: number
}): Promise<Ticket> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const newTicket: Ticket = {
    id: mockTickets.length + 1,
    requesterId: data.requesterId,
    requesterName: data.requesterName,
    title: data.title, // include title in ticket creation
    topicId: data.topicId,
    priority: data.priority as any,
    status: "created",
    description: data.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockTickets.push(newTicket)

  return {
    ...newTicket,
    topic: mockTopics.find((t) => t.id === newTicket.topicId),
  }
}

export async function updateTicket(id: number, data: { status?: string; assigneeId?: number }): Promise<Ticket> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const ticket = mockTickets.find((t) => t.id === id)
  if (!ticket) throw new Error("Ticket not found")

  if (data.status) ticket.status = data.status as any
  if (data.assigneeId !== undefined) ticket.assigneeId = data.assigneeId
  ticket.updatedAt = new Date().toISOString()

  return {
    ...ticket,
    topic: mockTopics.find((t) => t.id === ticket.topicId),
    assignee: ticket.assigneeId ? { id: ticket.assigneeId, name: "Support Agent" } : undefined,
  }
}

export async function fetchTopics(): Promise<Topic[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return [...mockTopics]
}

export async function createTopic(data: { name: string; organizationId: number }): Promise<Topic> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const newTopic: Topic = {
    id: mockTopics.length + 1,
    name: data.name,
    organizationId: data.organizationId,
    active: true,
  }

  mockTopics.push(newTopic)
  return newTopic
}

export async function updateTopic(id: number, data: { name?: string; active?: boolean }): Promise<Topic> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const topic = mockTopics.find((t) => t.id === id)
  if (!topic) throw new Error("Topic not found")

  if (data.name) topic.name = data.name
  if (data.active !== undefined) topic.active = data.active

  return topic
}

export async function fetchTicketStats(requesterId?: number): Promise<TicketStats> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  let tickets = [...mockTickets]

  if (requesterId) {
    tickets = tickets.filter((t) => t.requesterId === requesterId)
  }

  return {
    total: tickets.length,
    created: tickets.filter((t) => t.status === "created").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    completed: tickets.filter((t) => t.status === "completed").length,
  }
}
