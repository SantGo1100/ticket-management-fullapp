"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTicket, fetchTopics } from "@/lib/api"
import { useEffect } from "react"
import type { Topic } from "@/lib/types"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CreateTicketPage() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])

  const [formData, setFormData] = useState({
    requesterName: "",
    title: "", // added title field
    topicId: "",
    priority: "medium",
    description: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    // Pre-fill requester name from user context if requester role
    // This ensures the form shows the stored requester name
    if (user.role === "requester" && user.requesterName) {
      setFormData((prev) => ({
        ...prev,
        requesterName: user.requesterName || "",
      }))
    } else if (user.role !== "requester") {
      // For non-requester roles, allow manual entry
      // Keep the existing formData value
    }

    async function loadTopics() {
      const topicsData = await fetchTopics()
      setTopics(topicsData.filter((t) => t.active))
    }

    loadTopics()
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    // Use requester name from user context for requester role
    const requesterName = user.role === "requester" && user.requesterName 
      ? user.requesterName 
      : formData.requesterName.trim()

    if (!requesterName) {
      toast({
        title: "Error",
        description: "Requester name is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.topicId) {
      toast({
        title: "Error",
        description: "Please select a topic",
        variant: "destructive",
      })
      return
    }

    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Description is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Always use requester name from user context for requester role
      const finalRequesterName = user.role === "requester" && user.requesterName 
        ? user.requesterName 
        : formData.requesterName

      await createTicket({
        requesterName: finalRequesterName,
        title: formData.title, // pass title to API
        topicId: Number.parseInt(formData.topicId),
        priority: formData.priority,
        description: formData.description,
        requesterId: user.id,
      })

      toast({
        title: "Success",
        description: "Ticket created successfully",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("[v0] Error creating ticket:", error)
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <>
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Ticket</CardTitle>
            <CardDescription>Submit a new support ticket for your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="requesterName">
                  Requester Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="requesterName"
                  placeholder="Enter your name"
                  value={user.role === "requester" && user.requesterName ? user.requesterName : formData.requesterName}
                  onChange={(e) => {
                    // Only allow editing if not a requester role
                    if (user.role !== "requester") {
                      setFormData({ ...formData, requesterName: e.target.value })
                    }
                  }}
                  disabled={user.role === "requester"}
                  required
                  className={user.role === "requester" ? "bg-muted cursor-not-allowed" : ""}
                />
                {user.role === "requester" && (
                  <p className="text-xs text-muted-foreground">
                    This field is set based on your requester identity and cannot be changed.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Brief summary of your issue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topicId">
                  Topic <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.topicId}
                  onValueChange={(value) => setFormData({ ...formData, topicId: value })}
                >
                  <SelectTrigger id="topicId">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id.toString()}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your issue or request in detail"
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Ticket"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard")} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
