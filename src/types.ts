type TaskIcon = "shopping" | "call" | "delivery" | "payment" | "reminder"

type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly"

export type CalendarTask = {
  id: string
  date: string
  description: string
  icon: TaskIcon
  recurrence: RecurrenceType
}