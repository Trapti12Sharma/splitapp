import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { analyticsService } from '../services/analyticsService'
import { formatCurrency } from '../utils/formatCurrency'
import LoadingSkeleton from '../components/common/LoadingSkeleton'

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#84cc16', '#14b8a6']

const StatCard = ({ label, value, sub, emoji }) => (
    <div className="glass-card card-hover rounded-2xl p-4">
        <div className="text-2xl mb-2">{emoji}</div>
        <p className="text-lg font-extrabold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
)

const AnalyticsPage = () => {
    const [summary, setSummary] = useState(null)
    const [monthly, setMonthly] = useState([])
    const [categories, setCategories] = useState([])
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        Promise.all([
            analyticsService.getSummary(),
            analyticsService.getMonthlyExpenses(),
            analyticsService.getCategoryBreakdown(),
            analyticsService.getGroupSpending(),
        ]).then(([sRes, mRes, cRes, gRes]) => {
            if (cancelled) return
            setSummary(sRes.data.data)
            setMonthly(mRes.data.data.monthly)
            setCategories(cRes.data.data.categories)
            setGroups(gRes.data.data.groups)
        }).catch(() => { }).finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    if (loading) return <LoadingSkeleton count={4} />

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your spending overview</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <StatCard emoji="💸" label="Total Spent" value={formatCurrency(summary?.totalExpensesAmount)} sub={`${summary?.totalExpensesCount} expenses`} />
                <StatCard emoji="📊" label="Average" value={formatCurrency(summary?.avgExpense)} />
                <StatCard emoji="🏆" label="Largest" value={formatCurrency(summary?.largestExpense)} />
                <StatCard emoji="💳" label="You Paid" value={formatCurrency(summary?.totalAmountPaid)} sub="total paid out" />
                <StatCard emoji="📤" label="You Owe" value={formatCurrency(summary?.totalOwed)} />
                <StatCard emoji="📥" label="Owed to You" value={formatCurrency(summary?.totalOwedToUser)} />
            </div>

            {/* Monthly chart */}
            <div className="glass-card rounded-2xl p-5">
                <h2 className="font-bold text-gray-900 dark:text-white mb-1">Monthly Spending</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Last 12 months</p>
                {monthly.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={monthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                formatter={v => formatCurrency(v)}
                                contentStyle={{ background: '#16162a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e2f0', fontSize: '12px' }}
                                cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                            />
                            <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                ) : <p className="text-sm text-gray-400 text-center py-8">No data yet</p>}
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
                {/* Category breakdown */}
                <div className="glass-card rounded-2xl p-5">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-1">Categories</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Where your money goes</p>
                    {categories.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={categories} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                                        {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: '#16162a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e2f0', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-3">
                                {categories.slice(0, 6).map((c, i) => (
                                    <div key={c.category} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{c.category}</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">{formatCurrency(c.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : <p className="text-sm text-gray-400 text-center py-8">No data yet</p>}
                </div>

                {/* Group spending */}
                <div className="glass-card rounded-2xl p-5">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-1">Group Spending</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Top groups by expense</p>
                    {groups.length > 0 ? (
                        <div className="space-y-4">
                            {groups.map((g, i) => {
                                const max = groups[0]?.total || 1
                                const pct = (g.total / max) * 100
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{g.group?.name || 'Unknown'}</span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">{formatCurrency(g.total)}</span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                            <div className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : <p className="text-sm text-gray-400 text-center py-8">No group expenses yet</p>}
                </div>
            </div>
        </div>
    )
}

export default AnalyticsPage
