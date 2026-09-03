import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Receipt, Filter } from 'lucide-react'
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
const CATEGORY_EMOJI = { Food: '🍕', Travel: '✈️', Shopping: '🛍️', Entertainment: '🎬', Bills: '📄', Rent: '🏠', Utilities: '⚡', Health: '❤️', Groceries: '🛒', Transport: '🚗', Other: '💸', All: '💰' }

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
    const prevFilters = useRef({ debouncedSearch, category, sort })

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        const [sortBy, order] = sort.includes('amount') ? ['amount', sort.includes('desc') ? 'desc' : 'asc'] : ['date', sort.includes('asc') ? 'asc' : 'desc']
        expenseService.getExpenses({ search: debouncedSearch || undefined, category: category !== 'All' ? category : undefined, sortBy, order, page, limit: 15 })
            .then(res => { if (!cancelled) { setExpenses(res.data.data.expenses); setPagination(res.data.data.pagination) } })
            .catch(() => { })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [debouncedSearch, category, sort, page, refreshKey])

    useEffect(() => {
        const prev = prevFilters.current
        if (prev.debouncedSearch !== debouncedSearch || prev.category !== category || prev.sort !== sort) {
            setPage(1)
            prevFilters.current = { debouncedSearch, category, sort }
        }
    }, [debouncedSearch, category, sort])

    const uid = user._id?.toString()

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Expenses</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{pagination?.total || 0} total expenses</p>
                </div>
                <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Add</Button>
            </div>

            {/* Filters */}
            <div className="space-y-3">
                <Input icon={Search} placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {CATEGORIES.map(c => (
                        <button key={c} onClick={() => setCategory(c)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${category === c ? 'gradient-primary text-white shadow-sm' : 'glass-card text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}>
                            {CATEGORY_EMOJI[c]} {c}
                        </button>
                    ))}
                </div>
                <div className="flex justify-end">
                    <select value={sort} onChange={e => setSort(e.target.value)}
                        className="text-xs font-semibold rounded-xl px-3 py-2 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                        <option value="date-desc">Newest first</option>
                        <option value="date-asc">Oldest first</option>
                        <option value="amount-desc">Highest amount</option>
                        <option value="amount-asc">Lowest amount</option>
                    </select>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-[72px] glass-card rounded-2xl animate-pulse" />)}</div>
            ) : expenses.length === 0 ? (
                <EmptyState icon={Receipt} title="No expenses found" description="Add your first expense to get started." action={() => setShowModal(true)} actionLabel="Add Expense" />
            ) : (
                <div className="glass-card rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
                    {expenses.map(exp => {
                        const myShare = exp.splits?.find(s => (s.user?._id || s.user)?.toString() === uid)
                        const isPayer = (exp.paidBy?._id || exp.paidBy)?.toString() === uid
                        return (
                            <Link key={exp._id} to={`/expenses/${exp._id}`}
                                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-gray-50 dark:bg-white/8">
                                    {CATEGORY_EMOJI[exp.category] || '💸'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{exp.description}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {exp.group?.name || 'Personal'} · {formatDate(exp.date)}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(exp.amount, exp.currency)}</p>
                                    {myShare && !isPayer && <p className="text-xs text-red-400">-{formatCurrency(myShare.amount)}</p>}
                                    {isPayer && myShare && exp.splits?.length > 1 && <p className="text-xs text-emerald-500">+{formatCurrency(exp.amount - myShare.amount)}</p>}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{page} / {pagination.pages}</span>
                    <Button variant="secondary" size="sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
            )}

            <AddExpenseModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={() => setRefreshKey(k => k + 1)} />
        </div>
    )
}

export default ExpensesPage
