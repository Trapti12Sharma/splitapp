import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, DollarSign, Receipt, ArrowRight } from 'lucide-react'
import { analyticsService } from '../services/analyticsService'
import { expenseService } from '../services/expenseService'
import { settlementService } from '../services/settlementService'
import { groupService } from '../services/groupService'
import { friendService } from '../services/friendService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatRelativeDate } from '../utils/formatDate'
import { useAuth } from '../context/AuthContext'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import Avatar from '../components/common/Avatar'
import CurrencyDisplay from '../components/common/CurrencyDisplay'

const SummaryCard = ({ title, amount, currency, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
        <p className={`text-2xl font-bold ${subtitle?.includes('owe') && !subtitle?.includes('owed to') ? 'text-red-600' : subtitle?.includes('owed to') ? 'text-green-600' : 'text-gray-900'}`}>
            {formatCurrency(amount || 0)}
        </p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
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
        const fetchAll = async () => {
            try {
                const [sumRes, expRes, setRes, grpRes, frdRes] = await Promise.all([
                    analyticsService.getSummary(),
                    expenseService.getExpenses({ limit: 5, sortBy: 'date', order: 'desc' }),
                    settlementService.getSettlements({ limit: 5 }),
                    groupService.getGroups(),
                    friendService.getFriends(),
                ])
                setSummary(sumRes.data.data)
                setRecentExpenses(expRes.data.data.expenses)
                setRecentSettlements(setRes.data.data.settlements)
                setGroups(grpRes.data.data.groups.slice(0, 4))
                setFriends(frdRes.data.data.friends.slice(0, 5))
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    if (loading) return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
            <LoadingSkeleton count={3} />
        </div>
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                <p className="text-sm text-gray-500 mt-1">Here's your expense overview</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard title="You Owe" amount={summary?.totalOwed} icon={TrendingDown} color="bg-red-500" subtitle="you owe others" />
                <SummaryCard title="Owed to You" amount={summary?.totalOwedToUser} icon={TrendingUp} color="bg-green-500" subtitle="owed to you" />
                <SummaryCard
                    title="Net Balance"
                    amount={Math.abs(summary?.netBalance || 0)}
                    icon={DollarSign}
                    color={summary?.netBalance >= 0 ? 'bg-primary-600' : 'bg-orange-500'}
                    subtitle={summary?.netBalance >= 0 ? 'in your favour' : 'against you'}
                />
                <SummaryCard title="Total Expenses" amount={summary?.totalExpensesAmount} icon={Receipt} color="bg-blue-500" subtitle={`${summary?.totalExpensesCount || 0} expenses`} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Expenses */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <h2 className="font-semibold text-gray-900">Recent Expenses</h2>
                        <Link to="/expenses" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentExpenses.length === 0
                            ? <p className="text-sm text-gray-500 text-center py-8">No expenses yet</p>
                            : recentExpenses.map((exp) => {
                                const myShare = exp.splits?.find((s) => s.user?._id?.toString() === user?._id?.toString() || s.user?.toString() === user?._id?.toString())
                                return (
                                    <Link key={exp._id} to={`/expenses/${exp._id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                                            <Receipt className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{exp.description}</p>
                                            <p className="text-xs text-gray-500">{exp.group?.name || 'Personal'} · {formatRelativeDate(exp.date)}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(exp.amount, exp.currency)}</p>
                                            {myShare && <p className="text-xs text-gray-500">your share: {formatCurrency(myShare.amount, exp.currency)}</p>}
                                        </div>
                                    </Link>
                                )
                            })
                        }
                    </div>
                </div>

                {/* Recent Settlements */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <h2 className="font-semibold text-gray-900">Recent Settlements</h2>
                        <Link to="/settlements" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentSettlements.length === 0
                            ? <p className="text-sm text-gray-500 text-center py-8">No settlements yet</p>
                            : recentSettlements.map((s) => {
                                const isPayer = s.from?._id?.toString() === user?._id?.toString()
                                return (
                                    <div key={s._id} className="flex items-center gap-3 px-5 py-3">
                                        <Avatar user={isPayer ? s.to : s.from} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {isPayer ? `You paid ${s.to?.name}` : `${s.from?.name} paid you`}
                                            </p>
                                            <p className="text-xs text-gray-500">{s.note || 'Settlement'} · {formatRelativeDate(s.createdAt)}</p>
                                        </div>
                                        <p className={`text-sm font-semibold flex-shrink-0 ${isPayer ? 'text-red-500' : 'text-green-600'}`}>
                                            {isPayer ? '-' : '+'}{formatCurrency(s.amount, s.currency)}
                                        </p>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>

            {/* Groups & Friends */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Groups */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <h2 className="font-semibold text-gray-900">Groups</h2>
                        <Link to="/groups" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {groups.length === 0
                            ? <p className="text-sm text-gray-500 text-center py-8">No groups yet</p>
                            : groups.map((g) => (
                                <Link key={g._id} to={`/groups/${g._id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-base font-bold text-blue-600">
                                        {g.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{g.name}</p>
                                        <p className="text-xs text-gray-500">{g.members?.length} members</p>
                                    </div>
                                </Link>
                            ))
                        }
                    </div>
                </div>

                {/* Friends */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <h2 className="font-semibold text-gray-900">Friends</h2>
                        <Link to="/friends" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {friends.length === 0
                            ? <p className="text-sm text-gray-500 text-center py-8">No friends yet</p>
                            : friends.map(({ friend, balance }) => (
                                <Link key={friend._id} to={`/friends/${friend._id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                    <Avatar user={friend} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{friend.name}</p>
                                        <p className="text-xs text-gray-500">@{friend.username}</p>
                                    </div>
                                    <CurrencyDisplay amount={balance} size="sm" />
                                </Link>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
