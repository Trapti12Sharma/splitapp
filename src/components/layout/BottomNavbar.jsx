import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UsersRound, Receipt, User } from 'lucide-react'
import { useDarkMode } from '../../hooks/useDarkMode'

const tabs = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/friends', icon: Users, label: 'Friends' },
    { to: '/groups', icon: UsersRound, label: 'Groups' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/profile', icon: User, label: 'Profile' },
]

const BottomNavbar = () => {
    const { isDark } = useDarkMode()
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
            style={{ background: isDark ? '#0f0f1a' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f8' }}>
            <div className="flex">
                {tabs.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-[10px] font-semibold transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-600'
                            }`
                        }>
                        {({ isActive }) => (
                            <>
                                <div className={`w-8 h-6 rounded-lg flex items-center justify-center transition-all ${isActive ? 'gradient-primary' : ''}`}>
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                                </div>
                                {label}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}

export default BottomNavbar
