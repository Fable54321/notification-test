import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type Reminder = {
  id: string
  title: string
  dueAt: string
  createdAt: string
}

const STORAGE_KEY = 'reminder-test-app'

function nowLocalDateTime() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

function App() {
  const [title, setTitle] = useState('')
  const [dueAt, setDueAt] = useState(nowLocalDateTime())
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied',
  )
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false)
  const timers = useRef<Record<string, number>>({})

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Reminder[]
        setReminders(parsed)
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
    Object.values(timers.current).forEach((timer) => window.clearTimeout(timer))
    timers.current = {}

    reminders.forEach((reminder) => {
      const dueDate = new Date(reminder.dueAt)
      const delay = dueDate.getTime() - Date.now()
      const timerId = window.setTimeout(() => {
        void triggerNotification(reminder)
        setReminders((current) => current.filter((item) => item.id !== reminder.id))
      }, Math.max(delay, 0))
      timers.current[reminder.id] = timerId

      if (delay <= 0) {
        window.clearTimeout(timerId)
        void triggerNotification(reminder)
        setReminders((current) => current.filter((item) => item.id !== reminder.id))
      }
    })

    return () => {
      Object.values(timers.current).forEach((timer) => window.clearTimeout(timer))
      timers.current = {}
    }
  }, [reminders])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    navigator.serviceWorker.ready.then(() => setServiceWorkerReady(true))
  }, [])

  const sortedReminders = useMemo(
    () => [...reminders].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
    [reminders],
  )

  const addReminder = () => {
    const dueDate = new Date(dueAt)
    if (!title.trim()) {
      return
    }
    if (isNaN(dueDate.getTime())) {
      return
    }
    if (dueDate.getTime() <= Date.now()) {
      alert('Please choose a future date and time for the reminder.')
      return
    }

    const reminder: Reminder = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: title.trim(),
      dueAt: dueDate.toISOString(),
      createdAt: new Date().toISOString(),
    }

    setReminders((current) => [...current, reminder])
    setTitle('')
    setDueAt(nowLocalDateTime())
  }

  const removeReminder = (id: string) => {
    setReminders((current) => current.filter((item) => item.id !== id))
  }

  const clearAll = () => {
    setReminders([])
  }

  const requestPermission = () => {
    if (!('Notification' in window)) {
      return
    }
    Notification.requestPermission().then((result) => setPermission(result))
  }

  const sendTestNotification = () => {
    void triggerNotification({
      id: `test-${Date.now()}`,
      title: 'This is a test notification from the installed web app.',
      dueAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Reminder app</p>
          <h1>Quick reminders</h1>
          <p className="intro">
            Set reminders in your browser and receive a notification at the scheduled time. Works best when the page stays open and notifications are allowed.
          </p>
        </div>
        <div className="status-row">
          <div className="status-pill">
            <strong>Notification</strong>
            <span>{permission === 'granted' ? 'Allowed' : permission === 'denied' ? 'Denied' : 'Ask to allow'}</span>
          </div>
          <div className="status-pill">
            <strong>Service worker</strong>
            <span>{serviceWorkerReady ? 'Ready' : 'Starting'}</span>
          </div>
          {permission !== 'granted' && (
            <button type="button" className="action-button" onClick={requestPermission}>
              Enable notifications
            </button>
          )}
          {permission === 'granted' && (
            <button type="button" className="action-button" onClick={sendTestNotification}>
              Send test notification
            </button>
          )}
        </div>
      </section>

      <section className="form-card">
        <h2>Schedule a reminder</h2>
        <div className="form-grid">
          <label>
            Reminder text
            <input
              type="text"
              value={title}
              placeholder="Call mom, take medicine, meeting..."
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label>
            Date & time
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
          </label>
        </div>
        <button type="button" className="primary-button" onClick={addReminder}>
          Add reminder
        </button>
      </section>

      <section className="list-card">
        <div className="list-header">
          <div>
            <h2>Upcoming reminders</h2>
            <p>{sortedReminders.length} reminder{sortedReminders.length === 1 ? '' : 's'} scheduled</p>
          </div>
          {sortedReminders.length > 0 && (
            <button type="button" className="text-button" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
        {sortedReminders.length === 0 ? (
          <p className="empty-state">No reminders yet. Add one to test notifications.</p>
        ) : (
          <ul className="reminder-list">
            {sortedReminders.map((reminder) => {
              const dueDate = new Date(reminder.dueAt)
              return (
                <li key={reminder.id} className="reminder-item">
                  <div>
                    <p className="reminder-title">{reminder.title}</p>
                    <p className="reminder-time">{dueDate.toLocaleString()}</p>
                  </div>
                  <button type="button" className="remove-button" onClick={() => removeReminder(reminder.id)}>
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}

async function triggerNotification(reminder: Reminder) {
  const title = 'Reminder'
  const body = reminder.title
  if ('Notification' in window && Notification.permission === 'granted') {
    const options: NotificationOptions & { vibrate?: number[] } = {
      body,
      tag: reminder.id,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      data: {
        url: '/',
      },
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, options)
    } else {
      new Notification(title, options)
    }
  } else {
    alert(`Reminder: ${reminder.title}`)
  }
}

export default App
