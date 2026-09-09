import { useState, useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { notificationService } from '../services/notificationService'
import { formatRelativeDate } from '../utils/formatDate'
import Button from '../components/common/Button'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import LoadingSkeleton from '../components/common/LoadingSkeleton'

const TYPE_CONFIG = {
    friend_request: { emoji: '👋', color: '#0ea5e9' },
    friend_accepted: { emoji: '🤝', color: '#10b981' },
    group_added: { emoji: '👥', color: '#8b5cf6' },
    expense_added: { emoji: '💸', color: '#f97316' },
    expense_edited: { emoji: '✏️', color: '#6366f1' },
    expense_deleted: { emoji: '🗑️', color: '#f43f5e' },
    settlement_received: { emoji: '✅', color: '#14b8a6' },
}
const FALLBACK_CONFIG = { emoji: '🔔', color: '#9ca3af' }

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [markingAll, setMarkingAll] = useState(false)

    const fetch = () => {
        notificationService.getNotifications({ limit: 50 })
            .then(res => setNotifications(res.data.data.notifications))
            .catch(() => { })
            .finally(() => setLoading(false))
    }
    useEffect(() => { fetch() }, [])

    const markAll = async () => {
        setMarkingAll(true)
        try {
            await notificationService.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        } finally { setMarkingAll(false) }
    }

    const markOne = async (id) => {
        await notificationService.markAsRead(id)
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    }

    const unread = notifications.filter(n => !n.isRead).length

    return (
        <div className="space-y-5 animate-fade-in">
            <PageHeader
                icon={Bell}
                title="Notifications"
                subtitle={unread > 0 ? `${unread} unread` : 'All caught up!'}
                actions={unread > 0 && (
                    <Button variant="secondary" size="sm" loading={markingAll} onClick={markAll}>
                        <CheckCheck className="w-4 h-4" /> Mark all read
                    </Button>
                )}
            />

            {loading ? <LoadingSkeleton count={5} /> :
                notifications.length === 0
                    ? <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
                    : (
                        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-token">
                            {notifications.map(n => {
                                const config = TYPE_CONFIG[n.type] || FALLBACK_CONFIG
                                return (
                                    <button
                                        key={n._id}
                                        type="button"
                                        onClick={() => { if (!n.isRead) markOne(n._id) }}
                                        className="w-full text-left flex gap-3 pl-3.5 pr-4 py-4 cursor-pointer hover-surface transition-colors border-l-4"
                                        style={{ borderLeftColor: n.isRead ? 'transparent' : config.color }}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                            style={{ background: `${config.color}22` }}
                                        >
                                            {config.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm text-default ${n.isRead ? 'font-semibold' : 'font-extrabold'}`}>{n.title}</p>
                                            <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-subtle mt-1 font-medium">{formatRelativeDate(n.createdAt)}</p>
                                        </div>
                                        {!n.isRead && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: config.color }} />}
                                    </button>
                                )
                            })}
                        </div>
                    )
            }
        </div>
    )
}

export default NotificationsPage
