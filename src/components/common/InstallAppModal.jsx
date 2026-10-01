import { useEffect, useState } from 'react'
import { Download, Share, PlusSquare, MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { useInstallPrompt } from '../../context/InstallPromptContext'
import { isIos, isAndroid } from '../../utils/platform'
import Modal from './Modal'
import Button from './Button'

// Once shown (installed, dismissed, or acted on) this visitor never sees it
// again — "first-time visitor" means once per browser, not once per app
// session.
const SEEN_KEY = 'installPromptSeen'

const markSeen = () => {
    try {
        localStorage.setItem(SEEN_KEY, '1')
    } catch {
        // Storage unavailable — worst case it asks again next visit.
    }
}

const alreadySeen = () => {
    try {
        return localStorage.getItem(SEEN_KEY) === '1'
    } catch {
        return false
    }
}

/**
 * The one-time "install our app" popup for first-time visitors — mounted at
 * the app root so it shows on the login/register screen too, before anyone
 * has an account.
 *
 * Three possible modes, resolved once and then fixed for the rest of this
 * popup's life (re-reading `canInstall` at render time instead would flip
 * the UI out from under a still-open modal the moment the captured prompt
 * gets consumed elsewhere):
 *  - 'chrome': `beforeinstallprompt` fired — one-tap native install.
 *  - 'ios': Safari/iOS never fires that event at all — Share-sheet steps.
 *  - 'android-manual': Android Chrome, but the event hasn't fired after a
 *    generous wait. Chrome gates it on its own site-engagement heuristic, so
 *    a fresh visit with no taps yet can legitimately pass every technical
 *    installability check and still not fire this on cue — the "Install
 *    app" option sitting in Chrome's own menu already works regardless, so
 *    this just points there instead of leaving the visitor with nothing.
 */
const InstallAppModal = () => {
    const { canInstall, installed, promptInstall } = useInstallPrompt()
    const [mode, setMode] = useState(null)

    useEffect(() => {
        if (installed || alreadySeen()) return

        // `beforeinstallprompt` usually fires within a second or two of load;
        // give it that long before committing to a mode.
        const quick = setTimeout(() => {
            if (canInstall) setMode('chrome')
            else if (isIos()) setMode('ios')
        }, 1500)

        // Android's engagement heuristic can take longer than that — wait
        // further before falling back to manual instructions, so a slow
        // `beforeinstallprompt` still gets to win and show the one-tap flow.
        const slow = setTimeout(() => {
            if (canInstall) setMode('chrome')
            else if (isAndroid()) setMode('android-manual')
        }, 4500)

        return () => {
            clearTimeout(quick)
            clearTimeout(slow)
        }
    }, [canInstall, installed])

    const close = () => {
        markSeen()
        setMode(null)
    }

    const handleInstall = async () => {
        const accepted = await promptInstall()
        markSeen()
        setMode(null)
        if (accepted) toast.success('SplitApp installed!')
    }

    const titles = {
        chrome: 'Install SplitApp',
        ios: 'Add to Home Screen',
        'android-manual': 'Install SplitApp',
    }

    return (
        <Modal isOpen={!!mode} onClose={close} size="sm" title={titles[mode] || 'Install SplitApp'}>
            <div className="flex flex-col items-center text-center gap-4">
                <img src="/icon-192.png" alt="SplitApp" className="w-16 h-16 rounded-2xl shadow-glow" />

                {mode === 'ios' && (
                    <>
                        <p className="text-sm text-muted">
                            Install SplitApp on your iPhone for quick, full-screen access — no App Store needed.
                        </p>
                        <div className="w-full text-left text-sm text-default space-y-2 rounded-2xl border border-token p-4">
                            <p className="flex items-center gap-2">
                                <Share className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                Tap the <strong>Share</strong> button in Safari's toolbar
                            </p>
                            <p className="flex items-center gap-2">
                                <PlusSquare className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                Then choose <strong>Add to Home Screen</strong>
                            </p>
                        </div>
                        <Button className="w-full" onClick={close}>Got it</Button>
                    </>
                )}

                {mode === 'android-manual' && (
                    <>
                        <p className="text-sm text-muted">
                            Add SplitApp to your home screen for quick, full-screen access.
                        </p>
                        <div className="w-full text-left text-sm text-default space-y-2 rounded-2xl border border-token p-4">
                            <p className="flex items-center gap-2">
                                <MoreVertical className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                Tap the <strong>⋮ menu</strong> in Chrome's top-right corner
                            </p>
                            <p className="flex items-center gap-2">
                                <Download className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                Then choose <strong>Install app</strong> (or <strong>Add to Home screen</strong>)
                            </p>
                        </div>
                        <Button className="w-full" onClick={close}>Got it</Button>
                    </>
                )}

                {mode === 'chrome' && (
                    <>
                        <p className="text-sm text-muted">
                            Add SplitApp to your device for quick access, a full-screen experience, and offline-friendly loading.
                        </p>
                        <div className="w-full flex gap-2">
                            <Button variant="secondary" className="flex-1" onClick={close}>Not now</Button>
                            <Button className="flex-1 flex items-center justify-center gap-2" onClick={handleInstall}>
                                <Download className="w-4 h-4" /> Install
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    )
}

export default InstallAppModal
