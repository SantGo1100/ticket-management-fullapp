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

interface RequesterNameDialogProps {
  open: boolean
  onConfirm: (requesterName: string) => void
  onCancel?: () => void
}

export function RequesterNameDialog({ open, onConfirm, onCancel }: RequesterNameDialogProps) {
  const [requesterName, setRequesterName] = useState("")
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

    const trimmedName = requesterName.trim()

    if (!trimmedName) {
      setError("Requester name is required")
      return
    }

    if (trimmedName.length < 2) {
      setError("Requester name must be at least 2 characters")
      return
    }

    onConfirm(trimmedName)
    setRequesterName("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Your Requester Name</DialogTitle>
          <DialogDescription>
            Please enter your name. This will be used as your identity when creating tickets.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requester-name">Requester Name</Label>
            <Input
              id="requester-name"
              type="text"
              placeholder="e.g., John Doe"
              value={requesterName}
              onChange={(e) => {
                setRequesterName(e.target.value)
                setError(null)
              }}
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


