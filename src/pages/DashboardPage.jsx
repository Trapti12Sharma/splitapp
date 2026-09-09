import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Wallet, Receipt, ArrowRight, Plus } from 'lucide-react'
import { analyticsService } from '../services/analyticsService'
import { expenseService } from '../services/expenseService'
import { settlementService } from '../services/settlementService'
import { groupService } from '../services/groupService'
import { friendService } from '../services/friendService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatRelativeDate } from '../utils/formatDate'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import CurrencyDisplay from '../components/common/CurrencyDisplay'
import { getCategoryStyle } from '../utils/categoryStyle'

const SummaryCard = ({ title, amount, icon: Icon, gradient, label }) => (
    <div
        className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-transform duration-200 hover:-translate-y-1"
        style={{ background: gradient }}
    >
        {/* Decorative orbs plus a diagonal sheen for a bit of depth. */}
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/5 translate-y-6 -translate-x-4" />
        <div
            className="absolute inset-0 opacity-40"
            style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.18) 0%, transparent 45%)' }}
        />
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs sm:text-sm font-semibold text-white/85">{title}</p>
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                </div>
            </div>
            <p className="amount text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {formatCurrency(amount || 0)}
            </p>
            {label && <p className="text-[11px] text-white/75 mt-1">{label}</p>}
        </div>
    </div>
)

