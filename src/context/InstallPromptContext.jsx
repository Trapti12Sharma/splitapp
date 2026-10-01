import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

const InstallPromptContext = createContext(null)

const isStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari's own flag — iOS never fires `beforeinstallprompt` at all.
    window.navigator.standalone === true

/**
 * Wraps Chrome/Edge's `beforeinstallprompt` event so a button anywhere in the
 * app (the first-visit popup, Settings, …) can trigger the native "Install
 * app" dialog.
 *
 * This is a context, not a standalone hook each caller re-subscribes to,
 * because the browser dispatches `beforeinstallprompt` exactly once per page
 * load and `prompt()` can only be called once on that captured event. Two
 * independent hook instances would each hold their own copy of the same
 * event, and whichever UI calls `prompt()` second would throw. One provider
 * at the app root means there is exactly one captured event and one
 * `promptInstall()` that everything shares.
 */
export const InstallPromptProvider = ({ children }) => {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [installed, setInstalled] = useState(isStandalone)

    useEffect(() => {
        const onBeforeInstallPrompt = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
        }
        const onInstalled = () => {
            setInstalled(true)
            setDeferredPrompt(null)
        }
        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
        window.addEventListener('appinstalled', onInstalled)
        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
            window.removeEventListener('appinstalled', onInstalled)
        }
    }, [])

    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return false
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        // The event is single-use regardless of the user's choice.
        setDeferredPrompt(null)
        return outcome === 'accepted'
    }, [deferredPrompt])

    const value = useMemo(
        () => ({
            // Chrome/Edge path: only true once the event has actually fired.
            canInstall: !installed && !!deferredPrompt,
            installed,
            promptInstall,
        }),
        [installed, deferredPrompt, promptInstall]
    )

    return <InstallPromptContext.Provider value={value}>{children}</InstallPromptContext.Provider>
}

export const useInstallPrompt = () => {
    const ctx = useContext(InstallPromptContext)
    if (!ctx) throw new Error('useInstallPrompt must be used within an InstallPromptProvider')
    return ctx
}
