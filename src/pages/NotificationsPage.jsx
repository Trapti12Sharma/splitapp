import { useState, useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { notificationService } from '../services/notificationService'
import { formatRelativeDate } from '../utils/formatDate'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingSkeleton from '../components/common/LoadingSkeleton'

const typeIcons = {
    friend_request: '👋', friend_accepted: '🤝', group_added: '👥',
    expense_added: '💸', expense_edited: '✏️', expense_deleted: '🗑️', settlement_received: '✅',
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [markingAll, setMarkingAll] = useState(false)

    const fetch = () => {
        notificationService.getNotifications({ limit: 50 }).then((res) => setNotifications(res.data.data.notifications)).catch(() => { }).finally(() => setLoading(false))
    }
    useEffect(() => { fetch() }, [])

    const markAll = async () => {
        setMarkingAll(true)
        try {
            await notificationService.markAllAsRead()
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        } finally { setMarkingAll(false) }
    }

    const markOne = async (id) => {
        await notificationService.markAsRead(id)
        setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n))
    }

    const unread = notifications.filter((n) => !n.isRead).length

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Notifications {unread > 0 && <span className="text-base font-normal text-gray-400">({unread} unread)</span>}</h1>
                {unread > 0 && <Button variant="secondary" size="sm" loading={markingAll} onClick={markAll}><CheckCheck className="w-4 h-4" /> Mark all read</Button>}
            </div>

            {loading ? <LoadingSkeleton count={5} /> :
                notifications.length === 0
                    ? <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
                    : (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                            {notifications.map((n) => (
                                <div key={n._id} onClick={() => { if (!n.isRead) markOne(n._id) }}
                                    className={`flex gap-3 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-primary-50/30' : ''}`}>
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                                        {typeIcons[n.type] || '🔔'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                                        <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(n.createdAt)}</p>
                                    </div>
                                    {!n.isRead && <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />}
                                </div>
                            ))}
                        </div>
                    )
            }
        </div>
    )
}

export default NotificationsPage
