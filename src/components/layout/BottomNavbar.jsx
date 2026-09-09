import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UsersRound, Receipt, User } from 'lucide-react'

const tabs = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/friends', icon: Users, label: 'Friends' },
    { to: '/groups', icon: UsersRound, label: 'Groups' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/profile', icon: User, label: 'Profile' },
]

/**
 * Colours come from the design tokens rather than an inline `isDark ? ... : ...`
 * style, which previously went stale whenever the theme was toggled elsewhere.
 */
const BottomNavbar = () => (
    <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            paddingBottom: 'env(safe-area-inset-bottom)',
        }}
    >
        <div className="flex">
            {tabs.map(({ to, icon: Icon, label }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-semibold transition-colors ${
                            isActive ? 'text-primary-600 dark:text-primary-300' : 'text-subtle'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <div
                                className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                    isActive ? 'gradient-primary shadow-glow' : ''
                                }`}
                            >
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

export default BottomNavbar
