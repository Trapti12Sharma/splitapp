import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Receipt, Calendar, Tag, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { expenseService } from '../services/expenseService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import ConfirmDialog from '../components/common/ConfirmDialog'

const ExpenseDetailPage = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [expense, setExpense] = useState(null)
    const [loading, setLoading] = useState(true)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        expenseService.getExpense(id).then((res) => setExpense(res.data.data.expense)).catch(() => { }).finally(() => setLoading(false))
    }, [id])

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

    if (loading) return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
    if (!expense) return <p className="text-center text-gray-500 py-16">Expense not found</p>

    const creatorId = expense.createdBy?._id?.toString() || expense.createdBy?.toString()
    const isCreator = creatorId === user._id?.toString()
    const totalShares = expense.splits?.reduce((s, x) => s + (x.shares || 0), 0)

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <Link to="/expenses" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                {isCreator && (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toast('Edit coming soon')}>
                            <Edit2 className="w-4 h-4" /> Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                            <Trash2 className="w-4 h-4" /> Delete
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <Receipt className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900">{expense.description}</h1>
                        {expense.group && <p className="text-sm text-gray-500">in {expense.group.name}</p>}
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(expense.amount, expense.currency)}</p>
                        <p className="text-xs text-gray-500">{expense.currency}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-gray-50">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-sm font-medium text-gray-900">{formatDate(expense.date)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="text-sm font-medium text-gray-900">{expense.category}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Avatar user={expense.paidBy} size="sm" />
                        <div>
                            <p className="text-xs text-gray-500">Paid by</p>
                            <p className="text-sm font-medium text-gray-900">{expense.paidBy?.name}</p>
                        </div>
                    </div>
                </div>

                {expense.notes && (
                    <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-500">Notes</p>
                            <p className="text-sm text-gray-700">{expense.notes}</p>
                        </div>
                    </div>
                )}

                {/* Split breakdown */}
                <div>
                    <p className="text-sm font-semibold text-gray-900 mb-3">Split ({expense.splitType})</p>
                    <div className="space-y-2">
                        {expense.splits?.map((split) => (
                            <div key={split.user?._id} className="flex items-center gap-3">
                                <Avatar user={split.user} size="sm" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{split.user?.name}</p>
                                    {expense.splitType === 'percentage' && <p className="text-xs text-gray-500">{split.percentage}%</p>}
                                    {expense.splitType === 'shares' && <p className="text-xs text-gray-500">{split.shares}/{totalShares} shares</p>}
                                </div>
                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(split.amount, expense.currency)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Receipt */}
                {expense.receipt && (
                    <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">Receipt</p>
                        <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${expense.receipt}`} alt="Receipt" className="max-w-xs rounded-lg border border-gray-200" />
                    </div>
                )}
            </div>

            <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
                title="Delete Expense" message={`Delete "${expense.description}"? This action cannot be undone.`}
                confirmLabel="Delete" loading={deleting} />
        </div>
    )
}

export default ExpenseDetailPage
