import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Receipt } from 'lucide-react'
import { expenseService } from '../services/expenseService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, getCategoryStyle } from '../utils/categoryStyle'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import AddExpenseModal from '../components/expenses/AddExpenseModal'
import { useDebounce } from '../hooks/useDebounce'

const FILTERS = ['All', ...CATEGORIES]

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
            <PageHeader
                icon={Receipt}
                title="Expenses"
                subtitle={`${pagination?.total || 0} total expenses`}
                actions={<Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Add</Button>}
            />

            {/* Filters */}
            <div className="space-y-3">
                <Input icon={Search} placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {FILTERS.map(c => {
                        const active = category === c
                        const style = c === 'All' ? null : getCategoryStyle(c)
                        return (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className="chip flex-shrink-0 border transition-all"
                                style={{
                                    background: active ? (style?.color || 'var(--brand)') : 'var(--surface)',
                                    borderColor: active ? (style?.color || 'var(--brand)') : 'var(--border)',
                                    color: active ? '#fff' : 'var(--text-muted)',
                                }}
                            >
                                <span>{c === 'All' ? '💰' : style.emoji}</span> {c}
                            </button>
                        )
                    })}
                </div>
                <div className="flex justify-end">
                    <select value={sort} onChange={e => setSort(e.target.value)}
                        className="field text-xs font-semibold py-2 w-auto">
                        <option value="date-desc">Newest first</option>
                        <option value="date-asc">Oldest first</option>
                        <option value="amount-desc">Highest amount</option>
                        <option value="amount-asc">Lowest amount</option>
                    </select>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-[72px] skeleton rounded-2xl" />)}</div>
            ) : expenses.length === 0 ? (
                <EmptyState icon={Receipt} title="No expenses found" description="Add your first expense to get started." action={() => setShowModal(true)} actionLabel="Add Expense" />
            ) : (
                <div className="glass-card rounded-2xl overflow-hidden divide-y divide-token">
                    {expenses.map(exp => {
                        const myShare = exp.splits?.find(s => (s.user?._id || s.user)?.toString() === uid)
                        const isPayer = (exp.paidBy?._id || exp.paidBy)?.toString() === uid
                        const style = getCategoryStyle(exp.category)
                        return (
                            <Link key={exp._id} to={`/expenses/${exp._id}`}
                                className="flex items-center gap-3 pl-3 pr-4 py-3.5 hover-surface transition-colors border-l-4"
                                style={{ borderLeftColor: style.color }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: style.soft }}>
                                    {style.emoji}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-default truncate">{exp.description}</p>
                                    <p className="text-xs text-subtle mt-0.5">
                                        {exp.group?.name || 'Personal'} · {formatDate(exp.date)}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="amount text-sm font-bold text-default">{formatCurrency(exp.amount, exp.currency)}</p>
                                    {myShare && !isPayer && <p className="text-xs" style={{ color: 'var(--negative)' }}>-{formatCurrency(myShare.amount)}</p>}
                                    {isPayer && myShare && exp.splits?.length > 1 && <p className="text-xs" style={{ color: 'var(--positive)' }}>+{formatCurrency(exp.amount - myShare.amount)}</p>}
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
                    <span className="text-sm text-muted font-medium">{page} / {pagination.pages}</span>
                    <Button variant="secondary" size="sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
            )}

            <AddExpenseModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={() => setRefreshKey(k => k + 1)} />
        </div>
    )
}

export default ExpensesPage
