import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Calendar, User, Users, Percent, Hash } from 'lucide-react'
import toast from 'react-hot-toast'
import { expenseService } from '../services/expenseService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { getCategoryStyle } from '../utils/categoryStyle'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import ConfirmDialog from '../components/common/ConfirmDialog'
import TicketDivider from '../components/common/TicketDivider'
import EditExpenseModal from '../components/expenses/EditExpenseModal'

/**
 * The centrepiece of the app's visual identity: an expense reads as a literal
 * receipt, torn along a perforated line at the point where "what was paid"
 * becomes "how it was split" — the one place in the app where the metaphor of
 * splitting a bill is made physical instead of just a card full of numbers.
 */
const ExpenseDetailPage = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [expense, setExpense] = useState(null)
    const [loading, setLoading] = useState(true)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const fetchExpense = () => {
        expenseService.getExpense(id)
            .then(res => setExpense(res.data.data.expense))
            .catch(() => { })
            .finally(() => setLoading(false))
    }
    useEffect(() => { fetchExpense() }, [id])

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await expenseService.deleteExpense(id)
            toast.success('Expense deleted')
            navigate('/expenses', { replace: true })
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete')
        } finally { setDeleting(false) }
    }

    if (loading) return <div className="h-96 skeleton rounded-3xl max-w-xl mx-auto" />
    if (!expense) return <p className="text-center text-muted py-16">Expense not found</p>

    const creatorId = (expense.createdBy?._id || expense.createdBy)?.toString()
    const isCreator = creatorId === user._id?.toString()
    const totalShares = expense.splits?.reduce((s, x) => s + (x.shares || 0), 0)
    const style = getCategoryStyle(expense.category)
    const uid = user._id?.toString()
    const myShare = expense.splits?.find((s) => (s.user?._id || s.user)?.toString() === uid)
    const isPayer = (expense.paidBy?._id || expense.paidBy)?.toString() === uid

    return (
        <div className="max-w-xl mx-auto space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
                <Link to="/expenses" className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-default transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                {isCreator && (
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                    </div>
                )}
            </div>

            {/* The ticket */}
            <div
                className="rounded-3xl overflow-hidden border relative"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-lg)' }}
            >
                {/* Stub — who paid, how much, what for. Category colour sets the tone
                    of the whole ticket instead of one fixed brand gradient. */}
                <div
                    className="relative p-6 pb-8 scallop-edge"
                    style={{ background: `linear-gradient(135deg, ${style.color}, ${style.color}cc)` }}
                >
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl flex-shrink-0">
                            {style.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-extrabold text-white leading-tight">{expense.description}</h1>
                            <p className="text-xs text-white/75 mt-1 flex items-center gap-1.5">
                                {expense.group ? `in ${expense.group.name}` : 'Personal expense'}
                                <span className="opacity-60">·</span>
                                {expense.category}
                            </p>
                        </div>
                    </div>
                    <p className="amount text-4xl font-bold text-white mt-4 tracking-tight">
                        {formatCurrency(expense.amount, expense.currency)}
                    </p>
                    {myShare && (
                        <p className="text-xs text-white/80 mt-1.5 font-semibold">
                            {isPayer && expense.splits?.length > 1
                                ? `You lent ${formatCurrency(expense.amount - myShare.amount, expense.currency)}`
                                : `Your share: ${formatCurrency(myShare.amount, expense.currency)}`}
                        </p>
                    )}
                </div>

                {/* Meta strip */}
                <div className="px-6 pt-5">
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: Calendar, label: 'Date', value: formatDate(expense.date) },
                            { icon: Hash, label: 'Split', value: expense.splitType },
                            { icon: User, label: 'Paid by', value: expense.paidBy?.name?.split(' ')[0] || 'Unknown', avatar: expense.paidBy },
                        ].map(({ icon: Icon, label, value, avatar }) => (
                            <div key={label} className="p-3 rounded-2xl text-center" style={{ background: 'var(--surface-2)' }}>
                                <p className="text-[9px] font-bold text-subtle uppercase tracking-wider mb-1.5 flex items-center justify-center gap-1">
                                    <Icon className="w-3 h-3" /> {label}
                                </p>
                                {avatar ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <Avatar user={avatar} size="sm" />
                                        <p className="text-xs font-bold text-default truncate w-full text-center capitalize">{value}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs font-bold text-default capitalize">{value}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {expense.notes && (
                        <p className="text-sm text-muted mt-4 px-1 italic">"{expense.notes}"</p>
                    )}
                </div>

                {/* The tear — this is the split, literally perforated off the payment above. */}
                <div className="pt-5">
                    <TicketDivider label="Split between" />
                </div>

                {/* Split breakdown */}
                <div className="px-6 pt-5 pb-6 space-y-2">
                    {expense.splits?.map(split => {
                        const isMe = (split.user?._id || split.user)?.toString() === uid
                        return (
                            <div
                                key={split.user?._id}
                                className="flex items-center gap-3 p-3 rounded-2xl border-l-4"
                                style={{ background: 'var(--surface-2)', borderLeftColor: isMe ? style.color : 'transparent' }}
                            >
                                <Avatar user={split.user} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-default truncate">
                                        {isMe ? 'You' : split.user?.name}
                                    </p>
                                    {expense.splitType === 'percentage' && (
                                        <p className="text-[10px] text-subtle flex items-center gap-0.5"><Percent className="w-2.5 h-2.5" />{split.percentage}%</p>
                                    )}
                                    {expense.splitType === 'shares' && (
                                        <p className="text-[10px] text-subtle flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{split.shares}/{totalShares} shares</p>
                                    )}
                                </div>
                                <p className="amount text-base font-bold text-default">{formatCurrency(split.amount, expense.currency)}</p>
                            </div>
                        )
                    })}
                </div>

                {/* Receipt image */}
                {expense.receipt && (
                    <div className="px-6 pb-6">
                        <TicketDivider label="Receipt" />
                        <img
                            src={expense.receipt.startsWith('http') ? expense.receipt : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${expense.receipt}`}
                            alt="Receipt"
                            className="max-w-full rounded-2xl border mt-5"
                            style={{ borderColor: 'var(--border)' }}
                        />
                    </div>
                )}
            </div>

            <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
                title="Delete Expense" message={`Delete "${expense.description}"? This cannot be undone.`}
                confirmLabel="Delete" loading={deleting} />

            <EditExpenseModal isOpen={editOpen} onClose={() => setEditOpen(false)} expense={expense}
                onSuccess={() => { setEditOpen(false); fetchExpense() }} />
        </div>
    )
}

export default ExpenseDetailPage
