import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useAgenda } from "../../Contexts/AgendaContext"
import greenFlower from "../../assets/flower_no_circle_transparent - Copy.png"
import whiteFlower from "../../assets/flower-alt.png"
import AddTaskToDate, { type NewCalendarTask } from "./AddTaskToDate"
import AgendaNotificationControl from "./AgendaNotificationControl"
import TaskMarker from "./TaskMarker"
import Spinner from "../../Components/Spinner"

type CalendarDayTask = {
  id: string
  description: string
  icon: NewCalendarTask["icon"]
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const Calendar = () => {
  const today = new Date()

  const [displayedDate, setDisplayedDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const {
    agendaError,
    clearAgendaError,
    createTask,
    creatingTask,
    fetchAgendaMonth,
    getOccurrencesForDate,
    loadingMonth,
    tasks: agendaTasks,
  } = useAgenda()

  const currentMonth = displayedDate.getMonth()
  const currentYear = displayedDate.getFullYear()

  useEffect(() => {
    fetchAgendaMonth(currentYear, currentMonth + 1)
  }, [currentMonth, currentYear, fetchAgendaMonth])

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

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

    clearAgendaError()
    setSelectedDate(date)
    setIsAddTaskOpen(false)
  }

  const closeAddTask = () => {
    setIsAddTaskOpen(false)
  }

  const closeSelectedDate = () => {
    setIsAddTaskOpen(false)
    setSelectedDate(null)
  }

  const getTasksForDate = (dateKey: string): CalendarDayTask[] => {
    const occurrenceTasksForDate = getOccurrencesForDate(dateKey).map(
      (occurrence) => ({
        id: `occurrence-${occurrence.id}`,
        description: occurrence.task_description,
        icon: occurrence.task_icon,
      }),
    )

    const directTasksForDate = agendaTasks
      .filter((task) => task.start_date === dateKey)
      .map((task) => ({
        id: `task-${task.id}`,
        description: task.task_description,
        icon: task.task_icon,
      }))

    return occurrenceTasksForDate.length > 0
      ? occurrenceTasksForDate
      : directTasksForDate
  }

  const handleAddTask = async (task: NewCalendarTask) => {
    const createdTask = await createTask({
      task_description: task.description,
      task_icon: task.icon,
      start_date: task.date,
      reminder_time: task.reminderTime,
      recurrence_type: task.recurrence,
      recurrence_interval: 1,
      recurrence_end_date: null,
    })

    return createdTask !== null
  }

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const emptyDaysBeforeMonth = (firstDayOfMonth.getDay() + 6) % 7
    const emptyDays = Array.from({ length: emptyDaysBeforeMonth }, () => null)

    const monthDays = Array.from(
      { length: daysInMonth },
      (_, index) => new Date(currentYear, currentMonth, index + 1),
    )

    const totalCellsBeforeEndPadding = emptyDays.length + monthDays.length
    const emptyDaysAfterMonth = (7 - (totalCellsBeforeEndPadding % 7)) % 7
    const endEmptyDays = Array.from({ length: emptyDaysAfterMonth }, () => null)

    return [...emptyDays, ...monthDays, ...endEmptyDays]
  }, [currentYear, currentMonth])

  if (isAddTaskOpen && selectedDate) {
    return (
      <AddTaskToDate
        errorMessage={agendaError}
        isSubmitting={creatingTask}
        onAddTask={handleAddTask}
        selectedDate={selectedDate}
        onClose={closeAddTask}
      />
    )
  }

  if (selectedDate) {
    const selectedDateKey = formatDateKey(selectedDate)
    const selectedDateTasks = getTasksForDate(selectedDateKey)
    const formattedDate = selectedDate.toLocaleDateString("fr-CA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={closeSelectedDate}
          className="mb-4  font-semibold text-secondary underline"
        >
          Retour
        </button>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-secondary">
              <CalendarDays className="h-5 w-5" />
              <h2 className="text-xl font-bold">Tâches du jour</h2>
            </div>

            <p className="text-sm text-gray-600">
              {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              clearAgendaError()
              setIsAddTaskOpen(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>

        {agendaError && (
          <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {agendaError}
          </p>
        )}

        {selectedDateTasks.length > 0 ? (
          <div className="space-y-2">
            {selectedDateTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-3"
              >
                <TaskMarker icon={task.icon} className="h-5 w-5 shrink-0" />
                <p className="text-sm font-semibold text-gray-800">
                  {task.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-sm font-semibold text-gray-500">
            Aucune tâche pour cette date.
          </p>
        )}
      </div>
    )
  }

  return (
    <>

      

    <div className="relative grid grid-cols-7 overflow-hidden">
      <div className="col-span-7 mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="rounded bg-secondary px-4 py-2 font-bold text-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="text-center mt-2">
          <h2 className="text-2xl font-primary font-bold">{formattedMonthLabel}</h2>

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

      <AgendaNotificationControl />

      

      {agendaError && (
        <p className="col-span-7 mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {agendaError}
        </p>
      )}

   

      {!loadingMonth && weekDays.map((day) => (
        <div
          key={day}
          className="relative overflow-hidden border border-gray-300 bg-secondary p-2 font-bold text-white"
        >
          <p>{day}</p>

          <img
            src={whiteFlower}
            alt="white-flower"
            className="absolute sm:bottom-0 sm:right-0 sm:translate-0 sm:left-auto sm:w-12 sm:-rotate-25 opacity-50 w-8 left-1/2 -translate-x-1/2 -bottom-2"
          />
        </div>
      ))}




      {!loadingMonth && calendarDays.map((date, index) => {
        const dateKey = date ? formatDateKey(date) : null
        const tasksForDate = dateKey ? getTasksForDate(dateKey) : []

        return (
          <button
            key={index}
            type="button"
            disabled={!date}
            onClick={() => handleDateClick(date)}
            className={`flex min-h-40 flex-col items-start justify-start border border-gray-300 p-2 ${
              date ? "bg-white hover:bg-primary/10" : "cursor-default bg-gray-50"
            }`}
          >
            {date && (
              <>
                <p className="mb-2 font-semibold">{date.getDate()}</p>

                <div className="flex flex-wrap gap-1">
                  {tasksForDate.slice(0, 4).map((task) => (
                    <span key={task.id} title={task.description}>
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

   
{!loadingMonth && <img
        src={greenFlower}
        alt="green-flower"
        className="pointer-events-none absolute sm:bottom-0 bottom-1 sm:right-0 sm:left-auto sm:translate-0 left-1/2 -translate-x-1/2 sm:w-100 w-60 sm:-rotate-25 opacity-30"
      />}
      
    </div>

          {loadingMonth && (
         
      <Spinner />
  
      )}

     

    </>
  )
}

export default Calendar