const DashboardPage = () => {
    const { user } = useAuth()
    const [summary, setSummary] = useState(null)
    const [recentExpenses, setRecentExpenses] = useState([])
    const [recentSettlements, setRecentSettlements] = useState([])
    const [groups, setGroups] = useState([])
    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        const fetchAll = async () => {
            try {
                const [sumRes, expRes, setRes, grpRes, frdRes] = await Promise.all([
                    analyticsService.getSummary(),
                    expenseService.getExpenses({ limit: 5, sortBy: 'date', order: 'desc' }),
                    settlementService.getSettlements({ limit: 5 }),
                    groupService.getGroups(),
                    friendService.getFriends(),
                ])
                if (cancelled) return
                setSummary(sumRes.data.data)
                setRecentExpenses(expRes.data.data.expenses)
                setRecentSettlements(setRes.data.data.settlements)
                setGroups(grpRes.data.data.groups.slice(0, 4))
                setFriends(frdRes.data.data.friends.slice(0, 5))
            } catch { } finally { if (!cancelled) setLoading(false) }
        }
        fetchAll()
        return () => { cancelled = true }
    }, [])

    if (loading) return (
        <div className="space-y-5 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-surface-2 dark:bg-gray-800 rounded-2xl" />)}
            </div>
            <div className="h-48 bg-surface-2 dark:bg-gray-800 rounded-2xl" />
        </div>
    )

    const uid = user?._id?.toString()
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Greeting */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-default">
                        {greeting}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-sm text-muted mt-0.5">Here's your financial overview</p>
                </div>
                <Link to="/expenses">
                    <button className="gradient-primary text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-glow hover:shadow-glow-lg transition-shadow">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </Link>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard title="You Owe" amount={summary?.totalOwed}
                    icon={TrendingDown} gradient="linear-gradient(135deg, #f43f5e, #ef4444)"
                    label="to others" />
                <SummaryCard title="Owed to You" amount={summary?.totalOwedToUser}
                    icon={TrendingUp} gradient="linear-gradient(135deg, #10b981, #06b6d4)"
                    label="from others" />
                <SummaryCard title="Net Balance"
                    amount={Math.abs(summary?.netBalance || 0)}
                    icon={Wallet}
                    gradient={summary?.netBalance >= 0
                        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                        : "linear-gradient(135deg, #f59e0b, #f97316)"}
                    label={summary?.netBalance >= 0 ? 'in your favour' : 'against you'} />
                <SummaryCard title="Total Expenses" amount={summary?.totalExpensesAmount}
                    icon={Receipt} gradient="linear-gradient(135deg, #0ea5e9, #6366f1)"
                    label={`${summary?.totalExpensesCount || 0} expenses`} />
            </div>

            <div className="grid lg:grid-cols-5 gap-5">
                {/* Recent Expenses - wider */}
                <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-token">
                        <div>
                            <h2 className="font-bold text-default">Recent Expenses</h2>
                            <p className="text-xs text-subtle">Latest transactions</p>
                        </div>
                        <Link to="/expenses" className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    {recentExpenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/30 rounded-2xl flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-muted">No expenses yet</p>
                                <p className="text-xs text-subtle">Add your first expense</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-token">
                            {recentExpenses.map(exp => {
                                const myShare = exp.splits?.find(s => (s.user?._id || s.user)?.toString() === uid)
                                const isPayer = (exp.paidBy?._id || exp.paidBy)?.toString() === uid
                                const cat = getCategoryStyle(exp.category)
                                return (
                                    <Link key={exp._id} to={`/expenses/${exp._id}`}
                                        className="flex items-center gap-3 pl-3.5 pr-5 py-3.5 hover-surface transition-colors border-l-4"
                                        style={{ borderLeftColor: cat.color }}>
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                            style={{ background: cat.soft }}
                                        >
                                            {cat.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-default truncate">{exp.description}</p>
                                            <p className="text-xs text-subtle">
                                                {exp.group?.name || 'Personal'} · {formatRelativeDate(exp.date)}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="amount text-sm font-bold text-default">{formatCurrency(exp.amount, exp.currency)}</p>
                                            {myShare && !isPayer && (
                                                <p className="text-xs" style={{ color: 'var(--negative)' }}>-{formatCurrency(myShare.amount)}</p>
                                            )}
                                            {isPayer && exp.splits?.length > 1 && myShare && (
                                                <p className="text-xs" style={{ color: 'var(--positive)' }}>+{formatCurrency(exp.amount - myShare.amount)}</p>
                                            )}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Friends with balances */}
                <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-token">
                        <div>
                            <h2 className="font-bold text-default">Friends</h2>
                            <p className="text-xs text-subtle">Balances</p>
                        </div>
                        <Link to="/friends" className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                            All <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    {friends.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
                            <p className="text-sm font-semibold text-muted">No friends yet</p>
                            <Link to="/friends" className="text-xs text-primary-600 dark:text-primary-400 font-medium">Add friends →</Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-token">
                            {friends.map(({ friend, balance }) => (
                                <Link key={friend._id} to={`/friends/${friend._id}`}
                                    className="flex items-center gap-3 px-5 py-3 hover:bg-surface-2 dark:hover:bg-white/3 transition-colors">
                                    <Avatar user={friend} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-default truncate">{friend.name}</p>
                                        <p className="text-xs text-subtle">@{friend.username}</p>
                                    </div>
                                    <CurrencyDisplay amount={balance} size="sm" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Groups row */}
            {groups.length > 0 && (
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-token">
                        <h2 className="font-bold text-default">Your Groups</h2>
                        <Link to="/groups" className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-token">
                        {groups.map((g, i) => {
                            const GRADIENTS = ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500']
                            return (
                                <Link key={g._id} to={`/groups/${g._id}`}
                                    className="flex flex-col items-center gap-2 py-4 px-3 hover:bg-surface-2 dark:hover:bg-white/3 transition-colors text-center">
                                    {g.groupImage
                                        ? <img src={g.groupImage} className="w-10 h-10 rounded-xl object-cover" alt={g.name} />
                                        : <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GRADIENTS[i % 4]} flex items-center justify-center text-white font-bold`}>{g.name[0]}</div>
                                    }
                                    <div>
                                        <p className="text-xs font-semibold text-default truncate max-w-[80px]">{g.name}</p>
                                        <p className="text-[10px] text-subtle">{g.members?.length} members</p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardPage
