import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Wallet, Moon, Sun, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import NotificationDropdown from '../notifications/NotificationDropdown'

const mobileNavItems = [
    { to: '/dashboard', label: 'Dashboard', emoji: '🏠' },
    { to: '/friends', label: 'Friends', emoji: '👥' },
    { to: '/groups', label: 'Groups', emoji: '🏘️' },
    { to: '/expenses', label: 'Expenses', emoji: '🧾' },
    { to: '/settlements', label: 'Settle Up', emoji: '⚖️' },
    { to: '/analytics', label: 'Analytics', emoji: '📊' },
    { to: '/notifications', label: 'Notifications', emoji: '🔔' },
    { to: '/profile', label: 'Profile', emoji: '👤' },
    { to: '/settings', label: 'Settings', emoji: '⚙️' },
]

const TopNavbar = () => {
    const { logout } = useAuth()
    const { isDark, toggle } = useTheme()
    const [open, setOpen] = useState(false)

    const panelStyle = { background: 'var(--surface)', borderColor: 'var(--border)' }

    return (
        <header className="lg:hidden sticky top-0 z-40 border-b" style={panelStyle}>
            <div className="flex items-center justify-between px-4 h-14">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                        <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-extrabold text-base gradient-text">SplitApp</span>
                </Link>
                <div className="flex items-center gap-1">
                    <button
                        onClick={toggle}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="p-2 rounded-xl transition-colors hover:opacity-80"
                    >
                        {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                    </button>
                    <NotificationDropdown />
                    <button
                        onClick={() => setOpen(!open)}
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-expanded={open}
                        className="p-2 rounded-xl transition-colors hover:opacity-80"
                    >
                        {open ? <X className="w-5 h-5 text-default" /> : <Menu className="w-5 h-5 text-default" />}
                    </button>
                </div>
            </div>

            {open && (
                <nav className="border-t px-3 py-2 space-y-0.5 animate-slide-up" style={panelStyle}>
                    {mobileNavItems.map(({ to, label, emoji }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                    isActive ? 'text-primary-700 dark:text-primary-200' : 'text-muted'
                                }`
                            }
                            style={({ isActive }) => (isActive ? { background: 'var(--brand-soft)' } : undefined)}
                        >
                            <span className="text-base">{emoji}</span>
                            {label}
                        </NavLink>
                    ))}
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </nav>
            )}
        </header>
    )
}

export default TopNavbar
