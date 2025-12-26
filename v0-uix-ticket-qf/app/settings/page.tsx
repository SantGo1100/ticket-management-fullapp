"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { fetchTopics, createTopic, updateTopic, deleteTopic } from "@/lib/api"
import type { Topic } from "@/lib/types"
import { ArrowLeft, Plus, Loader2, Edit, Trash2 } from "lucide-react"
import { DeleteTopicDialog } from "@/components/delete-topic-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [newTopicName, setNewTopicName] = useState("")
  const [editTopicName, setEditTopicName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "Only admins can access settings",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    async function loadTopics() {
      setLoading(true)
      try {
        const topicsData = await fetchTopics()
        setTopics(topicsData)
      } catch (error) {
        console.error("[v0] Error loading topics:", error)
        toast({
          title: "Error",
          description: "Failed to load topics",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTopics()
  }, [user, router, toast])

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !newTopicName.trim()) return

    setSubmitting(true)
    try {
      const newTopic = await createTopic({
        name: newTopicName,
        organizationId: user.organizationId,
      })

      setTopics([...topics, newTopic])
      setNewTopicName("")
      setCreateDialogOpen(false)

      toast({
        title: "Success",
        description: "Topic created successfully",
      })
    } catch (error) {
      console.error("[v0] Error creating topic:", error)
      toast({
        title: "Error",
        description: "Failed to create topic",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditTopic = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTopic || !editTopicName.trim()) return

    setSubmitting(true)
    try {
      const updated = await updateTopic(selectedTopic.id, { name: editTopicName })

      setTopics(topics.map((t) => (t.id === updated.id ? updated : t)))
      setEditDialogOpen(false)
      setSelectedTopic(null)

      toast({
        title: "Success",
        description: "Topic updated successfully",
      })
    } catch (error) {
      console.error("[v0] Error updating topic:", error)
      toast({
        title: "Error",
        description: "Failed to update topic",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (topic: Topic) => {
    try {
      const updated = await updateTopic(topic.id, { active: !topic.active })
      setTopics(topics.map((t) => (t.id === updated.id ? updated : t)))

      toast({
        title: "Success",
        description: `Topic ${updated.active ? "enabled" : "disabled"}`,
      })
    } catch (error) {
      console.error("[v0] Error toggling topic:", error)
      toast({
        title: "Error",
        description: "Failed to update topic",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (topic: Topic) => {
    setSelectedTopic(topic)
    setEditTopicName(topic.name)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (topic: Topic) => {
    setSelectedTopic(topic)
    setDeleteDialogOpen(true)
  }

  const handleDeleteTopic = async () => {
    if (!selectedTopic) return

    setDeleting(true)
    try {
      await deleteTopic(selectedTopic.id)
      setTopics(topics.filter((t) => t.id !== selectedTopic.id))
      setDeleteDialogOpen(false)
      setSelectedTopic(null)

      toast({
        title: "Success",
        description: "Topic deleted successfully",
      })
    } catch (error: any) {
      console.error("[v0] Error deleting topic:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete topic",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (!user || user.role !== "admin") return null

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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Topic Management</CardTitle>
                <CardDescription>Create and manage ticket topics for your organization</CardDescription>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Topic
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Topic</DialogTitle>
                    <DialogDescription>Add a new ticket topic for your organization</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTopic} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-topic-name">Topic Name</Label>
                      <Input
                        id="new-topic-name"
                        placeholder="Enter topic name"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Topic"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateDialogOpen(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {topics.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No topics created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topics.map((topic) => (
                  <div key={topic.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{topic.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {topic.id}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`topic-${topic.id}-active`} className="text-sm">
                          {topic.active ? "Enabled" : "Disabled"}
                        </Label>
                        <Switch
                          id={`topic-${topic.id}-active`}
                          checked={topic.active}
                          onCheckedChange={() => handleToggleActive(topic)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(topic)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(topic)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Topic</DialogTitle>
              <DialogDescription>Update the topic name</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditTopic} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-topic-name">Topic Name</Label>
                <Input
                  id="edit-topic-name"
                  placeholder="Enter topic name"
                  value={editTopicName}
                  onChange={(e) => setEditTopicName(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Topic"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <DeleteTopicDialog
          open={deleteDialogOpen}
          topicName={selectedTopic?.name || ""}
          onConfirm={handleDeleteTopic}
          onCancel={() => {
            setDeleteDialogOpen(false)
            setSelectedTopic(null)
          }}
          isDeleting={deleting}
        />
      </main>
    </>
  )
}
