import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Receipt } from 'lucide-react'
import api from '../services/api'
import { friendService } from '../services/friendService'
import { expenseService } from '../services/expenseService'
import { settlementService } from '../services/settlementService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate, formatRelativeDate } from '../utils/formatDate'
import { getCategoryStyle } from '../utils/categoryStyle'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import CurrencyDisplay from '../components/common/CurrencyDisplay'
import SettleUpModal from '../components/settlements/SettleUpModal'
import Button from '../components/common/Button'
import LoadingSkeleton from '../components/common/LoadingSkeleton'

const FriendDetailPage = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const [friend, setFriend] = useState(null)
    const [balance, setBalance] = useState(null)
    const [expenses, setExpenses] = useState([])
    const [settlements, setSettlements] = useState([])
    const [loading, setLoading] = useState(true)
    const [settleOpen, setSettleOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        if (!id || !user?._id) return
        let cancelled = false

        const fetchData = async () => {
            try {
                const [userRes, balRes, expRes, setRes] = await Promise.all([
                    api.get(`/users/${id}`),                          // direct user lookup — no search
                    friendService.getFriendBalance(id),
                    expenseService.getExpenses({ limit: 50 }),
                    settlementService.getSettlements({ limit: 50 }),
                ])
                if (cancelled) return

                setFriend(userRes.data.data.user)
                setBalance(balRes.data.data.balance)

                const userId = user._id
                const allExp = expRes.data.data.expenses
                setExpenses(allExp.filter((e) =>
                    (e.paidBy?._id === id || e.splits?.some((s) => s.user?._id === id)) &&
                    (e.paidBy?._id === userId || e.splits?.some((s) => s.user?._id === userId))
                ))

                const allSet = setRes.data.data.settlements
                setSettlements(allSet.filter((s) =>
                    s.from?._id === id || s.to?._id === id
                ))
            } catch { }
            finally { if (!cancelled) setLoading(false) }
        }

        fetchData()
        return () => { cancelled = true }
    }, [id, user?._id, refreshKey]) // stable primitives only

    const handleSettled = () => {
        setSettleOpen(false)
        setRefreshKey(k => k + 1)
    }

    if (loading) return <div className="space-y-4"><LoadingSkeleton count={3} /></div>
    if (!friend) return <p className="text-center text-muted py-16">User not found</p>

    return (
        <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
            <Link to="/friends" className="flex items-center gap-1 text-sm text-muted hover:text-default transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Friends
            </Link>

            {/* Profile hero */}
            <div className="relative rounded-3xl overflow-hidden">
                <div className="h-20 gradient-primary" />
                <div className="glass-card rounded-b-3xl border-t-0 px-6 pb-6 -mt-10">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                        <Avatar user={friend} size="2xl" ring={false} className="ring-4 -mt-2" style={{ '--tw-ring-color': 'var(--surface)' }} />
                        <div className="flex-1 text-center sm:text-left min-w-0">
                            <h1 className="text-xl font-extrabold text-default">{friend.name}</h1>
                            <p className="text-muted text-sm">@{friend.username} · {friend.email}</p>
                        </div>
                        {balance && (balance.youOwe > 0 || balance.theyOwe > 0) && (
                            <Button onClick={() => setSettleOpen(true)} className="flex-shrink-0">Settle Up</Button>
                        )}
                    </div>
                    {balance && (
                        <div className="mt-4 flex justify-center sm:justify-start">
                            <CurrencyDisplay
                                amount={balance.theyOwe > 0 ? balance.theyOwe : -balance.youOwe}
                                size="lg"
                                showLabel
                                pill
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Shared Expenses */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-token">
                    <h2 className="font-bold text-default">Shared Expenses</h2>
                </div>
                {expenses.length === 0
                    ? <p className="text-sm text-muted text-center py-8">No shared expenses</p>
                    : (
                        <div className="divide-y divide-token">
                            {expenses.map((exp) => {
                                const uid = user._id?.toString()
                                const myShare = exp.splits?.find((s) => (s.user?._id || s.user)?.toString() === uid)
                                const cat = getCategoryStyle(exp.category)
                                return (
                                    <Link key={exp._id} to={`/expenses/${exp._id}`}
                                        className="flex items-center gap-3 pl-3 pr-5 py-3 hover-surface transition-colors border-l-4"
                                        style={{ borderLeftColor: cat.color }}>
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: cat.soft }}>
                                            {cat.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-default truncate">{exp.description}</p>
                                            <p className="text-xs text-muted">{formatDate(exp.date)}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="amount text-sm font-semibold text-default">{formatCurrency(exp.amount, exp.currency)}</p>
                                            {myShare && <p className="text-xs text-muted">your share: {formatCurrency(myShare.amount, exp.currency)}</p>}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )
                }
            </div>

            {/* Settlement History */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-token">
                    <h2 className="font-bold text-default">Settlement History</h2>
                </div>
                {settlements.length === 0
                    ? <p className="text-sm text-muted text-center py-8">No settlements</p>
                    : (
                        <div className="divide-y divide-token">
                            {settlements.map((s) => {
                                const isPayer = s.from?._id === user._id
                                const tone = isPayer ? 'var(--negative)' : 'var(--positive)'
                                return (
                                    <div key={s._id} className="flex items-center gap-3 px-5 py-3">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tone }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-default">
                                                {isPayer ? 'You paid' : `${s.from?.name} paid you`}
                                            </p>
                                            <p className="text-xs text-muted">{s.note} · {formatRelativeDate(s.createdAt)}</p>
                                        </div>
                                        <p className="amount text-sm font-semibold" style={{ color: tone }}>
                                            {isPayer ? '−' : '+'}{formatCurrency(s.amount, s.currency)}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    )
                }
            </div>

            <SettleUpModal
                isOpen={settleOpen}
                onClose={() => setSettleOpen(false)}
                defaultTo={friend}
                defaultAmount={balance?.youOwe || 0}
                onSuccess={handleSettled}
            />
        </div>
    )
}

export default FriendDetailPage
