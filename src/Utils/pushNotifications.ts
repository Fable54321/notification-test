import { fetchWithAuth } from "./fetchWithAuth"

type VapidKeyResponse = {
  publicKey: string
  isConfigured: boolean
}

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index)
  }

  return outputArray
}

export const canUsePushNotifications = () => {
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  )
}

export const getNotificationPermission = () => {
  if (!("Notification" in window)) return "unsupported"

  return Notification.permission
}

export const enableAgendaPushNotifications = async () => {
  if (!canUsePushNotifications()) {
    throw new Error("Les notifications ne sont pas supportées sur cet appareil.")
  }

  const permission = await Notification.requestPermission()

  if (permission !== "granted") {
    throw new Error("Les notifications n'ont pas été autorisées.")
  }

  const vapid = await fetchWithAuth<VapidKeyResponse>(
    "/agenda/notifications/vapid-public-key",
  )

  if (!vapid.isConfigured || !vapid.publicKey) {
    throw new Error("Les notifications ne sont pas configurées sur le serveur.")
  }

  const registration = await navigator.serviceWorker.ready
  const existingSubscription =
    await registration.pushManager.getSubscription()

  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid.publicKey),
    }))

  await fetchWithAuth("/agenda/notifications/subscriptions", {
    method: "POST",
    body: {
      subscription: subscription.toJSON(),
    },
  })

  return subscription
}

export const disableAgendaPushNotifications = async () => {
  if (!canUsePushNotifications()) return

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (!subscription) return

  await fetchWithAuth("/agenda/notifications/subscriptions", {
    method: "DELETE",
    body: {
      endpoint: subscription.endpoint,
    },
  })

  await subscription.unsubscribe()
}

export const hasAgendaPushSubscription = async () => {
  if (!canUsePushNotifications()) return false

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  return Boolean(subscription)
}
