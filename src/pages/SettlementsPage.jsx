import { useState, useEffect, useCallback } from 'react'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { settlementService } from '../services/settlementService'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
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

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Settlements</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track payments between friends</p>
                </div>
                <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Record</Button>
            </div>

            {loading ? <LoadingSkeleton count={4} /> :
                settlements.length === 0
                    ? <EmptyState icon={ArrowLeftRight} title="No settlements yet" description="Record a payment when you settle up with someone." action={() => setShowModal(true)} actionLabel="Record Payment" />
                    : (
                        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
                            {settlements.map(s => {
                                const isPayer = s.from?._id?.toString() === uid
                                return (
                                    <div key={s._id} className="flex items-center gap-3 px-4 py-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPayer ? 'bg-red-500/12' : 'bg-emerald-500/12'}`}>
                                            <ArrowLeftRight className={`w-5 h-5 ${isPayer ? 'text-red-400' : 'text-emerald-500'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Avatar user={isPayer ? s.to : s.from} size="xs" />
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                    {isPayer ? `You paid ${s.to?.name}` : `${s.from?.name} paid you`}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                {s.note || 'Settlement'}{s.group?.name ? ` · ${s.group.name}` : ''} · {formatDate(s.createdAt)}
                                            </p>
                                        </div>
                                        <p className={`text-sm font-extrabold flex-shrink-0 ${isPayer ? 'text-red-400' : 'text-emerald-500'}`}>
                                            {isPayer ? '-' : '+'}{formatCurrency(s.amount, s.currency)}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    )
            }

            <SettleUpModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); refresh() }} />
        </div>
    )
}

export default SettlementsPage
