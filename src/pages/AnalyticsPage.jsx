import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { PieChart as PieChartIcon } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { analyticsService } from '../services/analyticsService'
import { formatCurrency } from '../utils/formatCurrency'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import PageHeader from '../components/common/PageHeader'
import { CHART_PALETTE, getCategoryStyle } from '../utils/categoryStyle'

const StatCard = ({ label, value, sub, emoji }) => (
    <div className="glass-card card-hover rounded-2xl p-4">
        <div className="text-2xl mb-2">{emoji}</div>
        <p className="amount text-lg font-extrabold text-default">{value}</p>
        <p className="text-xs font-semibold text-muted mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-subtle mt-0.5">{sub}</p>}
    </div>
)

const AnalyticsPage = () => {
    const { isDark } = useTheme()
    const [summary, setSummary] = useState(null)
    const [monthly, setMonthly] = useState([])
    const [categories, setCategories] = useState([])
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)

    // Recharts styles its tooltip and axes inline, so it cannot inherit our CSS
    // variables — derive the colours from the active theme instead.
    const tooltipStyle = {
        background: isDark ? '#1b1b34' : '#ffffff',
        border: `1px solid ${isDark ? '#33335c' : '#e8eaf3'}`,
        borderRadius: '12px',
        color: isDark ? '#edeef7' : '#14142b',
        fontSize: '12px',
        boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.55)' : '0 12px 32px rgba(20,20,43,0.12)',
    }
    const axisColor = isDark ? '#7c81a1' : '#8a8fa8'

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
            <PageHeader icon={PieChartIcon} title="Analytics" subtitle="Your spending overview" />

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
                <h2 className="font-bold text-default mb-1">Monthly Spending</h2>
                <p className="text-xs text-subtle mb-4">Last 12 months</p>
                {monthly.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={monthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
                            <Tooltip
                                formatter={v => formatCurrency(v)}
                                contentStyle={tooltipStyle}
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
                ) : <p className="text-sm text-subtle text-center py-8">No data yet</p>}
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
                {/* Category breakdown */}
                <div className="glass-card rounded-2xl p-5">
                    <h2 className="font-bold text-default mb-1">Categories</h2>
                    <p className="text-xs text-subtle mb-4">Where your money goes</p>
                    {categories.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={categories} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                                        {categories.map((c, i) => <Cell key={i} fill={getCategoryStyle(c.category).color} />)}
                                    </Pie>
                                    <Tooltip formatter={v => formatCurrency(v)} contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-3">
                                {categories.slice(0, 6).map((c) => (
                                    <div key={c.category} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm flex-shrink-0">{getCategoryStyle(c.category).emoji}</span>
                                            <span className="text-xs text-muted font-medium">{c.category}</span>
                                        </div>
                                        <span className="amount text-xs font-bold text-default">{formatCurrency(c.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : <p className="text-sm text-subtle text-center py-8">No data yet</p>}
                </div>

                {/* Group spending */}
                <div className="glass-card rounded-2xl p-5">
                    <h2 className="font-bold text-default mb-1">Group Spending</h2>
                    <p className="text-xs text-subtle mb-4">Top groups by expense</p>
                    {groups.length > 0 ? (
                        <div className="space-y-4">
                            {groups.map((g, i) => {
                                const max = groups[0]?.total || 1
                                const pct = (g.total / max) * 100
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-xs font-semibold text-muted">{g.group?.name || 'Unknown'}</span>
                                            <span className="text-xs font-bold text-default">{formatCurrency(g.total)}</span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                            <div className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${CHART_PALETTE[i % CHART_PALETTE.length]}, ${CHART_PALETTE[(i + 1) % CHART_PALETTE.length]})` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : <p className="text-sm text-subtle text-center py-8">No group expenses yet</p>}
                </div>
            </div>
        </div>
    )
}

export default AnalyticsPage
