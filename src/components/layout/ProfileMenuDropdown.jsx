import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Avatar from '../common/Avatar'

/**
 * Desktop header's profile menu — same open/close/outside-click/Escape
 * pattern as NotificationDropdown, sitting next to the bell. Replaces the
 * dark mode toggle, Settings link and Logout button that used to live
 * pinned to the bottom of the sidebar.
 */
const ProfileMenuDropdown = () => {
    const [open, setOpen] = useState(false)
    const { user, logout } = useAuth()
    const { isDark, toggle } = useTheme()
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
                className="flex items-center gap-2 p-1 pr-2 rounded-xl transition-colors hover:opacity-80"
                aria-label="Profile menu"
                aria-expanded={open}
            >
                <Avatar user={user} size="sm" />
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl border z-50 overflow-hidden animate-scale-in"
                    style={{
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        boxShadow: 'var(--shadow-lg)',
                    }}
                >
                    <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 border-b transition-colors hover:opacity-90"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <Avatar user={user} size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-default truncate">{user?.name}</p>
                            <p className="text-[11px] text-subtle truncate">@{user?.username}</p>
                        </div>
                    </Link>

                    <div className="p-1.5">
                        <button
                            onClick={() => { toggle(); setOpen(false) }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-default transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                            </div>
                            {isDark ? 'Light Mode' : 'Dark Mode'}
                        </button>

                        <Link
                            to="/settings"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-default transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                                <Settings className="w-4 h-4 text-muted" />
                            </div>
                            Settings
                        </Link>

                        <button
                            onClick={() => { setOpen(false); logout() }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                                <LogOut className="w-4 h-4 text-red-500" />
                            </div>
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileMenuDropdown
