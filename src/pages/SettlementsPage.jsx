import { useState, useEffect, useCallback } from 'react'
import { Plus, ArrowLeftRight, ArrowRight } from 'lucide-react'
import { settlementService } from '../services/settlementService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatRelativeDate } from '../utils/formatDate'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import SettleUpModal from '../components/settlements/SettleUpModal'

const SettlementsPage = () => {
    const { user } = useAuth()
    const [settlements, setSettlements] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        settlementService.getSettlements()
            .then(res => { if (!cancelled) setSettlements(res.data.data.settlements) })
            .catch(() => { })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [refreshKey])

    const uid = user._id?.toString()

    // Group consecutive settlements by day so the timeline reads like a
    // statement rather than an undifferentiated list.
    const groups = []
    for (const s of settlements) {
        const label = formatRelativeDate(s.createdAt)
        const last = groups[groups.length - 1]
        if (last && last.label === label) last.items.push(s)
        else groups.push({ label, items: [s] })
    }

    return (
        <div className="space-y-5 animate-fade-in">
            <PageHeader
                icon={ArrowLeftRight}
                title="Settlements"
                subtitle="Track payments between friends"
                actions={<Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Settle Up</Button>}
            />

            {loading ? <LoadingSkeleton count={4} /> :
                settlements.length === 0
                    ? <EmptyState icon={ArrowLeftRight} title="No settlements yet" description="Confirm a payment once someone actually pays you." action={() => setShowModal(true)} actionLabel="Settle Up" />
                    : (
                        <div className="space-y-6">
                            {groups.map((group) => (
                                <div key={group.label}>
                                    <p className="text-[11px] font-bold text-subtle uppercase tracking-wider mb-3 px-1">{group.label}</p>
                                    <div className="glass-card rounded-2xl divide-y divide-token overflow-hidden">
                                        {group.items.map(s => {
                                            const isPayer = s.from?._id?.toString() === uid
                                            const tone = isPayer ? 'var(--negative)' : 'var(--positive)'
                                            const soft = isPayer ? 'var(--negative-soft)' : 'var(--positive-soft)'
                                            return (
                                                <div key={s._id} className="flex items-center gap-3 px-4 py-4">
                                                    {/* Directional flow: from -> to, coloured by whether money left or arrived */}
                                                    <div className="flex items-center flex-shrink-0">
                                                        <Avatar user={s.from} size="sm" />
                                                        <div
                                                            className="w-6 h-6 rounded-full flex items-center justify-center -mx-1.5 border-2 z-10"
                                                            style={{ background: soft, borderColor: 'var(--surface)', color: tone }}
                                                        >
                                                            <ArrowRight className="w-3 h-3" />
                                                        </div>
                                                        <Avatar user={s.to} size="sm" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-default truncate">
                                                            {isPayer ? `You paid ${s.to?.name}` : `${s.from?.name} paid you`}
                                                        </p>
                                                        <p className="text-xs text-subtle mt-0.5 truncate">
                                                            {s.note || 'Settlement'}{s.group?.name ? ` · ${s.group.name}` : ''}
                                                        </p>
                                                    </div>
                                                    <p className="amount text-base font-bold flex-shrink-0" style={{ color: tone }}>
                                                        {isPayer ? '−' : '+'}{formatCurrency(s.amount, s.currency)}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
            }

            <SettleUpModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); refresh() }} />
        </div>
    )
}

export default SettlementsPage
