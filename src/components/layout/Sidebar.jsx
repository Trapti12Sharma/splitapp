import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UsersRound, Receipt, ArrowLeftRight, BarChart3, Bell, Settings, LogOut, SplitSquareVertical } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import Avatar from '../common/Avatar'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/friends', icon: Users, label: 'Friends' },
    { to: '/groups', icon: UsersRound, label: 'Groups' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/settlements', icon: ArrowLeftRight, label: 'Settlements' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: true },
]

const Sidebar = () => {
    const { user, logout } = useAuth()
    const { unreadCount } = useNotifications()

    return (
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-30">
            {/* Logo */}
            <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <SplitSquareVertical className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">SplitApp</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {navItems.map(({ to, icon: Icon, label, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${isActive
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {label}
                        {badge && unreadCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User section */}
            <div className="border-t border-gray-100 p-3 space-y-0.5">
                <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar user={user} size="sm" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                    </div>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                    }`
                }>
                    <Settings className="w-5 h-5" />
                    Settings
                </NavLink>
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
