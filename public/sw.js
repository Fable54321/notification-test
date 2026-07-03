self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

const getNotificationUrl = (data) => {
  if (data && typeof data.url === 'string') {
    return data.url
  }

  return '/'
}

const getAgendaApiUrl = (data, path) => {
  const apiBaseUrl =
    data && typeof data.apiBaseUrl === 'string'
      ? data.apiBaseUrl.replace(/\/$/, '')
      : ''

  return `${apiBaseUrl}${path}`
}

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Rappel agenda'

  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || 'Une tâche est due.',
      icon: '/calendar.png',
      badge: '/calendar.png',
      tag: data.tag || `agenda-occurrence-${data.occurrenceId || Date.now()}`,
      data,
      requireInteraction: true,
      actions: [
        {
          action: 'snooze-10',
          title: '10 min',
        },
        {
          action: 'complete',
          title: 'Terminer',
        },
      ],
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  const data = event.notification.data || {}

  event.notification.close()

  if (event.action === 'snooze-10' && data.occurrenceId) {
    event.waitUntil(
      fetch(getAgendaApiUrl(data, `/agenda/occurrences/${data.occurrenceId}/snooze`), {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snooze_type: 'minutes',
          minutes: 10,
        }),
      }),
    )
    return
  }

  if (event.action === 'complete' && data.occurrenceId) {
    event.waitUntil(
      fetch(getAgendaApiUrl(data, `/agenda/occurrences/${data.occurrenceId}/complete`), {
        method: 'PATCH',
        credentials: 'include',
      }),
    )
    return
  }

  const targetUrl = getNotificationUrl(data)

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && client.url.includes(self.location.origin)) {
          if ('navigate' in client) {
            client.navigate(targetUrl)
          }

          return client.focus()
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    }),
  )
})
