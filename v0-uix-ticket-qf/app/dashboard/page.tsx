"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { PriorityBadge } from "@/components/priority-badge"
import { TicketDetailModal } from "@/components/ticket-detail-modal"
import { fetchTickets, fetchTicketStats, fetchTopics } from "@/lib/api"
import type { Ticket, TicketStats, Topic } from "@/lib/types"
import { Plus, Settings, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, setUser } = useUser()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [topicFilter, setTopicFilter] = useState<string>("all")

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    // Load data immediately - assigneeId should already be set from role selection
    loadData()
  }, [user, router])

  async function loadData() {
    setLoading(true)
    try {
      // For Requester role: filter by requesterName (from user context)
      // For Assignee/Admin: fetch all tickets (no filtering)
      let requesterId: number | undefined = undefined
      let requesterName: string | undefined = undefined
      
      if (user?.role === "requester" && user.requesterName) {
        // Use requesterName for filtering (backend is source of truth)
        requesterName = user.requesterName
      }
      // For Assignee and Admin, don't set any filters - fetch all tickets

      const [ticketsData, statsData, topicsData] = await Promise.all([
        fetchTickets(requesterId, requesterName),
        fetchTicketStats(requesterId, requesterName),
        fetchTopics(),
      ])

      setTickets(ticketsData)
      setFilteredTickets(ticketsData)
      setStats(statsData)
      setTopics(topicsData.filter((t) => t.active))
    } catch (error) {
      console.error("[v0] Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = [...tickets]

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((t) => t.priority === priorityFilter)
    }

    if (topicFilter !== "all") {
      filtered = filtered.filter((t) => t.topicId === Number.parseInt(topicFilter))
    }

    setFilteredTickets(filtered)
  }, [statusFilter, priorityFilter, topicFilter, tickets])

  // Separate tickets for Assignee role
  const assignedTickets = user?.role === "assignee" && user.assigneeId
    ? filteredTickets.filter((t) => t.assigneeId === user.assigneeId)
    : []
  
  const unassignedTickets = user?.role === "assignee"
    ? filteredTickets.filter((t) => !t.assigneeId)
    : []

  function handleTicketClick(ticketId: number) {
    setSelectedTicketId(ticketId)
    setIsModalOpen(true)
  }

  function handleModalClose() {
    setIsModalOpen(false)
    setSelectedTicketId(null)
  }

  function handleTicketUpdated() {
    loadData()
  }

  if (!user) return null

  if (loading) {
    return (
      <>
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              {user.role === "requester" && "View and manage your support tickets"}
              {user.role === "assignee" && "Manage all support tickets"}
              {user.role === "admin" && "Full system overview and management"}
            </p>
          </div>
          <div className="flex gap-3">
            {user.role === "admin" && (
              <Button variant="outline" onClick={() => router.push("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
            {user.role === "requester" && (
              <Button onClick={() => router.push("/tickets/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Tickets</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Created</CardDescription>
                <CardTitle className="text-3xl text-blue-500">{stats.created}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>In Progress</CardDescription>
                <CardTitle className="text-3xl text-amber-500">{stats.inProgress}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-3xl text-green-500">{stats.completed}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Topic</label>
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id.toString()}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List - Different layout for Assignee role */}
        {user.role === "assignee" ? (
          <div className="space-y-6">
            {/* Assigned to Me Section */}
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                      Assigned to Me
                    </CardTitle>
                    <CardDescription>
                      {assignedTickets.length} ticket{assignedTickets.length !== 1 ? "s" : ""} assigned to you
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {assignedTickets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No tickets assigned to you</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="border border-border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors bg-primary/5"
                        onClick={() => handleTicketClick(ticket.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-muted-foreground">#{ticket.id}</span>
                              <StatusBadge status={ticket.status} />
                              <PriorityBadge priority={ticket.priority} />
                            </div>
                            <p className="font-medium mb-1">{ticket.title}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>Requester: {ticket.requesterName}</span>
                              {ticket.topic && <span>• {ticket.topic.name}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Unassigned Tickets Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Unassigned Tickets</CardTitle>
                <CardDescription>
                  {unassignedTickets.length} ticket{unassignedTickets.length !== 1 ? "s" : ""} available for assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {unassignedTickets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No unassigned tickets</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unassignedTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="border border-border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => handleTicketClick(ticket.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-muted-foreground">#{ticket.id}</span>
                              <StatusBadge status={ticket.status} />
                              <PriorityBadge priority={ticket.priority} />
                            </div>
                            <p className="font-medium mb-1">{ticket.title}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>Requester: {ticket.requesterName}</span>
                              {ticket.topic && <span>• {ticket.topic.name}</span>}
                              <span className="text-amber-600 dark:text-amber-400">• Unassigned</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Default layout for Requester and Admin */
          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No tickets found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleTicketClick(ticket.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-muted-foreground">#{ticket.id}</span>
                            <StatusBadge status={ticket.status} />
                            <PriorityBadge priority={ticket.priority} />
                          </div>
                          <p className="font-medium mb-1">{ticket.title}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>Requester: {ticket.requesterName}</span>
                            {ticket.topic && <span>• {ticket.topic.name}</span>}
                            {ticket.assignee && <span>• Assigned</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <TicketDetailModal
        ticketId={selectedTicketId}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onTicketUpdated={handleTicketUpdated}
      />
    </>
  )
}
