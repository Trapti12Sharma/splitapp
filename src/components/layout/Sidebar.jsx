import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UsersRound, Receipt, ArrowLeftRight, BarChart3, Bell, Settings, LogOut, Wallet, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { useDarkMode } from '../../hooks/useDarkMode'
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
    const { isDark, toggle } = useDarkMode()

    return (
        <aside className="hidden lg:flex flex-col w-[260px] glass-card rounded-none border-l-0 border-t-0 border-b-0 min-h-screen fixed left-0 top-0 z-30">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-6 py-5">
                <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                    <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">SplitApp</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-0.5">
                {navItems.map(({ to, icon: Icon, label, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group ${isActive
                                ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                            }`
                        }
                    >
                        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                        {label}
                        {badge && unreadCount > 0 && (
                            <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom section */}
            <div className="border-t border-gray-200/60 dark:border-gray-800/60 p-3 space-y-1">
                {/* Dark mode toggle */}
                <button
                    onClick={toggle}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                >
                    {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>

                {/* User */}
                <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                    <Avatar user={user} size="sm" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">@{user?.username}</p>
                    </div>
                </NavLink>

                <NavLink to="/settings" className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`
                }>
                    <Settings className="w-[18px] h-[18px]" />
                    Settings
                </NavLink>

                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <LogOut className="w-[18px] h-[18px]" />
                    Logout
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
