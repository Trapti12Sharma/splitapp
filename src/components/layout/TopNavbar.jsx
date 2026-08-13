import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, SplitSquareVertical } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import NotificationDropdown from '../notifications/NotificationDropdown'
import Avatar from '../common/Avatar'

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
    const { user, logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 h-14">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                        <SplitSquareVertical className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">SplitApp</span>
                </Link>

                <div className="flex items-center gap-2">
                    <NotificationDropdown />
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100">
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <nav className="border-t border-gray-100 bg-white px-4 py-3 space-y-1">
                    {mobileNavItems.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                    <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                        Logout
                    </button>
                </nav>
            )}
        </header>
    )
}

export default TopNavbar
