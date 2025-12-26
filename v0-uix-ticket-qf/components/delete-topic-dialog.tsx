"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

interface DeleteTopicDialogProps {
  open: boolean
  topicName: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export function DeleteTopicDialog({
  open,
  topicName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteTopicDialogProps) {
  const [confirmText, setConfirmText] = useState("")
  const isConfirmed = confirmText.toLowerCase() === "delete"

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm()
      setConfirmText("")
    }
  }

  const handleCancel = () => {
    setConfirmText("")
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Delete Topic</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            This action cannot be undone. This will permanently delete the topic <strong>"{topicName}"</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive font-medium mb-2">Warning</p>
            <p className="text-sm text-destructive/90">
              Deleting this topic will remove it from the system. Existing tickets using this topic will not be affected,
              but you will no longer be able to select this topic when creating new tickets.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <strong className="font-mono">delete</strong> to confirm:
            </Label>
            <Input
              id="confirm-delete"
              type="text"
              placeholder="delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isDeleting}
              autoFocus
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="mr-2">Deleting...</span>
              </>
            ) : (
              "Delete Topic"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


