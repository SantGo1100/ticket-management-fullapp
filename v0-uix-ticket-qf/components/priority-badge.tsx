import { Badge } from "@/components/ui/badge"
import type { TicketPriority } from "@/lib/types"

interface PriorityBadgeProps {
  priority: TicketPriority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    low: { label: "Low", className: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20" },
    medium: { label: "Medium", className: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" },
    high: { label: "High", className: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
  }

  const { label, className } = config[priority]

  return <Badge className={className}>{label}</Badge>
}
