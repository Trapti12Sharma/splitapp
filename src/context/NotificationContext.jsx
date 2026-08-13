import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { notificationService } from '../services/notificationService'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth()
    const userId = user?._id   // primitive — stable for comparison
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const intervalRef = useRef(null)

    // Single stable fetch function — does not close over `user` object
    const fetchNotifications = async () => {
        if (!localStorage.getItem('token')) return
        try {
            const res = await notificationService.getNotifications({ limit: 10 })
            setNotifications(res.data.data.notifications)
            setUnreadCount(res.data.data.unreadCount)
        } catch {
            // silently ignore (401 etc.)
        }
    }

    // Only re-run when the logged-in user changes (login / logout)
    useEffect(() => {
        if (!userId) {
            setNotifications([])
            setUnreadCount(0)
            return
        }

        fetchNotifications()

        // Poll every 60 seconds (was 30 — no need to be aggressive)
        intervalRef.current = setInterval(fetchNotifications, 60000)

        return () => {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [userId]) // ← stable primitive, not an object

    const markRead = async (id) => {
        try {
            await notificationService.markAsRead(id)
            setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n))
            setUnreadCount((c) => Math.max(0, c - 1))
        } catch { }
    }

    const markAllRead = async () => {
        try {
            await notificationService.markAllAsRead()
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch { }
    }

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markRead, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = () => {
    const ctx = useContext(NotificationContext)
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
    return ctx
}
