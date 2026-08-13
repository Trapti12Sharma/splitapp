import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { expenseService } from '../services/expenseService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Avatar from '../components/common/Avatar'
import EmptyState from '../components/common/EmptyState'
import AddExpenseModal from '../components/expenses/AddExpenseModal'
import { useDebounce } from '../hooks/useDebounce'

const CATEGORIES = ['All', 'Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Rent', 'Utilities', 'Health', 'Groceries', 'Transport', 'Other']

const ExpensesPage = () => {
    const { user } = useAuth()
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [sort, setSort] = useState('date-desc')
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const debouncedSearch = useDebounce(search, 400)

    // Fetch whenever filters, page, or refreshKey changes
    useEffect(() => {
        let cancelled = false
        setLoading(true)
        const [sortBy, order] = sort.includes('amount')
            ? ['amount', sort.includes('desc') ? 'desc' : 'asc']
            : ['date', sort.includes('asc') ? 'asc' : 'desc']

        expenseService.getExpenses({
            search: debouncedSearch || undefined,
            category: category !== 'All' ? category : undefined,
            sortBy, order, page, limit: 15,
        }).then((res) => {
            if (cancelled) return
            setExpenses(res.data.data.expenses)
            setPagination(res.data.data.pagination)
        }).catch(() => { }).finally(() => { if (!cancelled) setLoading(false) })

        return () => { cancelled = true }
    }, [debouncedSearch, category, sort, page, refreshKey])

    // Reset to page 1 when filters change (not when page or refreshKey changes)
    const prevFilters = useRef({ debouncedSearch, category, sort })
    useEffect(() => {
        const prev = prevFilters.current
        if (prev.debouncedSearch !== debouncedSearch || prev.category !== category || prev.sort !== sort) {
            setPage(1)
            prevFilters.current = { debouncedSearch, category, sort }
        }
    }, [debouncedSearch, category, sort])

    const fetchExpenses = () => setRefreshKey((k) => k + 1)

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
                <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Add Expense</Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Input icon={Search} placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
                <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="date-desc">Newest first</option>
                    <option value="date-asc">Oldest first</option>
                    <option value="amount-desc">Highest amount</option>
                    <option value="amount-asc">Lowest amount</option>
                </select>
            </div>

            {/* Expense List */}
            {loading ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : expenses.length === 0 ? (
                <EmptyState icon={Receipt} title="No expenses found" description="Add your first expense to get started." action={() => setShowModal(true)} actionLabel="Add Expense" />
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                    {expenses.map((exp) => {
                        const uid = user._id?.toString()
                        const myShare = exp.splits?.find((s) => (s.user?._id || s.user)?.toString() === uid)
                        const isPayer = (exp.paidBy?._id || exp.paidBy)?.toString() === uid
                        return (
                            <Link key={exp._id} to={`/expenses/${exp._id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                                    <Receipt className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{exp.description}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {exp.group?.name || 'Personal'} · {exp.category} · {formatDate(exp.date)}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Avatar user={exp.paidBy} size="xs" />
                                        <span className="text-xs text-gray-500">{isPayer ? 'You paid' : `${exp.paidBy?.name} paid`}</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-gray-900">{formatCurrency(exp.amount, exp.currency)}</p>
                                    {myShare && !isPayer && (
                                        <p className="text-xs text-red-500 mt-0.5">you owe {formatCurrency(myShare.amount, exp.currency)}</p>
                                    )}
                                    {isPayer && myShare && exp.splits?.length > 1 && (
                                        <p className="text-xs text-green-600 mt-0.5">you lent {formatCurrency(exp.amount - myShare.amount, exp.currency)}</p>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                    <span className="text-sm text-gray-500">Page {page} of {pagination.pages}</span>
                    <Button variant="secondary" size="sm" disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
            )}

            <AddExpenseModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={fetchExpenses} />
        </div>
    )
}

export default ExpensesPage
