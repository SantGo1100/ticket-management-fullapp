"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AssigneeIdDialog } from "@/components/assignee-id-dialog"
import { RequesterNameDialog } from "@/components/requester-name-dialog"
import { useUser } from "@/lib/user-context"
import type { UserRole } from "@/lib/types"
import { UserCircle, Shield, Users, Ticket } from "lucide-react"

export default function RoleSelectionPage() {
  const router = useRouter()
  const { setUser } = useUser()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [showAssigneeIdDialog, setShowAssigneeIdDialog] = useState(false)
  const [showRequesterNameDialog, setShowRequesterNameDialog] = useState(false)
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null)

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)

    // Mock user IDs based on role
    const userIds = {
      requester: 1,
      assignee: 2,
      admin: 3,
    }

    // If assignee, prompt for Assignee ID first
    if (role === "assignee") {
      setPendingRole(role)
      setShowAssigneeIdDialog(true)
    } else if (role === "requester") {
      // If requester, prompt for Requester Name first
      setPendingRole(role)
      setShowRequesterNameDialog(true)
    } else {
      // For admin role, set user and navigate immediately
      setUser({
        id: userIds[role],
        role,
        organizationId: 1,
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    }
  }

  const handleAssigneeIdConfirm = (assigneeId: number) => {
    if (pendingRole) {
      const userIds = {
        requester: 1,
        assignee: 2,
        admin: 3,
      }

      setUser({
        id: userIds[pendingRole],
        role: pendingRole,
        organizationId: 1,
        assigneeId,
      })

      setShowAssigneeIdDialog(false)
      setPendingRole(null)

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    }
  }

  const handleRequesterNameConfirm = (requesterName: string) => {
    if (pendingRole === "requester") {
      const userIds = {
        requester: 1,
        assignee: 2,
        admin: 3,
      }

      setUser({
        id: userIds.requester,
        role: "requester",
        organizationId: 1,
        requesterName,
      })

      setShowRequesterNameDialog(false)
      setPendingRole(null)

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    }
  }

  const handleRequesterNameCancel = () => {
    // Reset state when dialog is closed without confirming
    setShowRequesterNameDialog(false)
    setPendingRole(null)
    setSelectedRole(null)
  }

  const handleAssigneeIdCancel = () => {
    // Reset state when dialog is closed without confirming
    setShowAssigneeIdDialog(false)
    setPendingRole(null)
    setSelectedRole(null)
  }

  const roles = [
    {
      role: "requester" as UserRole,
      icon: UserCircle,
      title: "Requester",
      description: "Create and track your support tickets",
      features: ["Create new tickets", "View your tickets", "Track ticket status"],
    },
    {
      role: "assignee" as UserRole,
      icon: Users,
      title: "Assignee",
      description: "Manage and resolve support tickets",
      features: ["View all tickets", "Assign tickets to yourself", "Update ticket status"],
    },
    {
      role: "admin" as UserRole,
      icon: Shield,
      title: "Admin",
      description: "Full access to manage the system",
      features: ["All assignee permissions", "Manage ticket topics", "Full system visibility"],
    },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ticket className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">TicketFlow</h1>
          </div>
          <p className="text-muted-foreground text-lg">Select your role to continue</p>
          <p className="text-sm text-muted-foreground mt-2">Demo mode - No authentication required</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map(({ role, icon: Icon, title, description, features }) => (
            <Card
              key={role}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === role ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleRoleSelect(role)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6" variant={selectedRole === role ? "default" : "outline"}>
                  Enter as {title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AssigneeIdDialog
        open={showAssigneeIdDialog}
        onConfirm={handleAssigneeIdConfirm}
        onCancel={handleAssigneeIdCancel}
      />

      <RequesterNameDialog
        open={showRequesterNameDialog}
        onConfirm={handleRequesterNameConfirm}
        onCancel={handleRequesterNameCancel}
      />
    </div>
  )
}
