"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface AssigneeIdDialogProps {
  open: boolean
  onConfirm: (assigneeId: number) => void
  onCancel?: () => void
}

export function AssigneeIdDialog({ open, onConfirm, onCancel }: AssigneeIdDialogProps) {
  const [assigneeId, setAssigneeId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleClose = (open: boolean) => {
    if (!open && onCancel) {
      // Dialog is being closed (X button or ESC)
      onCancel()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const id = parseInt(assigneeId.trim(), 10)

    if (!assigneeId.trim()) {
      setError("Assignee ID is required")
      return
    }

    if (isNaN(id) || id <= 0) {
      setError("Assignee ID must be a positive number")
      return
    }

    onConfirm(id)
    setAssigneeId("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Your Assignee ID</DialogTitle>
          <DialogDescription>
            Please enter your Assignee ID. This will be used when you assign tickets to yourself.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assignee-id">Assignee ID</Label>
            <Input
              id="assignee-id"
              type="number"
              placeholder="e.g., 2"
              value={assigneeId}
              onChange={(e) => {
                setAssigneeId(e.target.value)
                setError(null)
              }}
              min="1"
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button type="submit">Confirm</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

