import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'
import { formatRelativeDate } from '../../utils/formatDate'

const TYPE_EMOJI = {
    friend_request: '👋', friend_accepted: '🤝', group_added: '👥',
    expense_added: '💸', expense_edited: '✏️', expense_deleted: '🗑️', settlement_received: '✅',
}

/**
 * Panel colours come from the design tokens — this dropdown was hardcoded to
 * `#16162a` with white text, so in light mode it was a dark box that looked
 * pasted onto the page.
 */
const NotificationDropdown = () => {
    const [open, setOpen] = useState(false)
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
    const ref = useRef(null)

    useEffect(() => {
        if (!open) return
        const onPointerDown = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        const onKeyDown = (e) => { if (e.key === 'Escape') setOpen(false) }
        document.addEventListener('mousedown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('mousedown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl transition-colors hover:opacity-80"
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                aria-expanded={open}
            >
                <Bell className="w-5 h-5 text-muted" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 gradient-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border z-50 overflow-hidden animate-scale-in"
                    style={{
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        boxShadow: 'var(--shadow-lg)',
                    }}
                >
                    <div
                        className="flex items-center justify-between px-4 py-3 border-b"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <div>
                            <p className="text-sm font-bold text-default">Notifications</p>
                            {unreadCount > 0 && (
                                <p className="text-[10px] text-primary-500 font-semibold">{unreadCount} unread</p>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-primary-500 hover:text-primary-400 flex items-center gap-1 font-semibold transition-colors"
                            >
                                <CheckCheck className="w-3.5 h-3.5" /> All read
                            </button>
                        )}
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-2xl mb-2">🔔</p>
                                <p className="text-sm text-muted">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n._id}
                                    type="button"
                                    onClick={() => { if (!n.isRead) markRead(n._id) }}
                                    className="w-full text-left flex gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0"
                                    style={{
                                        borderColor: 'var(--border)',
                                        background: n.isRead ? 'transparent' : 'var(--brand-soft)',
                                    }}
                                >
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                                        style={{ background: 'var(--surface-2)' }}
                                    >
                                        {TYPE_EMOJI[n.type] || '🔔'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-default">{n.title}</p>
                                        <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-subtle mt-1">{formatRelativeDate(n.createdAt)}</p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    <div className="border-t px-4 py-2.5" style={{ borderColor: 'var(--border)' }}>
                        <Link
                            to="/notifications"
                            onClick={() => setOpen(false)}
                            className="text-xs font-bold text-primary-500 hover:text-primary-400 transition-colors"
                        >
                            View all notifications →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationDropdown
