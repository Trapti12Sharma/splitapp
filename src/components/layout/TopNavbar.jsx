import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Wallet, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDarkMode } from '../../hooks/useDarkMode'
import NotificationDropdown from '../notifications/NotificationDropdown'

const mobileNavItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/friends', label: 'Friends' },
    { to: '/groups', label: 'Groups' },
    { to: '/expenses', label: 'Expenses' },
    { to: '/settlements', label: 'Settlements' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/profile', label: 'Profile' },
    { to: '/settings', label: 'Settings' },
]

const TopNavbar = () => {
    const { logout } = useAuth()
    const { isDark, toggle } = useDarkMode()
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header className="lg:hidden glass-card rounded-none border-x-0 border-t-0 sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 h-14">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">SplitApp</span>
                </Link>

                <div className="flex items-center gap-1.5">
                    <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
                    </button>
                    <NotificationDropdown />
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                        {menuOpen ? <X className="w-5 h-5 dark:text-gray-300" /> : <Menu className="w-5 h-5 dark:text-gray-300" />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <nav className="border-t border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900 px-4 py-3 space-y-1">
                    {mobileNavItems.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                    <button onClick={logout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                        Logout
                    </button>
                </nav>
            )}
        </header>
    )
}

export default TopNavbar
