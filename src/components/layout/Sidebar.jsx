import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UsersRound, Receipt, ArrowLeftRight, BarChart3, Wallet } from 'lucide-react'

// Notifications used to be a full nav item here (with its own unread badge) —
// it's reached via the bell in the desktop header now instead, same as
// mobile already does with its own header bell.
const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', tint: 'from-indigo-500 to-violet-600' },
    { to: '/friends', icon: Users, label: 'Friends', tint: 'from-sky-500 to-blue-600' },
    { to: '/groups', icon: UsersRound, label: 'Groups', tint: 'from-emerald-500 to-teal-600' },
    { to: '/expenses', icon: Receipt, label: 'Expenses', tint: 'from-amber-500 to-orange-600' },
    { to: '/settlements', icon: ArrowLeftRight, label: 'Settle Up', tint: 'from-fuchsia-500 to-pink-600' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics', tint: 'from-cyan-500 to-sky-600' },
]

const Sidebar = () => {
    return (
        <aside
            // `h-screen` (a fixed height), not `min-h-screen` (only a floor) — this
            // element is `fixed`, so it never scrolls with the page. With a min
            // height, the flex column grows to fit ALL its content (logo + every
            // nav item) whenever that's taller than the viewport, pushing later
            // items off the bottom of the screen with no way to reach them. A
            // fixed height instead gives the nav's `flex-1` a real budget to
            // shrink into, so it scrolls internally instead.
            className="hidden lg:flex flex-col w-[240px] h-screen fixed left-0 top-0 z-30 border-r"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
                    <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                    <span className="text-lg font-extrabold gradient-text">SplitApp</span>
                    <p className="text-[10px] text-subtle -mt-0.5">Expense sharing</p>
                </div>
            </div>

            {/* Navigation — `min-h-0` overrides a flex item's default min-height:auto,
                which otherwise stops it shrinking below its content size and
                silently defeats `overflow-y-auto` here. */}
            <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-widest px-3 mb-2">Menu</p>
                {navItems.map(({ to, icon: Icon, label, tint }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 relative group ${
                                isActive
                                    ? 'text-primary-700 dark:text-primary-200'
                                    : 'text-muted hover:text-default'
                            }`
                        }
                        style={({ isActive }) => (isActive ? { background: 'var(--brand-soft)' } : undefined)}
                    >
                        {({ isActive }) => (
                            <>
                                {/* Active marker rail */}
                                <span
                                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200 gradient-primary ${
                                        isActive ? 'h-6 opacity-100' : 'h-0 opacity-0'
                                    }`}
                                />
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all bg-gradient-to-br ${
                                        isActive ? `${tint} shadow-sm` : 'from-transparent to-transparent'
                                    }`}
                                    style={isActive ? undefined : { background: 'var(--surface-2)' }}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted group-hover:text-default'}`} />
                                </div>
                                <span className="flex-1">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}

export default Sidebar
