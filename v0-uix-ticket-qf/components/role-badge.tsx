import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/lib/types"

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const variants = {
    requester: "default",
    assignee: "secondary",
    admin: "outline",
  } as const

  const labels = {
    requester: "Requester",
    assignee: "Assignee",
    admin: "Admin",
  }

  return <Badge variant={variants[role]}>{labels[role]}</Badge>
}
