"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/lib/user-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { PriorityBadge } from "@/components/priority-badge"
import { fetchTicket, updateTicket } from "@/lib/api"
import type { Ticket, TicketStatus } from "@/lib/types"
import { Loader2, CheckCircle2 } from "lucide-react"

interface TicketDetailModalProps {
  ticketId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTicketUpdated?: () => void
}

export function TicketDetailModal({ ticketId, open, onOpenChange, onTicketUpdated }: TicketDetailModalProps) {
  const { user } = useUser()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<TicketStatus | "">("")

  useEffect(() => {
    if (open && ticketId) {
      loadTicket()
    }
  }, [open, ticketId])

  useEffect(() => {
    if (ticket) {
      setNewStatus(ticket.status)
    }
  }, [ticket])

  async function loadTicket() {
    if (!ticketId) return

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const data = await fetchTicket(ticketId)
      if (data) {
        setTicket(data)
      } else {
        setError("Ticket not found")
      }
    } catch (err) {
      console.error("[v0] Error loading ticket:", err)
      setError("Failed to load ticket details")
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusUpdate() {
    if (!ticket || !newStatus || newStatus === ticket.status) return

    setUpdating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Prepare update data
      const updateData: { status?: string; assigneeId?: number } = { status: newStatus }

      // If user is assignee and has assigneeId stored, automatically include it when updating
      // This ensures the ticket is assigned to the assignee when they update it
      // Backend requires assigneeId when moving from "created" to "in_progress"
      if (user?.role === "assignee" && user.assigneeId) {
        updateData.assigneeId = user.assigneeId
      }

      const updated = await updateTicket(ticket.id, updateData)
      setTicket(updated)
      setSuccessMessage("Status updated successfully")

      // Clear success message after 2 seconds
      setTimeout(() => setSuccessMessage(null), 2000)

      // Notify parent to refresh data
      if (onTicketUpdated) {
        onTicketUpdated()
      }
    } catch (err) {
      console.error("[v0] Error updating ticket:", err)
      setError("Failed to update ticket status")
    } finally {
      setUpdating(false)
    }
  }

  const canManageTicket = user?.role === "assignee" || user?.role === "admin"
  const isReadOnly = user?.role === "requester"

  // Get available status transitions based on current status
  const getAvailableStatuses = (currentStatus: TicketStatus): TicketStatus[] => {
    switch (currentStatus) {
      case "created":
        return ["created", "in_progress"]
      case "in_progress":
        return ["in_progress", "completed"]
      case "completed":
        return ["completed"]
      default:
        return [currentStatus]
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ticket Details</DialogTitle>
          <DialogDescription>{isReadOnly ? "View ticket information" : "View and manage ticket"}</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {successMessage}
          </div>
        )}

        {ticket && !loading && (
          <div className="space-y-6">
            {/* Ticket ID and Badges */}
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-muted-foreground">#{ticket.id}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Title</label>
              <p className="text-lg font-semibold">{ticket.title}</p>
            </div>

            {/* Requester */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Requester</label>
              <p className="text-base">{ticket.requesterName}</p>
            </div>

            {/* Topic */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Topic</label>
              <div className="flex items-center gap-2">
                <p className="text-base">{ticket.topic?.name || "N/A"}</p>
                {(!ticket.topic || !ticket.topic.active || !ticket.topicId) && (
                  <span className="text-xs text-muted-foreground italic">(Archived)</span>
                )}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Assignee</label>
              <p className="text-base">{ticket.assignee?.name || "Unassigned"}</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Description</label>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Created</label>
                <p className="text-sm">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Last Updated</label>
                <p className="text-sm">{new Date(ticket.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Status Management - Only for Assignee and Admin */}
            {canManageTicket && (
              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="font-semibold">Ticket Management</h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Change Status</label>
                  <div className="flex gap-2">
                    <Select
                      value={newStatus}
                      onValueChange={(value) => setNewStatus(value as TicketStatus)}
                      disabled={updating}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableStatuses(ticket.status).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status === "created" && "Created"}
                            {status === "in_progress" && "In Progress"}
                            {status === "completed" && "Completed"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={handleStatusUpdate}
                      disabled={updating || newStatus === ticket.status}
                      className="min-w-[100px]"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Status follows lifecycle: created → in_progress → completed
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
