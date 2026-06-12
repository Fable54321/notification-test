import { useMemo } from "react"

const Calendar = () => {
  const today = new Date()

  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
    ).getDate()

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)

    // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    const emptyDaysBeforeMonth = (firstDayOfMonth.getDay() + 6) % 7

    const emptyDays = Array.from({ length: emptyDaysBeforeMonth }, () => null)

    const monthDays = Array.from(
      { length: daysInMonth },
      (_, index) => new Date(currentYear, currentMonth, index + 1),
    )

    return [...emptyDays, ...monthDays]
  }, [currentYear, currentMonth])

  return (
    <div className="grid grid-cols-7">
        <h2 className="col-span-7 text-center">{new Date(currentYear, currentMonth).toLocaleString('fr', { month: 'long', year: 'numeric' })}</h2>
      {weekDays.map((day) => (
        <div key={day} className="border border-gray-300 p-2 font-bold bg-secondary text-white">
          <p>{day}</p>
        </div>
      ))}

      {calendarDays.map((date, index) => (
        <div
          key={index}
          className="min-h-20 border border-gray-300 p-2 bg-white"
        >
          {date && <p>{date.getDate()}</p>}
        </div>
      ))}
    </div>
  )
}

export default Calendar