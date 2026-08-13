import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Receipt } from 'lucide-react'
import api from '../services/api'
import { friendService } from '../services/friendService'
import { expenseService } from '../services/expenseService'
import { settlementService } from '../services/settlementService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate, formatRelativeDate } from '../utils/formatDate'
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
    if (!friend) return <p className="text-center text-gray-500 py-16">User not found</p>

    return (
        <div className="space-y-6">
            <Link to="/friends" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" /> Back to Friends
            </Link>

            {/* Profile card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <Avatar user={friend} size="xl" />
                <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-xl font-bold text-gray-900">{friend.name}</h1>
                    <p className="text-gray-500 text-sm">@{friend.username}</p>
                    <p className="text-gray-500 text-sm">{friend.email}</p>
                    {balance && (
                        <div className="mt-3">
                            <CurrencyDisplay
                                amount={balance.theyOwe > 0 ? balance.theyOwe : -balance.youOwe}
                                size="lg"
                                showLabel
                            />
                        </div>
                    )}
                </div>
                {balance && (balance.youOwe > 0 || balance.theyOwe > 0) && (
                    <Button onClick={() => setSettleOpen(true)}>Settle Up</Button>
                )}
            </div>

            {/* Shared Expenses */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-50">
                    <h2 className="font-semibold text-gray-900">Shared Expenses</h2>
                </div>
                {expenses.length === 0
                    ? <p className="text-sm text-gray-500 text-center py-8">No shared expenses</p>
                    : (
                        <div className="divide-y divide-gray-50">
                            {expenses.map((exp) => {
                                const uid = user._id?.toString()
                                const myShare = exp.splits?.find((s) => (s.user?._id || s.user)?.toString() === uid)
                                return (
                                    <Link key={exp._id} to={`/expenses/${exp._id}`}
                                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                        <Receipt className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{exp.description}</p>
                                            <p className="text-xs text-gray-500">{formatDate(exp.date)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">{formatCurrency(exp.amount, exp.currency)}</p>
                                            {myShare && <p className="text-xs text-gray-500">your share: {formatCurrency(myShare.amount, exp.currency)}</p>}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )
                }
            </div>

            {/* Settlement History */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-50">
                    <h2 className="font-semibold text-gray-900">Settlement History</h2>
                </div>
                {settlements.length === 0
                    ? <p className="text-sm text-gray-500 text-center py-8">No settlements</p>
                    : (
                        <div className="divide-y divide-gray-50">
                            {settlements.map((s) => {
                                const isPayer = s.from?._id === user._id
                                return (
                                    <div key={s._id} className="flex items-center gap-3 px-5 py-3">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isPayer ? 'bg-red-400' : 'bg-green-400'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {isPayer ? 'You paid' : `${s.from?.name} paid you`}
                                            </p>
                                            <p className="text-xs text-gray-500">{s.note} · {formatRelativeDate(s.createdAt)}</p>
                                        </div>
                                        <p className={`text-sm font-semibold ${isPayer ? 'text-red-500' : 'text-green-600'}`}>
                                            {isPayer ? '-' : '+'}{formatCurrency(s.amount, s.currency)}
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
