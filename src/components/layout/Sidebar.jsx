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
    { to: '/settlements', icon: ArrowLeftRight, label: 'Settle Up' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: true },
]

const Sidebar = () => {
    const { user, logout } = useAuth()
    const { unreadCount } = useNotifications()
    const { isDark, toggle } = useDarkMode()

    return (
        <aside className="hidden lg:flex flex-col w-[240px] min-h-screen fixed left-0 top-0 z-30 border-r border-gray-100 dark:border-white/5"
            style={{ background: isDark ? '#0f0f1a' : '#fafbff' }}>

            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-white/5">
                <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
                    <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                    <span className="text-lg font-extrabold gradient-text">SplitApp</span>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 -mt-0.5">Expense sharing</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">Menu</p>
                {navItems.map(({ to, icon: Icon, label, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 relative group ${isActive
                                ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-gray-200'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isActive ? 'gradient-primary shadow-sm' : 'bg-gray-100 dark:bg-white/8 group-hover:bg-gray-200 dark:group-hover:bg-white/10'
                                    }`}>
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                                </div>
                                <span className="flex-1">{label}</span>
                                {badge && unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom section */}
            <div className="border-t border-gray-100 dark:border-white/5 p-3 space-y-1">
                {/* Dark mode */}
                <button onClick={toggle}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/8 flex items-center justify-center">
                        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-500" />}
                    </div>
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>

                {/* Settings */}
                <NavLink to="/settings" className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`
                }>
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/8 flex items-center justify-center">
                        <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    Settings
                </NavLink>

                {/* User profile */}
                <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    <Avatar user={user} size="sm" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">@{user?.username}</p>
                    </div>
                </NavLink>

                {/* Logout */}
                <button onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-red-500" />
                    </div>
                    Logout
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
