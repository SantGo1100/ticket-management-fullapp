"use client"

import { useUser } from "@/lib/user-context"
import { Button } from "@/components/ui/button"
import { RoleBadge } from "@/components/role-badge"
import { LogOut, Ticket } from "lucide-react"
import { useRouter } from "next/navigation"

export function AppHeader() {
  const { user, logout } = useUser()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) return null

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ticket className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">TicketFlow</h1>
        </div>

        <div className="flex items-center gap-4">
          <RoleBadge role={user.role} />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    </header>
  )
}
