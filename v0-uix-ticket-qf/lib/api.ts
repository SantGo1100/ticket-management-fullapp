import type { Ticket, Topic, TicketStats } from "./types"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const API_ACCOUNT_SID = process.env.NEXT_PUBLIC_API_ACCOUNT_SID || "AC123456789"
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "sk_live_abc123xyz456"

// Topic mapping: Backend uses enums, frontend expects objects with IDs
// Note: This is frontend-only storage. In production, topics should be managed via backend API.
let TOPIC_MAP: Record<string, Topic> = {
  billing: { id: 1, name: "Billing", organizationId: 1, active: true },
  bug: { id: 2, name: "Bug Report", organizationId: 1, active: true },
  feature: { id: 3, name: "Feature Request", organizationId: 1, active: true },
  other: { id: 4, name: "General Inquiry", organizationId: 1, active: true },
}

// Helper to get the next available topic ID
function getNextTopicId(): number {
  const existingIds = Object.values(TOPIC_MAP).map((t) => t.id)
  return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
}

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-account-sid": API_ACCOUNT_SID,
    "x-api-key": API_KEY,
  }
}

// Helper to transform backend ticket to frontend format
function transformTicket(backendTicket: any): Ticket {
  const topic = TOPIC_MAP[backendTicket.topic] || TOPIC_MAP.other
  
  // Extract title and description from the combined description field
  // Format: "Title\n\nDescription" (when created with title)
  let title = "Untitled Ticket"
  let description = backendTicket.description || ""
  
  if (description.includes("\n\n")) {
    const parts = description.split("\n\n", 2)
    title = parts[0] || "Untitled Ticket"
    description = parts[1] || description
  } else if (description) {
    // If no title separator, use first line as title or first 50 chars
    const firstLine = description.split("\n")[0]
    title = firstLine.length <= 50 ? firstLine : firstLine.substring(0, 50) + "..."
  }
  
  return {
    id: backendTicket.ticketId,
    requesterId: backendTicket.requesterId,
    requesterName: backendTicket.requesterName || `User ${backendTicket.requesterId}`,
    title,
    assigneeId: backendTicket.assigneeId || undefined,
    topicId: topic.id,
    priority: backendTicket.priority,
    status: backendTicket.status,
    description,
    createdAt: new Date(backendTicket.createdAt).toISOString(),
    updatedAt: new Date(backendTicket.updatedAt).toISOString(),
    topic,
    assignee: backendTicket.assigneeId
      ? { id: backendTicket.assigneeId, name: `Agent ${backendTicket.assigneeId}` }
      : undefined,
  }
}

// API Functions
export async function fetchTickets(requesterId?: number, requesterName?: string): Promise<Ticket[]> {
  const params = new URLSearchParams()
  
  // Only add filters if provided
  // Priority: requester_name over requester_id for requester role filtering
  if (requesterName) {
    params.append("requester_name", requesterName)
  } else if (requesterId) {
    params.append("requester_id", requesterId.toString())
  }

  const response = await fetch(`${API_BASE_URL}/tickets?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.statusText}`)
  }

  const backendTickets = await response.json()
  return backendTickets.map((ticket: any) => transformTicket(ticket))
}

export async function fetchTicket(id: number): Promise<Ticket | null> {
  const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`Failed to fetch ticket: ${response.statusText}`)
  }

  const backendTicket = await response.json()
  return transformTicket(backendTicket)
}

export async function createTicket(data: {
  requesterName: string
  title: string
  topicId: number
  priority: string
  description: string
  requesterId: number
}): Promise<Ticket> {
  // Map topicId to backend enum
  const topicEnum = Object.entries(TOPIC_MAP).find(([_, topic]) => topic.id === data.topicId)?.[0] || "other"

  // Combine title and description for backend (since backend doesn't have title field)
  const fullDescription = `${data.title}\n\n${data.description}`

  // Prepare request payload matching CreateTicketDto exactly
  const requestBody = {
    requester_id: data.requesterId,
    requester_name: data.requesterName.trim(), // Ensure no extra whitespace
    topic: topicEnum,
    priority: data.priority,
    description: fullDescription,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      let errorMessage = `Failed to create ticket: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.details?.message || errorMessage
        // Include validation errors if present
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details.map((err: any) => 
            Object.values(err.constraints || {}).join(', ')
          ).join('; ')
          if (validationErrors) {
            errorMessage += ` - ${validationErrors}`
          }
        }
      } catch {
        // If JSON parsing fails, use status text
      }
      throw new Error(errorMessage)
    }

    const backendTicket = await response.json()
    return transformTicket(backendTicket)
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to reach the API server. Please ensure the backend is running on ${API_BASE_URL}`)
    }
    throw error
  }
}

export async function updateTicket(
  id: number,
  data: { status?: string; assigneeId?: number }
): Promise<Ticket> {
  const body: any = {}
  if (data.status) {
    body.status = data.status
  }
  if (data.assigneeId !== undefined) {
    body.assignee_id = data.assigneeId
  }

  const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to update ticket: ${response.statusText}`)
  }

  const backendTicket = await response.json()
  return transformTicket(backendTicket)
}

export async function fetchTopics(): Promise<Topic[]> {
  // Backend doesn't have a topics endpoint, so we return the mapped topics
  // Load from localStorage if available (for persistence)
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("topics_map")
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge stored topics with defaults (stored topics take precedence for custom ones)
        // Keep default topics (billing, bug, feature, other) from initial map
        const defaultKeys = ["billing", "bug", "feature", "other"]
        const defaultTopics: Record<string, Topic> = {}
        defaultKeys.forEach((key) => {
          if (TOPIC_MAP[key]) {
            defaultTopics[key] = TOPIC_MAP[key]
          }
        })
        TOPIC_MAP = { ...defaultTopics, ...parsed }
      }
    } catch {
      // Ignore parse errors, use default map
    }
  }
  return Object.values(TOPIC_MAP)
}

export async function createTopic(data: { name: string; organizationId: number }): Promise<Topic> {
  // Backend doesn't support topic creation, so we'll simulate it
  // In a real scenario, you'd need to add this endpoint to the backend
  const newTopic: Topic = {
    id: getNextTopicId(),
    name: data.name,
    organizationId: data.organizationId,
    active: true,
  }
  
  // Find an available enum key (use a generic key pattern)
  const enumKey = `custom_${newTopic.id}`
  TOPIC_MAP[enumKey] = newTopic
  
  // Store in localStorage for persistence across sessions
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("topics_map", JSON.stringify(TOPIC_MAP))
    } catch {
      // Ignore storage errors
    }
  }
  
  return newTopic
}

export async function updateTopic(
  id: number,
  data: { name?: string; active?: boolean }
): Promise<Topic> {
  // Backend doesn't support topic updates, so we'll simulate it
  const topicKey = Object.keys(TOPIC_MAP).find((key) => TOPIC_MAP[key].id === id)
  if (!topicKey) {
    throw new Error("Topic not found")
  }

  const topic = TOPIC_MAP[topicKey]
  if (data.name) topic.name = data.name
  if (data.active !== undefined) topic.active = data.active

  // Update in localStorage for persistence
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("topics_map", JSON.stringify(TOPIC_MAP))
    } catch {
      // Ignore storage errors
    }
  }

  return topic
}

export async function deleteTopic(id: number): Promise<void> {
  // Backend doesn't support topic deletion, so we'll simulate it
  const topicKey = Object.keys(TOPIC_MAP).find((key) => TOPIC_MAP[key].id === id)
  if (!topicKey) {
    throw new Error("Topic not found")
  }

  // Delete the topic (all topics can be deleted, including defaults)
  delete TOPIC_MAP[topicKey]

  // Update localStorage for persistence
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("topics_map", JSON.stringify(TOPIC_MAP))
    } catch {
      // Ignore storage errors
    }
  }
}

export async function fetchTicketStats(requesterId?: number, requesterName?: string): Promise<TicketStats> {
  // Backend doesn't have a stats endpoint, so we calculate from tickets
  const tickets = await fetchTickets(requesterId, requesterName)

  return {
    total: tickets.length,
    created: tickets.filter((t) => t.status === "created").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    completed: tickets.filter((t) => t.status === "completed").length,
  }
}

