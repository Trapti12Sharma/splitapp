import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { analyticsService } from '../services/analyticsService'
import { formatCurrency } from '../utils/formatCurrency'
import LoadingSkeleton from '../components/common/LoadingSkeleton'

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16']

const StatCard = ({ label, value, sub }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
)

const AnalyticsPage = () => {
    const [summary, setSummary] = useState(null)
    const [monthly, setMonthly] = useState([])
    const [categories, setCategories] = useState([])
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            analyticsService.getSummary(),
            analyticsService.getMonthlyExpenses(),
            analyticsService.getCategoryBreakdown(),
            analyticsService.getGroupSpending(),
        ]).then(([sRes, mRes, cRes, gRes]) => {
            setSummary(sRes.data.data)
            setMonthly(mRes.data.data.monthly)
            setCategories(cRes.data.data.categories)
            setGroups(gRes.data.data.groups)
        }).catch(() => { }).finally(() => setLoading(false))
    }, [])

    if (loading) return <LoadingSkeleton count={4} />

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="Total Spent" value={formatCurrency(summary?.totalExpensesAmount)} sub={`${summary?.totalExpensesCount} expenses`} />
                <StatCard label="Average Expense" value={formatCurrency(summary?.avgExpense)} />
                <StatCard label="Largest Expense" value={formatCurrency(summary?.largestExpense)} />
                <StatCard label="Amount Paid" value={formatCurrency(summary?.totalAmountPaid)} sub="you paid" />
                <StatCard label="You Owe" value={formatCurrency(summary?.totalOwed)} />
                <StatCard label="Owed to You" value={formatCurrency(summary?.totalOwedToUser)} />
            </div>

            {/* Monthly Chart */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Monthly Expenses (Last 12 Months)</h2>
                {monthly.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={monthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v) => formatCurrency(v)} />
                            <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : <p className="text-sm text-gray-500 text-center py-8">No data yet</p>}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Category Breakdown</h2>
                    {categories.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={categories} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                                        {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-3">
                                {categories.slice(0, 6).map((c, i) => (
                                    <div key={c.category} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-xs text-gray-600">{c.category}</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-900">{formatCurrency(c.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : <p className="text-sm text-gray-500 text-center py-8">No data yet</p>}
                </div>

                {/* Group Spending */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Group Spending</h2>
                    {groups.length > 0 ? (
                        <div className="space-y-3">
                            {groups.map((g, i) => {
                                const max = groups[0]?.total || 1
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs text-gray-600">{g.group?.name || 'Unknown'}</span>
                                            <span className="text-xs font-medium">{formatCurrency(g.total)}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(g.total / max) * 100}%` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : <p className="text-sm text-gray-500 text-center py-8">No group expenses yet</p>}
                </div>
            </div>
        </div>
    )
}

export default AnalyticsPage
