import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Wallet, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDarkMode } from '../../hooks/useDarkMode'
import NotificationDropdown from '../notifications/NotificationDropdown'

const mobileNavItems = [
    { to: '/dashboard', label: '🏠 Dashboard' },
    { to: '/friends', label: '👥 Friends' },
    { to: '/groups', label: '🏘️ Groups' },
    { to: '/expenses', label: '🧾 Expenses' },
    { to: '/settlements', label: '⚖️ Settle Up' },
    { to: '/analytics', label: '📊 Analytics' },
    { to: '/notifications', label: '🔔 Notifications' },
    { to: '/profile', label: '👤 Profile' },
    { to: '/settings', label: '⚙️ Settings' },
]

const TopNavbar = () => {
    const { logout } = useAuth()
    const { isDark, toggle } = useDarkMode()
    const [open, setOpen] = useState(false)

    return (
        <header className="lg:hidden sticky top-0 z-40 border-b"
            style={{ background: isDark ? '#0f0f1a' : '#fafbff', borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f8' }}>
            <div className="flex items-center justify-between px-4 h-14">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-extrabold text-gray-900 dark:text-white text-base">SplitApp</span>
                </Link>
                <div className="flex items-center gap-1">
                    <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/8 transition-colors">
                        {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
                    </button>
                    <NotificationDropdown />
                    <button onClick={() => setOpen(!open)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/8">
                        {open ? <X className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
                    </button>
                </div>
            </div>
            {open && (
                <nav className="border-t px-3 py-2 space-y-0.5"
                    style={{ background: isDark ? '#0f0f1a' : '#fafbff', borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f8' }}>
                    {mobileNavItems.map(({ to, label }) => (
                        <NavLink key={to} to={to} onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                `block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                }`
                            }>
                            {label}
                        </NavLink>
                    ))}
                    <button onClick={logout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                        🚪 Logout
                    </button>
                </nav>
            )}
        </header>
    )
}

export default TopNavbar
