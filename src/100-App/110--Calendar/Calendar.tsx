import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import whiteFlower from "../../assets/flower-alt.png"
import greenFlower from "../../assets/flower_no_circle_transparent - Copy.png"
import AddTaskToDate from "./AddTaskToDate"
import TaskMarker from "./TaskMarker"
import type { CalendarTask } from "../../types"

const Calendar = () => {
  const today = new Date()

  const [displayedDate, setDisplayedDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const currentMonth = displayedDate.getMonth()
  const currentYear = displayedDate.getFullYear()

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  const [tasks, setTasks] = useState<CalendarTask[]>([])

  const monthLabel = displayedDate.toLocaleString("fr-CA", {
    month: "long",
    year: "numeric",
  })

  const formattedMonthLabel =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  const goToPreviousMonth = () => {
    setDisplayedDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setDisplayedDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const goToCurrentMonth = () => {
    setDisplayedDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  const handleDateClick = (date: Date | null) => {
    if (!date) return

    setSelectedDate(date)
    setIsAddTaskOpen(true)
  }

  const closeAddTask = () => {
    setIsAddTaskOpen(false)
    setSelectedDate(null)
  }

  const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const handleAddTask = (task: CalendarTask) => {
  setTasks((currentTasks) => [...currentTasks, task])
}

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
    ).getDate()

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)

    const emptyDaysBeforeMonth = (firstDayOfMonth.getDay() + 6) % 7

    const emptyDays = Array.from({ length: emptyDaysBeforeMonth }, () => null)

    const monthDays = Array.from(
      { length: daysInMonth },
      (_, index) => new Date(currentYear, currentMonth, index + 1),
    )

    const totalCellsBeforeEndPadding = emptyDays.length + monthDays.length

    const emptyDaysAfterMonth =
      (7 - (totalCellsBeforeEndPadding % 7)) % 7

    const endEmptyDays = Array.from({ length: emptyDaysAfterMonth }, () => null)

    return [...emptyDays, ...monthDays, ...endEmptyDays]
  }, [currentYear, currentMonth])

  if (isAddTaskOpen && selectedDate) {
    return (
      <AddTaskToDate
        onAddTask={handleAddTask}
        selectedDate={selectedDate}
        onClose={closeAddTask}
      />
    )
  }

  return (
    <div className="relative grid grid-cols-7 overflow-hidden">
      <div className="col-span-7 mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="rounded bg-secondary px-4 py-2 font-bold text-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold">{formattedMonthLabel}</h2>

          <button
            type="button"
            onClick={goToCurrentMonth}
            className="mt-1 text-sm underline"
          >
            Aujourd&apos;hui
          </button>
        </div>

        <button
          type="button"
          onClick={goToNextMonth}
          className="rounded bg-secondary px-4 py-2 font-bold text-white"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {weekDays.map((day) => (
        <div
          key={day}
          className="relative overflow-hidden border border-gray-300 bg-secondary p-2 font-bold text-white"
        >
          <p>{day}</p>

          <img
            src={whiteFlower}
            alt="white-flower"
            className="absolute sm:bottom-0 sm:right-0 sm:w-12 sm:-rotate-25 opacity-50 w-8 left-1/2 -translate-x-1/2 -bottom-2"
          />
        </div>
      ))}

     {calendarDays.map((date, index) => {
  const dateKey = date ? formatDateKey(date) : null

  const tasksForDate = dateKey
    ? tasks.filter((task) => task.date === dateKey)
    : []

  return (
    <button
      key={index}
      type="button"
      disabled={!date}
      onClick={() => handleDateClick(date)}
      className={`flex min-h-40 flex-col items-start justify-start border border-gray-300 p-2 ${
        date
          ? "bg-white hover:bg-primary/10"
          : "cursor-default bg-gray-50"
      }`}
    >
      {date && (
        <>
          <p className="mb-2 font-semibold">{date.getDate()}</p>

          <div className="flex flex-wrap gap-1">
            {tasksForDate.slice(0, 4).map((task) => (
              <span
                key={task.id}
                title="Tâche planifiée"
              >
                <TaskMarker icon={task.icon} className="h-5 w-5" />
              </span>
            ))}

            {tasksForDate.length > 4 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 px-1 text-xs font-bold text-gray-700">
                +{tasksForDate.length - 4}
              </span>
            )}
          </div>
        </>
      )}
    </button>
  )
})}

      <img
        src={greenFlower}
        alt="green-flower"
        className="pointer-events-none absolute sm:bottom-0 bottom-1 sm:right-0 left-1/2 -translate-x-1/2 sm:w-100 w-60 sm:-rotate-25 opacity-30"
      />
    </div>
  )
}

export default Calendar
