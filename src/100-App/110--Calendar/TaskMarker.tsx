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

const markerColorMap = {
  shopping: "text-rose-600",
  call: "text-sky-600",
  delivery: "text-emerald-600",
  payment: "text-amber-500",
  reminder: "text-fuchsia-600",
}

const TaskMarker = ({ icon, className = "h-4 w-4" }: TaskMarkerProps) => {
  const MarkerIcon = markerIconMap[icon]

  return (
    <MarkerIcon
      aria-hidden="true"
      className={`${markerColorMap[icon]} ${className}`}
      fill="none"
      strokeWidth={3}
    />
  )
}

export default TaskMarker
