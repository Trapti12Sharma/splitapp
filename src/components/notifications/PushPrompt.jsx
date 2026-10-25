import { useState } from 'react'
import { BellRing, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { enablePush, getPushPermission } from '../../utils/pushNotifications'
import Button from '../common/Button'

const DISMISS_KEY = 'pushPromptDismissed'

const wasDismissed = () => {
    try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
}

/**
 * One-time card asking to turn on phone notifications. Browsers only show the
 * permission dialog in response to a tap, so this can't be done automatically
 * on login. Hidden once answered either way; Settings has the permanent toggle.
 */
const PushPrompt = () => {
    const [visible, setVisible] = useState(() => getPushPermission() === 'default' && !wasDismissed())
    const [loading, setLoading] = useState(false)

    if (!visible) return null

    const dismiss = () => {
        try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
        setVisible(false)
    }

    const handleEnable = async () => {
        setLoading(true)
        try {
            const permission = await enablePush()
            if (permission === 'granted') toast.success('Notifications turned on')
            else if (permission === 'denied') toast.error('Notifications blocked — you can allow them in browser settings')
            if (permission !== 'default') dismiss()
        } catch {
            toast.error('Could not turn on notifications')
        } finally { setLoading(false) }
    }

    return (
        <div className="glass-card rounded-2xl p-4 mb-5 flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <BellRing className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-default">Turn on notifications?</p>
                <p className="text-xs text-subtle">Get notified when someone adds an expense or sends you a payment reminder</p>
            </div>
            <Button size="sm" loading={loading} onClick={handleEnable} className="flex-shrink-0">Enable</Button>
            <button onClick={dismiss} aria-label="Dismiss" className="p-1 text-muted hover:text-default flex-shrink-0">
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

export default PushPrompt
