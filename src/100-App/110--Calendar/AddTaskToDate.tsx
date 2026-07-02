import {
  CalendarDays,
} from "lucide-react"
import { useState } from "react"
import TaskMarker from "./TaskMarker"
import type { CalendarTask } from "../../types"

type TaskIcon = CalendarTask["icon"]
type RecurrenceType = CalendarTask["recurrence"]

type AddTaskToDateProps = {
  selectedDate: Date
  onClose: () => void
  onAddTask: (task: CalendarTask) => void
}

const iconOptions: {
  value: TaskIcon
}[] = [
  {
    value: "shopping",
  },
  {
    value: "call",
  },
  {
    value: "delivery",
  },
  {
    value: "payment",
  },
  {
    value: "reminder",
  },
]

const recurrenceOptions: {
  value: RecurrenceType
  label: string
}[] = [
  {
    value: "none",
    label: "Non récurrente",
  },
  {
    value: "daily",
    label: "Chaque jour",
  },
  {
    value: "weekly",
    label: "Chaque semaine",
  },
  {
    value: "monthly",
    label: "Chaque mois",
  },
  {
    value: "yearly",
    label: "Chaque année",
  },
]

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const AddTaskToDate = ({
  selectedDate,
  onClose,
  onAddTask,
}: AddTaskToDateProps) => {
  const [description, setDescription] = useState("")
  const [selectedIcon, setSelectedIcon] = useState<TaskIcon>("reminder")
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none")

  const formattedDate = selectedDate.toLocaleDateString("fr-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedDescription = description.trim()

    if (!trimmedDescription) return

    onAddTask({
      id: crypto.randomUUID(),
      date: formatDateKey(selectedDate),
      description: trimmedDescription,
      icon: selectedIcon,
      recurrence,
    })

    onClose()
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={onClose}
        className="mb-4 text-sm font-semibold text-secondary underline"
      >
        Retour
      </button>

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-secondary">
          <CalendarDays className="h-5 w-5" />
          <h2 className="text-xl font-bold">Ajouter une tâche</h2>
        </div>

        <p className="text-sm text-gray-600">
          {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Description courte
          </label>

          <input
            id="description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={60}
            placeholder="Ex: Appeler le fournisseur"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-secondary"
          />

          <p className="mt-1 text-xs text-gray-500">
            {description.length}/60 caractères
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">
            Icône
          </p>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {iconOptions.map(({ value }) => {
              const isSelected = selectedIcon === value

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedIcon(value)}
                  className={`flex aspect-square items-center justify-center rounded-lg border p-3 transition ${
                    isSelected
                      ? "border-secondary bg-white ring-2 ring-secondary"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <TaskMarker icon={value} className="h-6 w-6" />
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">
            Récurrence
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            {recurrenceOptions.map((option) => {
              const isSelected = recurrence === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRecurrence(option.value)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? "border-secondary bg-secondary text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold"
          >
            Annuler
          </button>

          <button
            type="submit"
            className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            disabled={!description.trim()}
          >
            Ajouter
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddTaskToDate
