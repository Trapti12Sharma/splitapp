import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Calendar, Tag, FileText, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { expenseService } from '../services/expenseService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EditExpenseModal from '../components/expenses/EditExpenseModal'

const CATEGORY_EMOJI = { Food: '🍕', Travel: '✈️', Shopping: '🛍️', Entertainment: '🎬', Bills: '📄', Rent: '🏠', Utilities: '⚡', Health: '❤️', Groceries: '🛒', Transport: '🚗', Other: '💸' }

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

    if (loading) return <div className="h-64 glass-card rounded-2xl animate-pulse" />
    if (!expense) return <p className="text-center text-gray-500 py-16">Expense not found</p>

    const creatorId = (expense.createdBy?._id || expense.createdBy)?.toString()
    const isCreator = creatorId === user._id?.toString()
    const totalShares = expense.splits?.reduce((s, x) => s + (x.shares || 0), 0)

    return (
        <div className="max-w-xl mx-auto space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
                <Link to="/expenses" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
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

            {/* Main card */}
            <div className="glass-card rounded-3xl overflow-hidden">
                {/* Header with gradient */}
                <div className="gradient-primary p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
                            {CATEGORY_EMOJI[expense.category] || '💸'}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-extrabold text-white">{expense.description}</h1>
                            {expense.group && <p className="text-sm text-white/70 mt-0.5">in {expense.group.name}</p>}
                            <p className="text-3xl font-extrabold text-white mt-2">{formatCurrency(expense.amount, expense.currency)}</p>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: Calendar, label: 'Date', value: formatDate(expense.date) },
                            { icon: Tag, label: 'Category', value: expense.category },
                            { icon: User, label: 'Paid by', value: expense.paidBy?.name || 'Unknown', avatar: expense.paidBy },
                        ].map(({ icon: Icon, label, value, avatar }) => (
                            <div key={label} className="p-3 rounded-2xl text-center" style={{ background: 'rgba(99,102,241,0.06)' }}>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                                {avatar ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <Avatar user={avatar} size="sm" />
                                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate w-full text-center">{value}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{value}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {expense.notes && (
                        <div className="flex items-start gap-2.5 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Notes</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{expense.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Split breakdown */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                            Split ({expense.splitType})
                        </p>
                        <div className="space-y-2">
                            {expense.splits?.map(split => (
                                <div key={split.user?._id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <Avatar user={split.user} size="sm" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{split.user?.name}</p>
                                        {expense.splitType === 'percentage' && <p className="text-[10px] text-gray-400">{split.percentage}%</p>}
                                        {expense.splitType === 'shares' && <p className="text-[10px] text-gray-400">{split.shares}/{totalShares} shares</p>}
                                    </div>
                                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">{formatCurrency(split.amount, expense.currency)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Receipt */}
                    {expense.receipt && (
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Receipt</p>
                            <img src={expense.receipt.startsWith('http') ? expense.receipt : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${expense.receipt}`}
                                alt="Receipt" className="max-w-full rounded-2xl border border-gray-100 dark:border-white/10" />
                        </div>
                    )}
                </div>
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
