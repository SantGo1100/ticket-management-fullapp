import { Badge } from "@/components/ui/badge"
import type { TicketStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: TicketStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    created: { label: "Created", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
    in_progress: { label: "In Progress", className: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" },
    completed: { label: "Completed", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
  }

  const { label, className } = config[status]

  return <Badge className={className}>{label}</Badge>
}
