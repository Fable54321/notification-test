import { Bell, BellOff } from "lucide-react"
import { useEffect, useState } from "react"
import {
  canUsePushNotifications,
  disableAgendaPushNotifications,
  enableAgendaPushNotifications,
  getNotificationPermission,
  hasAgendaPushSubscription,
} from "../../Utils/pushNotifications"

const AgendaNotificationControl = () => {
  const [isSupported, setIsSupported] = useState(true)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const refreshState = async () => {
      const supported = canUsePushNotifications()

      if (!isMounted) return

      setIsSupported(supported)

      if (!supported) {
        setIsEnabled(false)
        return
      }

      setIsEnabled(await hasAgendaPushSubscription())
    }

    refreshState()

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshState()
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      isMounted = false
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [])

  const toggleNotifications = async () => {
    setIsBusy(true)
    setMessage(null)

    try {
      if (isEnabled) {
        await disableAgendaPushNotifications()
        setIsEnabled(false)
        setMessage("Notifications désactivées.")
        return
      }

      await enableAgendaPushNotifications()
      setIsEnabled(true)
      setMessage("Notifications activées.")
    } catch (error) {
      const permission = getNotificationPermission()

      if (permission === "denied") {
        setMessage("Notifications bloquées dans les réglages du navigateur.")
      } else if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage("Impossible d'activer les notifications.")
      }
    } finally {
      setIsBusy(false)
    }
  }

  if (!isSupported) {
    return (
      <p className="col-span-7 mb-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
        Notifications non supportées sur ce navigateur.
      </p>
    )
  }

  return (
    <div className="col-span-7 mb-3 flex flex-wrap items-center justify-between gap-2 rounded border border-gray-200 bg-white px-3 py-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {isEnabled ? (
          <Bell className="h-4 w-4 text-secondary" />
        ) : (
          <BellOff className="h-4 w-4 text-gray-500" />
        )}
        <span>
          {isEnabled ? "Notifications activées" : "Notifications désactivées"}
        </span>
      </div>

      <button
        type="button"
        onClick={toggleNotifications}
        disabled={isBusy}
        className="rounded bg-secondary px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
      >
        {isBusy
          ? "Patientez..."
          : isEnabled
            ? "Désactiver"
            : "Activer"}
      </button>

      {message && (
        <p className="basis-full text-xs font-semibold text-gray-600">
          {message}
        </p>
      )}
    </div>
  )
}

export default AgendaNotificationControl
