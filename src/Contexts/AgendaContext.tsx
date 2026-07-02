import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { fetchWithAuth } from "../Utils/fetchWithAuth"

export type AgendaTaskIcon =
  | "shopping"
  | "call"
  | "delivery"
  | "payment"
  | "reminder"

export type AgendaRecurrenceType =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"

export type AgendaOccurrenceStatus =
  | "pending"
  | "notified"
  | "snoozed"
  | "completed"
  | "dismissed"

export type AgendaTask = {
  id: number
  user_id: number
  task_description: string
  task_icon: AgendaTaskIcon
  start_date: string
  reminder_time: string | null
  recurrence_type: AgendaRecurrenceType
  recurrence_interval: number
  recurrence_end_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AgendaOccurrence = {
  id: number
  task_id: number
  occurrence_date: string
  status: AgendaOccurrenceStatus
  scheduled_for: string
  next_reminder_at: string
  notified_at: string | null
  completed_at: string | null
  dismissed_at: string | null
  snooze_count: number
  last_snoozed_at: string | null

  task_description: string
  task_icon: AgendaTaskIcon
  start_date?: string
  reminder_time?: string | null
  recurrence_type?: AgendaRecurrenceType
  recurrence_interval?: number
  recurrence_end_date?: string | null
  user_id?: number
}

export type CreateAgendaTaskPayload = {
  task_description: string
  task_icon: AgendaTaskIcon
  start_date: string
  reminder_time?: string | null
  recurrence_type?: AgendaRecurrenceType
  recurrence_interval?: number
  recurrence_end_date?: string | null
}

export type UpdateAgendaTaskPayload = Partial<{
  task_description: string
  task_icon: AgendaTaskIcon
  start_date: string
  reminder_time: string | null
  recurrence_type: AgendaRecurrenceType
  recurrence_interval: number
  recurrence_end_date: string | null
  is_active: boolean
}>

export type SnoozeOccurrencePayload =
  | {
      snooze_type: "minutes"
      minutes: number
    }
  | {
      snooze_type: "tomorrow"
    }

type AgendaMonthResponse = {
  tasks: AgendaTask[]
  occurrences: AgendaOccurrence[]
}

type AgendaTaskResponse = {
  task: AgendaTask
}

type AgendaOccurrenceResponse = {
  occurrence: AgendaOccurrence
}

type DueOccurrencesResponse = {
  due_occurrences: AgendaOccurrence[]
}

type AgendaContextValue = {
  tasks: AgendaTask[]
  occurrences: AgendaOccurrence[]
  dueOccurrences: AgendaOccurrence[]

  selectedYear: number | null
  selectedMonth: number | null

  loadingMonth: boolean
  creatingTask: boolean
  updatingTaskId: number | null
  deletingTaskId: number | null
  updatingOccurrenceId: number | null
  loadingDueOccurrences: boolean

  agendaError: string | null
  clearAgendaError: () => void

  fetchAgendaMonth: (year: number, month: number) => Promise<void>
  createTask: (payload: CreateAgendaTaskPayload) => Promise<AgendaTask | null>
  updateTask: (
    taskId: number,
    payload: UpdateAgendaTaskPayload,
  ) => Promise<AgendaTask | null>
  deleteTask: (taskId: number) => Promise<boolean>

  completeOccurrence: (
    occurrenceId: number,
  ) => Promise<AgendaOccurrence | null>
  dismissOccurrence: (
    occurrenceId: number,
  ) => Promise<AgendaOccurrence | null>
  snoozeOccurrence: (
    occurrenceId: number,
    payload: SnoozeOccurrencePayload,
  ) => Promise<AgendaOccurrence | null>
  rescheduleOccurrence: (
    occurrenceId: number,
    nextReminderAt: string,
  ) => Promise<AgendaOccurrence | null>
  markOccurrenceNotified: (
    occurrenceId: number,
  ) => Promise<AgendaOccurrence | null>

  fetchDueOccurrences: () => Promise<AgendaOccurrence[]>
  getOccurrencesForDate: (dateKey: string) => AgendaOccurrence[]
}

const AgendaContext = createContext<AgendaContextValue | null>(null)

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export const AgendaProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<AgendaTask[]>([])
  const [occurrences, setOccurrences] = useState<AgendaOccurrence[]>([])
  const [dueOccurrences, setDueOccurrences] = useState<AgendaOccurrence[]>([])

  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  const [loadingMonth, setLoadingMonth] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
  const [updatingOccurrenceId, setUpdatingOccurrenceId] =
    useState<number | null>(null)
  const [loadingDueOccurrences, setLoadingDueOccurrences] = useState(false)

  const [agendaError, setAgendaError] = useState<string | null>(null)

  const clearAgendaError = useCallback(() => {
    setAgendaError(null)
  }, [])

  const replaceTask = useCallback((updatedTask: AgendaTask) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    )
  }, [])

  const replaceOccurrence = useCallback(
    (updatedOccurrence: AgendaOccurrence) => {
      setOccurrences((currentOccurrences) =>
        currentOccurrences.map((occurrence) =>
          occurrence.id === updatedOccurrence.id
            ? {
                ...occurrence,
                ...updatedOccurrence,
              }
            : occurrence,
        ),
      )

      setDueOccurrences((currentOccurrences) =>
        currentOccurrences.map((occurrence) =>
          occurrence.id === updatedOccurrence.id
            ? {
                ...occurrence,
                ...updatedOccurrence,
              }
            : occurrence,
        ),
      )
    },
    [],
  )

  const fetchAgendaMonth = useCallback(async (year: number, month: number) => {
    setLoadingMonth(true)
    setAgendaError(null)

    try {
      const data = await fetchWithAuth<AgendaMonthResponse>(
        `/agenda/month?year=${year}&month=${month}`,
      )

      setTasks(data.tasks)
      setOccurrences(data.occurrences)
      setSelectedYear(year)
      setSelectedMonth(month)
    } catch (error) {
      setAgendaError(
        getErrorMessage(error, "Impossible de charger l'agenda."),
      )
    } finally {
      setLoadingMonth(false)
    }
  }, [])

  const createTask = useCallback(
    async (payload: CreateAgendaTaskPayload) => {
      setCreatingTask(true)
      setAgendaError(null)

      try {
        const data = await fetchWithAuth<AgendaTaskResponse>("/agenda/tasks", {
          method: "POST",
          body: payload,
        })

        setTasks((currentTasks) => [...currentTasks, data.task])

        if (selectedYear && selectedMonth) {
          await fetchAgendaMonth(selectedYear, selectedMonth)
        }

        return data.task
      } catch (error) {
        setAgendaError(
          getErrorMessage(error, "Impossible de créer la tâche."),
        )
        return null
      } finally {
        setCreatingTask(false)
      }
    },
    [fetchAgendaMonth, selectedMonth, selectedYear],
  )

  const updateTask = useCallback(
    async (taskId: number, payload: UpdateAgendaTaskPayload) => {
      setUpdatingTaskId(taskId)
      setAgendaError(null)

      try {
        const data = await fetchWithAuth<AgendaTaskResponse>(
          `/agenda/tasks/${taskId}`,
          {
            method: "PATCH",
            body: payload,
          },
        )

        replaceTask(data.task)

        if (selectedYear && selectedMonth) {
          await fetchAgendaMonth(selectedYear, selectedMonth)
        }

        return data.task
      } catch (error) {
        setAgendaError(
          getErrorMessage(error, "Impossible de modifier la tâche."),
        )
        return null
      } finally {
        setUpdatingTaskId(null)
      }
    },
    [fetchAgendaMonth, replaceTask, selectedMonth, selectedYear],
  )

  const deleteTask = useCallback(async (taskId: number) => {
    setDeletingTaskId(taskId)
    setAgendaError(null)

    try {
      await fetchWithAuth<{ message: string }>(`/agenda/tasks/${taskId}`, {
        method: "DELETE",
      })

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      )

      setOccurrences((currentOccurrences) =>
        currentOccurrences.filter(
          (occurrence) => occurrence.task_id !== taskId,
        ),
      )

      setDueOccurrences((currentOccurrences) =>
        currentOccurrences.filter(
          (occurrence) => occurrence.task_id !== taskId,
        ),
      )

      return true
    } catch (error) {
      setAgendaError(
        getErrorMessage(error, "Impossible de supprimer la tâche."),
      )
      return false
    } finally {
      setDeletingTaskId(null)
    }
  }, [])

  const updateOccurrenceFromRoute = useCallback(
    async (
      occurrenceId: number,
      route: string,
      options?: Parameters<typeof fetchWithAuth>[1],
    ) => {
      setUpdatingOccurrenceId(occurrenceId)
      setAgendaError(null)

      try {
        const data = await fetchWithAuth<AgendaOccurrenceResponse>(
          route,
          options,
        )

        replaceOccurrence(data.occurrence)

        return data.occurrence
      } catch (error) {
        setAgendaError(
          getErrorMessage(error, "Impossible de modifier le rappel."),
        )
        return null
      } finally {
        setUpdatingOccurrenceId(null)
      }
    },
    [replaceOccurrence],
  )

  const completeOccurrence = useCallback(
    async (occurrenceId: number) => {
      return updateOccurrenceFromRoute(
        occurrenceId,
        `/agenda/occurrences/${occurrenceId}/complete`,
        {
          method: "PATCH",
        },
      )
    },
    [updateOccurrenceFromRoute],
  )

  const dismissOccurrence = useCallback(
    async (occurrenceId: number) => {
      return updateOccurrenceFromRoute(
        occurrenceId,
        `/agenda/occurrences/${occurrenceId}/dismiss`,
        {
          method: "PATCH",
        },
      )
    },
    [updateOccurrenceFromRoute],
  )

  const snoozeOccurrence = useCallback(
    async (
      occurrenceId: number,
      payload: SnoozeOccurrencePayload,
    ) => {
      return updateOccurrenceFromRoute(
        occurrenceId,
        `/agenda/occurrences/${occurrenceId}/snooze`,
        {
          method: "PATCH",
          body: payload,
        },
      )
    },
    [updateOccurrenceFromRoute],
  )

  const rescheduleOccurrence = useCallback(
    async (occurrenceId: number, nextReminderAt: string) => {
      return updateOccurrenceFromRoute(
        occurrenceId,
        `/agenda/occurrences/${occurrenceId}/reschedule`,
        {
          method: "PATCH",
          body: {
            next_reminder_at: nextReminderAt,
          },
        },
      )
    },
    [updateOccurrenceFromRoute],
  )

  const markOccurrenceNotified = useCallback(
    async (occurrenceId: number) => {
      return updateOccurrenceFromRoute(
        occurrenceId,
        `/agenda/occurrences/${occurrenceId}/notified`,
        {
          method: "PATCH",
        },
      )
    },
    [updateOccurrenceFromRoute],
  )

  const fetchDueOccurrences = useCallback(async () => {
    setLoadingDueOccurrences(true)
    setAgendaError(null)

    try {
      const data = await fetchWithAuth<DueOccurrencesResponse>("/agenda/due")

      setDueOccurrences(data.due_occurrences)

      return data.due_occurrences
    } catch (error) {
      setAgendaError(
        getErrorMessage(error, "Impossible de charger les rappels dus."),
      )
      return []
    } finally {
      setLoadingDueOccurrences(false)
    }
  }, [])

  const getOccurrencesForDate = useCallback(
    (dateKey: string) => {
      return occurrences.filter(
        (occurrence) => occurrence.occurrence_date === dateKey,
      )
    },
    [occurrences],
  )

  const value = useMemo<AgendaContextValue>(
    () => ({
      tasks,
      occurrences,
      dueOccurrences,

      selectedYear,
      selectedMonth,

      loadingMonth,
      creatingTask,
      updatingTaskId,
      deletingTaskId,
      updatingOccurrenceId,
      loadingDueOccurrences,

      agendaError,
      clearAgendaError,

      fetchAgendaMonth,
      createTask,
      updateTask,
      deleteTask,

      completeOccurrence,
      dismissOccurrence,
      snoozeOccurrence,
      rescheduleOccurrence,
      markOccurrenceNotified,

      fetchDueOccurrences,
      getOccurrencesForDate,
    }),
    [
      tasks,
      occurrences,
      dueOccurrences,
      selectedYear,
      selectedMonth,
      loadingMonth,
      creatingTask,
      updatingTaskId,
      deletingTaskId,
      updatingOccurrenceId,
      loadingDueOccurrences,
      agendaError,
      clearAgendaError,
      fetchAgendaMonth,
      createTask,
      updateTask,
      deleteTask,
      completeOccurrence,
      dismissOccurrence,
      snoozeOccurrence,
      rescheduleOccurrence,
      markOccurrenceNotified,
      fetchDueOccurrences,
      getOccurrencesForDate,
    ],
  )

  return (
    <AgendaContext.Provider value={value}>
      {children}
    </AgendaContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAgenda = () => {
  const context = useContext(AgendaContext)

  if (!context) {
    throw new Error("useAgenda must be used inside an AgendaProvider")
  }

  return context
}