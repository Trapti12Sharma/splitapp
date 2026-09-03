import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'
import { formatRelativeDate } from '../../utils/formatDate'

const TYPE_EMOJI = {
    friend_request: '👋', friend_accepted: '🤝', group_added: '👥',
    expense_added: '💸', expense_edited: '✏️', expense_deleted: '🗑️', settlement_received: '✅',
}

const NotificationDropdown = () => {
    const [open, setOpen] = useState(false)
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
    const ref = useRef(null)

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                aria-label="Notifications">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 gradient-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                    style={{ background: '#16162a' }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                        <div>
                            <p className="text-sm font-bold text-white">Notifications</p>
                            {unreadCount > 0 && <p className="text-[10px] text-primary-400">{unreadCount} unread</p>}
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-semibold transition-colors">
                                <CheckCheck className="w-3.5 h-3.5" /> All read
                            </button>
                        )}
                    </div>

                    <div className="max-h-72 overflow-y-auto scrollbar-hide">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-2xl mb-2">🔔</p>
                                <p className="text-sm text-gray-400">No notifications yet</p>
                            </div>
                        ) : notifications.map(n => (
                            <div key={n._id} onClick={() => { if (!n.isRead) markRead(n._id) }}
                                className={`flex gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors ${!n.isRead ? 'bg-primary-950/30' : ''}`}>
                                <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center text-base flex-shrink-0">
                                    {TYPE_EMOJI[n.type] || '🔔'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white">{n.title}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">{formatRelativeDate(n.createdAt)}</p>
                                </div>
                                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 mt-1" />}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/8 px-4 py-2.5">
                        <Link to="/notifications" onClick={() => setOpen(false)}
                            className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors">
                            View all notifications →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationDropdown
