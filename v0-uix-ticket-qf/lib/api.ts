import type { Ticket, Topic, TicketStats } from "./types"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const API_ACCOUNT_SID = process.env.NEXT_PUBLIC_API_ACCOUNT_SID || "AC123456789"
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "sk_live_abc123xyz456"

// Cache for topics fetched from backend
let topicsCache: Topic[] | null = null

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
  // Backend now returns topicName field (derived from topic.name or topicNameSnapshot)
  // and optionally a topic object if the topic still exists
  let topic: Topic | undefined
  let topicName: string
  
  // Use topicName from backend (always available, even if topic is deleted)
  topicName = backendTicket.topicName || backendTicket.topic?.name || `Topic ${backendTicket.topicId || 'Unknown'}`
  
  if (backendTicket.topic && typeof backendTicket.topic === 'object') {
    // Topic still exists
    topic = {
      id: backendTicket.topic.id,
      name: backendTicket.topic.name,
      organizationId: 1, // Default, backend doesn't have organizationId yet
      active: backendTicket.topic.isActive !== false, // Handle both isActive and active
    }
  } else if (backendTicket.topicId && !backendTicket.topic) {
    // Topic was deleted (topicId exists but topic object is null)
    // Create a placeholder topic marked as inactive/archived
    topic = {
      id: backendTicket.topicId,
      name: topicName,
      organizationId: 1,
      active: false, // Mark as inactive/archived since topic was deleted
    }
  }
  
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
    topicId: backendTicket.topicId || topic?.id || 0,
    priority: backendTicket.priority,
    status: backendTicket.status,
    description,
    createdAt: new Date(backendTicket.createdAt).toISOString(),
    updatedAt: new Date(backendTicket.updatedAt).toISOString(),
    topic: topic || {
      // Fallback topic if none exists
      id: backendTicket.topicId || 0,
      name: topicName,
      organizationId: 1,
      active: false, // Mark as archived if topic was deleted
    },
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
  // Combine title and description for backend (since backend doesn't have title field)
  const fullDescription = `${data.title}\n\n${data.description}`

  // Prepare request payload matching CreateTicketDto exactly
  const requestBody = {
    requester_id: data.requesterId,
    requester_name: data.requesterName.trim(), // Ensure no extra whitespace
    topic_id: data.topicId, // Use topic_id instead of topic enum
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
  // Fetch topics from backend API
  try {
    const response = await fetch(`${API_BASE_URL}/topics`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch topics: ${response.statusText}`)
    }

    const backendTopics = await response.json()
    
    // Transform backend topics to frontend format
    const topics: Topic[] = backendTopics.map((topic: any) => ({
      id: topic.id,
      name: topic.name,
      organizationId: 1, // Default, backend doesn't have organizationId yet
      active: topic.isActive !== false, // Handle both isActive and active
    }))

    // Cache topics
    topicsCache = topics
    return topics
  } catch (error) {
    // If fetch fails, return cached topics if available
    if (topicsCache) {
      console.warn("Failed to fetch topics from backend, using cache:", error)
      return topicsCache
    }
    
    // If no cache, re-throw the error
    throw error
  }
}

export async function createTopic(data: { name: string; organizationId: number }): Promise<Topic> {
  const response = await fetch(`${API_BASE_URL}/topics`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name: data.name,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to create topic: ${response.statusText}`)
  }

  const backendTopic = await response.json()
  
  // Transform backend topic to frontend format
  const topic: Topic = {
    id: backendTopic.id,
    name: backendTopic.name,
    organizationId: data.organizationId, // Keep from input
    active: backendTopic.isActive !== false,
  }

  // Clear topics cache since a new topic was created
  topicsCache = null

  return topic
}

export async function updateTopic(
  id: number,
  data: { name?: string; active?: boolean }
): Promise<Topic> {
  const body: any = {}
  if (data.name !== undefined) {
    body.name = data.name
  }
  if (data.active !== undefined) {
    body.isActive = data.active
  }

  const response = await fetch(`${API_BASE_URL}/topics/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to update topic: ${response.statusText}`)
  }

  const backendTopic = await response.json()
  
  // Transform backend topic to frontend format
  const topic: Topic = {
    id: backendTopic.id,
    name: backendTopic.name,
    organizationId: 1, // Default, backend doesn't have organizationId yet
    active: backendTopic.isActive !== false,
  }

  // Clear topics cache since a topic was updated
  topicsCache = null

  return topic
}

export async function deleteTopic(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/topics/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Topic not found")
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to delete topic: ${response.statusText}`)
  }

  // Clear topics cache since a topic was deleted
  topicsCache = null
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

