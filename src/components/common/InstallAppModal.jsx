import { useEffect, useState } from 'react'
import { Download, Share, PlusSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { useInstallPrompt } from '../../context/InstallPromptContext'
import { isIos } from '../../utils/platform'
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
 * Two possible modes:
 *  - 'chrome': `beforeinstallprompt` fired — one-tap native install.
 *  - 'ios': Safari/iOS never fires that event at all — Share-sheet steps.
 *
 * There used to be a third, timed-out "check Chrome's menu yourself" mode
 * for Android when the event hadn't fired yet. That was wrong: Chrome's own
 * "Install app" menu entry is gated by the exact same readiness signal as
 * `beforeinstallprompt` (an undocumented site-engagement heuristic, separate
 * from the manifest/service-worker validity `Page.getInstallabilityErrors`
 * reports on) — pointing someone at the menu before that signal has fired
 * sent them to an option that genuinely wasn't ready, and Chrome answered
 * with "This app cannot be installed," which reads as a real failure. The
 * fix is the same thing every working install prompt does (this app's own
 * sibling project Tracksy included): only ever offer install once Chrome
 * has actually said yes, and if it hasn't, show nothing rather than guess.
 */
const InstallAppModal = () => {
    const { canInstall, installed, promptInstall } = useInstallPrompt()
    const [mode, setMode] = useState(null)

    useEffect(() => {
        if (installed || alreadySeen()) return
        // `beforeinstallprompt` fires asynchronously after load — this effect
        // re-runs whenever `canInstall` changes, so however long Chrome takes
        // to decide, the modal picks it up the moment it does. No arbitrary
        // cutoff: if it never fires this visit, nothing shows, and the popup
        // simply gets another chance next visit (`alreadySeen` is never set
        // for a visit where nothing was shown).
        if (canInstall) setMode('chrome')
        else if (isIos()) setMode('ios')
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
