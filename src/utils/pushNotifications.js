import { notificationService } from '../services/notificationService'
import { isIos } from './platform'

// Phone notifications via the Web Push API. The service worker (public/sw.js)
// receives the push and shows it; this module handles permission and keeps the
// backend's copy of this device's subscription up to date.

export const isStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

export const isPushSupported = () =>
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

// iOS only exposes PushManager to a site added to the Home Screen (iOS 16.4+),
// so in a normal Safari tab the right advice is "install first", not "unsupported".
export const needsInstallForPush = () => isIos() && !isStandalone() && !isPushSupported()

export const getPushPermission = () => (isPushSupported() ? Notification.permission : 'unsupported')

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = window.atob(base64)
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

// `serviceWorker.ready` never settles if registration failed (index.html
// swallows that error), so cap the wait rather than leave a button spinning.
const getReadyRegistration = () => Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker not available')), 10000)),
])

const getExistingSubscription = async () => {
    const registration = await navigator.serviceWorker.getRegistration()
    return registration ? registration.pushManager.getSubscription() : null
}

const getOrCreateSubscription = async () => {
    const registration = await getReadyRegistration()
    const existing = await registration.pushManager.getSubscription()
    if (existing) return existing

    const res = await notificationService.getPushPublicKey()
    return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(res.data.data.publicKey),
    })
}

/**
 * Ask for permission and subscribe this device. Must be called from a tap —
 * browsers (iOS especially) refuse permission prompts that aren't user-initiated.
 * Returns the resulting permission: 'granted' | 'denied' | 'default' | 'unsupported'.
 */
export const enablePush = async () => {
    if (!isPushSupported()) return 'unsupported'

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return permission

    const subscription = await getOrCreateSubscription()
    await notificationService.subscribePush(subscription.toJSON())
    return permission
}

/**
 * Re-register silently when permission was already granted — run on every
 * sign-in so a rotated subscription, or a different account on the same phone,
 * stays in sync with the backend.
 */
export const syncPushSubscription = async () => {
    if (getPushPermission() !== 'granted') return
    try {
        const subscription = await getOrCreateSubscription()
        await notificationService.subscribePush(subscription.toJSON())
    } catch { /* push is best-effort */ }
}

/** Stop pushes to this device (toggle off, or sign out). */
export const disablePush = async () => {
    if (!isPushSupported()) return
    try {
        const subscription = await getExistingSubscription()
        if (!subscription) return
        await notificationService.unsubscribePush(subscription.endpoint).catch(() => {})
        await subscription.unsubscribe()
    } catch { /* ignore */ }
}

export const isPushEnabled = async () => {
    if (getPushPermission() !== 'granted') return false
    try {
        return Boolean(await getExistingSubscription())
    } catch {
        return false
    }
}
