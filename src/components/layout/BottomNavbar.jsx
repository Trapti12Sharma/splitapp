import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UsersRound, Receipt, User } from 'lucide-react'

const tabs = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/friends', icon: Users, label: 'Friends' },
    { to: '/groups', icon: UsersRound, label: 'Groups' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/profile', icon: User, label: 'Profile' },
]

const BottomNavbar = () => (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
        <div className="flex">
            {tabs.map(({ to, icon: Icon, label }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500'
                        }`
                    }
                >
                    <Icon className="w-5 h-5" />
                    {label}
                </NavLink>
            ))}
        </div>
    </nav>
)

export default BottomNavbar
