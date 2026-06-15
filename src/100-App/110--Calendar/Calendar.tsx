import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import AddTaskToDate from "./AddTaskToDate"

const Calendar = () => {
  const today = new Date()

  const [displayedDate, setDisplayedDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(true)

  const currentMonth = displayedDate.getMonth()
  const currentYear = displayedDate.getFullYear()

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  const monthLabel = displayedDate.toLocaleString("fr-CA", {
    month: "long",
    year: "numeric",
  })

  const formattedMonthLabel =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  const goToPreviousMonth = () => {
    setDisplayedDate(
      new Date(currentYear, currentMonth - 1, 1),
    )
  }

  const goToNextMonth = () => {
    setDisplayedDate(
      new Date(currentYear, currentMonth + 1, 1),
    )
  }

  const goToCurrentMonth = () => {
    setDisplayedDate(
      new Date(today.getFullYear(), today.getMonth(), 1),
    )
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


if (!isAddTaskOpen) {
  


  return (
    <div className="grid grid-cols-7">
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
          className="border border-gray-300 bg-secondary p-2 font-bold text-white"
        >
          <p>{day}</p>
        </div>
      ))}

      {calendarDays.map((date, index) => (
        <div
          key={index}
          className="min-h-40 border border-gray-300 bg-white p-2"
        >
          {date && <p>{date.getDate()}</p>}
        </div>
      ))}
    </div>
  )
}

else {
  return (
    <AddTaskToDate />
  )
}


}

export default Calendar