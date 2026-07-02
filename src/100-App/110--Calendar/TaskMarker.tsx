import {
  Circle,
  Diamond,
  Hexagon,
  Square,
  Triangle,
} from "lucide-react"
import type { CalendarTask } from "../../types"

type TaskIcon = CalendarTask["icon"]

type TaskMarkerProps = {
  icon: TaskIcon
  className?: string
}

const markerIconMap = {
  shopping: Circle,
  call: Square,
  delivery: Diamond,
  payment: Triangle,
  reminder: Hexagon,
}

const TaskMarker = ({ icon, className = "h-4 w-4" }: TaskMarkerProps) => {
  const MarkerIcon = markerIconMap[icon]

  return (
    <MarkerIcon
      aria-hidden="true"
      className={className}
      fill="none"
      strokeWidth={2.5}
    />
  )
}

export default TaskMarker
