import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, UserPlus, Crown, TrendingUp, TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { groupService } from '../services/groupService'
import { expenseService } from '../services/expenseService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import AddExpenseModal from '../components/expenses/AddExpenseModal'
import SettleUpModal from '../components/settlements/SettleUpModal'

const GroupDetailPage = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const [group, setGroup] = useState(null)
    const [expenses, setExpenses] = useState([])
    const [balances, setBalances] = useState([])
    const [whoOwes, setWhoOwes] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('expenses')
    const [showExpenseModal, setShowExpenseModal] = useState(false)
    const [settleTarget, setSettleTarget] = useState(null)

    const [error, setError] = useState(null)

    const [refreshKey, setRefreshKey] = useState(0)
    const refresh = () => setRefreshKey(k => k + 1)

    useEffect(() => {
        let cancelled = false
        setError(null)
        const fetchData = async () => {
            try {
                // Fetch group and expenses first — balances may fail for empty groups
                const [gRes, eRes] = await Promise.all([
                    groupService.getGroup(id),
                    expenseService.getGroupExpenses(id),
                ])
                if (cancelled) return
                setGroup(gRes.data.data.group)
                setExpenses(eRes.data.data.expenses)

                // Balances are non-critical — fetch separately so failure doesn't block the page
                try {
                    const bRes = await groupService.getGroupBalances(id)
                    if (!cancelled) {
                        setBalances(bRes.data.data.balances || [])
                        setWhoOwes(bRes.data.data.whoOwesWhom || [])
                    }
                } catch {
                    // No expenses yet — balances just stay empty
                    if (!cancelled) { setBalances([]); setWhoOwes([]) }
                }
            } catch (err) {
                if (!cancelled) setError(err?.response?.data?.message || 'Failed to load group')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        fetchData()
        return () => { cancelled = true }
    }, [id, refreshKey])

    const isAdmin = group?.members?.find((m) => m.user?._id?.toString() === user._id?.toString())?.role === 'admin'

    if (loading) return <LoadingSkeleton count={4} />
    if (error) return (
        <div className="space-y-4">
            <Link to="/groups" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" /> Back to Groups
            </Link>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600 font-medium">{error}</p>
                <button onClick={refresh} className="mt-3 text-sm text-primary-600 hover:underline">Try again</button>
            </div>
        </div>
    )
    if (!group) return <p className="text-center text-gray-500 py-16">Group not found</p>

    return (
        <div className="space-y-5">
            <Link to="/groups" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" /> Back to Groups
            </Link>

            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                {group.groupImage
                    ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${group.groupImage}`} className="w-14 h-14 rounded-xl object-cover" alt={group.name} />
                    : <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-2xl font-bold text-primary-600">{group.name[0]}</div>
                }
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
                    {group.description && <p className="text-sm text-gray-500">{group.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{group.members?.length} members</p>
                </div>
                <Button onClick={() => setShowExpenseModal(true)}><Plus className="w-4 h-4" /> Add</Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                {['expenses', 'balances', 'members'].map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Expenses Tab */}
            {tab === 'expenses' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                    {expenses.length === 0
                        ? <p className="text-sm text-gray-500 text-center py-10">No expenses yet</p>
                        : expenses.map((exp) => {
                            const uid = user._id?.toString()
                            const myShare = exp.splits?.find((s) => (s.user?._id || s.user)?.toString() === uid)
                            return (
                                <Link key={exp._id} to={`/expenses/${exp._id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50">
                                    <Avatar user={exp.paidBy} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{exp.description}</p>
                                        <p className="text-xs text-gray-500">{exp.paidBy?.name} · {formatDate(exp.date)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">{formatCurrency(exp.amount, exp.currency)}</p>
                                        {myShare && <p className="text-xs text-gray-500">your share: {formatCurrency(myShare.amount, exp.currency)}</p>}
                                    </div>
                                </Link>
                            )
                        })
                    }
                </div>
            )}

            {/* Balances Tab */}
            {tab === 'balances' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                        {balances.map(({ user: member, netBalance }) => (
                            <div key={member._id} className="flex items-center gap-3 px-4 py-3.5">
                                <Avatar user={member} size="sm" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-semibold ${netBalance > 0 ? 'text-green-600' : netBalance < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {netBalance > 0 ? <TrendingUp className="w-4 h-4" /> : netBalance < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                                    {netBalance > 0 ? '+' : ''}{formatCurrency(netBalance)}
                                </div>
                            </div>
                        ))}
                    </div>
                    {whoOwes.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <p className="text-sm font-semibold text-gray-900 mb-3">Who owes whom</p>
                            <div className="space-y-2">
                                {whoOwes.map((item, i) => {
                                    const fromMember = group.members?.find((m) => m.user?._id?.toString() === item.from?.toString())?.user
                                    const toMember = group.members?.find((m) => m.user?._id?.toString() === item.to?.toString())?.user
                                    const isMe = item.from?.toString() === user._id?.toString()
                                    return (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Avatar user={fromMember} size="xs" />
                                                <span className="text-sm text-gray-700">{isMe ? 'You' : fromMember?.name} owe{isMe ? '' : 's'} {item.to?.toString() === user._id?.toString() ? 'you' : toMember?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-red-500">{formatCurrency(item.amount)}</span>
                                                {isMe && (
                                                    <Button size="sm" variant="secondary" onClick={() => setSettleTarget({ user: toMember, amount: item.amount })}>
                                                        Settle
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Members Tab */}
            {tab === 'members' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                    {group.members?.map((m) => (
                        <div key={m.user?._id} className="flex items-center gap-3 px-4 py-3.5">
                            <Avatar user={m.user} size="md" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{m.user?.name}</p>
                                <p className="text-xs text-gray-500">@{m.user?.username}</p>
                            </div>
                            {m.role === 'admin' && (
                                <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                    <Crown className="w-3 h-3" /> Admin
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <AddExpenseModal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} defaultGroupId={id} onSuccess={refresh} />
            {settleTarget && (
                <SettleUpModal isOpen={!!settleTarget} onClose={() => setSettleTarget(null)} defaultTo={settleTarget.user} defaultAmount={settleTarget.amount} groupId={id} onSuccess={() => { setSettleTarget(null); refresh() }} />
            )}
        </div>
    )
}

export default GroupDetailPage
