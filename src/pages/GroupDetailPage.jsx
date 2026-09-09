import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Crown, Receipt, Users } from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { groupService } from '../services/groupService'
import { expenseService } from '../services/expenseService'
import { analyticsService } from '../services/analyticsService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import AddExpenseModal from '../components/expenses/AddExpenseModal'
import SettleUpModal from '../components/settlements/SettleUpModal'
import EmptyState from '../components/common/EmptyState'
import CurrencyDisplay from '../components/common/CurrencyDisplay'
import { getCategoryStyle } from '../utils/categoryStyle'

const TABS = ['expenses', 'balances', 'stats', 'members']

const GroupDetailPage = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const [group, setGroup] = useState(null)
    const [expenses, setExpenses] = useState([])
    const [balances, setBalances] = useState([])
    const [whoOwes, setWhoOwes] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [tab, setTab] = useState('expenses')
    const [showExpenseModal, setShowExpenseModal] = useState(false)
    const [settleTarget, setSettleTarget] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const refresh = () => setRefreshKey(k => k + 1)

    useEffect(() => {
        let cancelled = false
        setError(null)
        const fetchData = async () => {
            try {
                const [gRes, eRes] = await Promise.all([
                    groupService.getGroup(id),
                    expenseService.getGroupExpenses(id),
                ])
                if (cancelled) return
                setGroup(gRes.data.data.group)
                setExpenses(eRes.data.data.expenses)

                // Non-critical — fetch independently
                Promise.all([
                    groupService.getGroupBalances(id),
                    analyticsService.getGroupStats(id),
                ]).then(([bRes, sRes]) => {
                    if (cancelled) return
                    setBalances(bRes.data.data.balances || [])
                    setWhoOwes(bRes.data.data.whoOwesWhom || [])
                    setStats(sRes.data.data)
                }).catch(() => { })
            } catch (err) {
                if (!cancelled) setError(err?.response?.data?.message || 'Failed to load group')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        fetchData()
        return () => { cancelled = true }
    }, [id, refreshKey])

    const isAdmin = group?.members?.find(m => m.user?._id?.toString() === user._id?.toString())?.role === 'admin'
    const uid = user._id?.toString()

    if (loading) return <LoadingSkeleton count={4} />
    if (error) return (
        <div className="space-y-4">
            <Link to="/groups" className="flex items-center gap-1 text-sm text-muted hover:text-muted"><ArrowLeft className="w-4 h-4" /> Back</Link>
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                <button onClick={refresh} className="mt-3 text-sm text-primary-600 hover:underline">Try again</button>
            </div>
        </div>
    )
    if (!group) return <p className="text-center text-muted py-16">Group not found</p>

    return (
        <div className="space-y-5">
            <Link to="/groups" className="flex items-center gap-1 text-sm text-muted hover:text-muted dark:hover:text-gray-200">
                <ArrowLeft className="w-4 h-4" /> Back to Groups
            </Link>

            {/* Header */}
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                {group.groupImage
                    ? <img src={group.groupImage} className="w-14 h-14 rounded-xl object-cover" alt={group.name} />
                    : <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-2xl font-bold text-white">{group.name[0]}</div>
                }
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-default">{group.name}</h1>
                    {group.description && <p className="text-sm text-muted">{group.description}</p>}
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-subtle flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {group.members?.length} members
                        </span>
                        {stats && (
                            <span className="text-xs text-subtle flex items-center gap-1">
                                <Receipt className="w-3.5 h-3.5" /> {stats.totalExpenses} expenses · {formatCurrency(stats.totalAmount)}
                            </span>
                        )}
                    </div>
                </div>
                <Button onClick={() => setShowExpenseModal(true)} size="sm">
                    <Plus className="w-4 h-4" /> Add
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-2 dark:bg-gray-800/50 rounded-xl p-1 overflow-x-auto scrollbar-hide">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-surface dark:bg-gray-700 shadow-sm text-default' : 'text-muted hover:text-muted dark:hover:text-gray-200'
                            }`}>
                        {t === 'stats' ? '📊 Stats' : t === 'balances' ? '⚖️ Balances' : t === 'members' ? '👥 Members' : '🧾 Expenses'}
                    </button>
                ))}
            </div>

            {/* ─── EXPENSES TAB ─── */}
            {tab === 'expenses' && (
                <div className="glass-card rounded-2xl divide-y divide-token dark:divide-gray-800">
                    {expenses.length === 0
                        ? <EmptyState icon={Receipt} title="No expenses yet" description="Add the first expense for this group." action={() => setShowExpenseModal(true)} actionLabel="Add Expense" />
                        : expenses.map(exp => {
                            const myShare = exp.splits?.find(s => (s.user?._id || s.user)?.toString() === uid)
                            const isPayer = (exp.paidBy?._id || exp.paidBy)?.toString() === uid
                            const cat = getCategoryStyle(exp.category)
                            return (
                                <Link key={exp._id} to={`/expenses/${exp._id}`}
                                    className="flex items-center gap-3 pl-3 pr-4 py-3.5 hover-surface transition-colors border-l-4"
                                    style={{ borderLeftColor: cat.color }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: cat.soft }}>
                                        {cat.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-default truncate">{exp.description}</p>
                                        <p className="text-xs text-muted">
                                            {isPayer ? 'You paid' : `${exp.paidBy?.name} paid`} · {formatDate(exp.date)}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="amount text-sm font-bold text-default">{formatCurrency(exp.amount, exp.currency)}</p>
                                        {myShare && (
                                            <p className="text-xs" style={{ color: isPayer && exp.splits?.length > 1 ? 'var(--positive)' : 'var(--negative)' }}>
                                                {isPayer && exp.splits?.length > 1 ? `lent ${formatCurrency(exp.amount - myShare.amount)}` : `your share: ${formatCurrency(myShare.amount)}`}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            )
                        })
                    }
                </div>
            )}

            {/* ─── BALANCES TAB ─── */}
            {tab === 'balances' && (
                <div className="space-y-4">
                    {/* Member balances */}
                    <div className="glass-card rounded-2xl divide-y divide-token dark:divide-gray-800">
                        {balances.length === 0
                            ? <p className="text-sm text-muted text-center py-8">No balances yet</p>
                            : balances.map(({ user: member, netBalance }) => (
                                <div key={member._id} className="flex items-center gap-3 px-4 py-3.5">
                                    <Avatar user={member} size="sm" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-default">
                                            {member._id?.toString() === uid ? 'You' : member.name}
                                        </p>
                                    </div>
                                    <CurrencyDisplay amount={netBalance} size="sm" pill />
                                </div>
                            ))
                        }
                    </div>

                    {/* Who owes whom */}
                    {whoOwes.length > 0 && (
                        <div className="glass-card rounded-2xl p-5">
                            <p className="text-sm font-bold text-default mb-3">Who owes whom</p>
                            <div className="space-y-3">
                                {whoOwes.map((item, i) => {
                                    const fromMember = group.members?.find(m => m.user?._id?.toString() === item.from?.toString())?.user
                                    const toMember = group.members?.find(m => m.user?._id?.toString() === item.to?.toString())?.user
                                    const isMe = item.from?.toString() === uid
                                    const toIsMe = item.to?.toString() === uid
                                    return (
                                        <div key={i} className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Avatar user={fromMember} size="xs" />
                                                <span className="text-sm text-muted truncate">
                                                    <span className="font-semibold">{isMe ? 'You' : fromMember?.name}</span>
                                                    {' owes '}
                                                    <span className="font-semibold">{toIsMe ? 'you' : toMember?.name}</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-sm font-bold" style={{ color: 'var(--negative)' }}>{formatCurrency(item.amount)}</span>
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

            {/* ─── STATS TAB ─── */}
            {tab === 'stats' && (
                <div className="space-y-4">
                    {!stats ? (
                        <LoadingSkeleton count={3} />
                    ) : (
                        <>
                            {/* Group summary */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Total Spent', value: formatCurrency(stats.totalAmount), icon: '💸' },
                                    { label: 'Expenses', value: stats.totalExpenses, icon: '🧾' },
                                    { label: 'Members', value: stats.memberCount, icon: '👥' },
                                ].map(({ label, value, icon }) => (
                                    <div key={label} className="glass-card rounded-2xl p-4 text-center">
                                        <div className="text-2xl mb-1">{icon}</div>
                                        <p className="text-lg font-bold text-default">{value}</p>
                                        <p className="text-xs text-muted">{label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Per-person breakdown */}
                            <div className="glass-card rounded-2xl p-5">
                                <p className="text-sm font-bold text-default mb-4">Per Person Breakdown</p>
                                <div className="space-y-3">
                                    {stats.memberStats?.map(m => (
                                        <div key={m.user._id} className="flex items-center gap-3">
                                            <Avatar user={m.user} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-semibold text-default truncate">
                                                        {m.user._id?.toString() === uid ? 'You' : m.user.name}
                                                    </p>
                                                    <div className="text-sm font-bold" style={{ color: m.netBalance > 0 ? 'var(--positive)' : m.netBalance < 0 ? 'var(--negative)' : 'var(--text-subtle)' }}>
                                                        {m.netBalance > 0 ? '+' : ''}{formatCurrency(m.netBalance)}
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 text-xs text-muted">
                                                    <span>Paid: <span className="font-semibold" style={{ color: 'var(--positive)' }}>{formatCurrency(m.totalPaid)}</span></span>
                                                    <span>Owed: <span className="font-semibold" style={{ color: 'var(--negative)' }}>{formatCurrency(m.totalOwed)}</span></span>
                                                    <span>{m.expenseCount} paid</span>
                                                </div>
                                                {/* Visual bar */}
                                                <div className="mt-1.5 h-1.5 bg-surface-2 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    {stats.totalAmount > 0 && (
                                                        <div
                                                            className="h-full gradient-primary rounded-full transition-all"
                                                            style={{ width: `${Math.min((m.totalPaid / stats.totalAmount) * 100, 100)}%` }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Category breakdown */}
                            {stats.categoryBreakdown?.length > 0 && (
                                <div className="glass-card rounded-2xl p-5">
                                    <p className="text-sm font-bold text-default mb-4">Category Breakdown</p>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0" style={{ width: 120, height: 120 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsPie>
                                                    <Pie data={stats.categoryBreakdown} dataKey="total" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                                                        {stats.categoryBreakdown.map((c, i) => <Cell key={i} fill={getCategoryStyle(c.category).color} />)}
                                                    </Pie>
                                                    <Tooltip formatter={v => formatCurrency(v)} />
                                                </RechartsPie>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            {stats.categoryBreakdown.map((c) => (
                                                <div key={c.category} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm flex-shrink-0">{getCategoryStyle(c.category).emoji}</span>
                                                        <span className="text-xs text-muted">{c.category}</span>
                                                    </div>
                                                    <span className="amount text-xs font-semibold text-default">{formatCurrency(c.total)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ─── MEMBERS TAB ─── */}
            {tab === 'members' && (
                <div className="glass-card rounded-2xl divide-y divide-token dark:divide-gray-800">
                    {group.members?.map(m => (
                        <div key={m.user?._id} className="flex items-center gap-3 px-4 py-3.5">
                            <Avatar user={m.user} size="md" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-default">
                                    {m.user?.name} {m.user?._id?.toString() === uid && <span className="text-subtle font-normal">(you)</span>}
                                </p>
                                <p className="text-xs text-muted">@{m.user?.username}</p>
                            </div>
                            {m.role === 'admin' && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full">
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
