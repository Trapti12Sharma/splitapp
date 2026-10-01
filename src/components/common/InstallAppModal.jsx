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
 * `beforeinstallprompt` fires asynchronously after load (sometimes a second
 * or two in), so this waits a moment before deciding whether to show
 * anything rather than judging `canInstall` the instant this mounts.
 */
const InstallAppModal = () => {
    const { canInstall, installed, promptInstall } = useInstallPrompt()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (installed || alreadySeen()) return
        const timer = setTimeout(() => {
            if (canInstall || isIos()) setOpen(true)
        }, 1500)
        return () => clearTimeout(timer)
    }, [canInstall, installed])

    const close = () => {
        markSeen()
        setOpen(false)
    }

    const handleInstall = async () => {
        const accepted = await promptInstall()
        markSeen()
        setOpen(false)
        if (accepted) toast.success('SplitApp installed!')
    }

    return (
        <Modal isOpen={open} onClose={close} size="sm" title={isIos() ? 'Add to Home Screen' : 'Install SplitApp'}>
            <div className="flex flex-col items-center text-center gap-4">
                <img src="/icon-192.png" alt="SplitApp" className="w-16 h-16 rounded-2xl shadow-glow" />

                {isIos() ? (
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
                ) : (
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
