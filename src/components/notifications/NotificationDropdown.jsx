import { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'
import { formatRelativeDate } from '../../utils/formatDate'

const typeIcons = {
    friend_request: '👋',
    friend_accepted: '🤝',
    group_added: '👥',
    expense_added: '💸',
    expense_edited: '✏️',
    expense_deleted: '🗑️',
    settlement_received: '✅',
}

const NotificationDropdown = () => {
    const [open, setOpen] = useState(false)
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                <CheckCheck className="w-3.5 h-3.5" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-500">No notifications</div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => { if (!n.isRead) markRead(n._id) }}
                                    className={`flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-primary-50/40' : ''}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
                                        {typeIcons[n.type] || '🔔'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(n.createdAt)}</p>
                                    </div>
                                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-gray-100 px-4 py-2">
                        <Link to="/notifications" onClick={() => setOpen(false)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationDropdown
