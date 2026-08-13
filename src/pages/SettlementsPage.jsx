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

    // Runs only on mount and when refreshKey changes — no dependency on inline functions
    useEffect(() => {
        let cancelled = false
        setLoading(true)
        settlementService.getSettlements()
            .then((res) => { if (!cancelled) setSettlements(res.data.data.settlements) })
            .catch(() => { })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [refreshKey])

    const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Settlements</h1>
                <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Record Payment</Button>
            </div>

            {loading ? <LoadingSkeleton count={4} /> :
                settlements.length === 0
                    ? <EmptyState icon={ArrowLeftRight} title="No settlements yet" description="Record payments when you settle up with friends." />
                    : (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                            {settlements.map((s) => {
                                const isPayer = s.from?._id?.toString() === user._id?.toString()
                                return (
                                    <div key={s._id} className="flex items-center gap-3 px-4 py-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isPayer ? 'bg-red-50' : 'bg-green-50'}`}>
                                            <ArrowLeftRight className={`w-5 h-5 ${isPayer ? 'text-red-500' : 'text-green-500'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <Avatar user={isPayer ? s.to : s.from} size="xs" />
                                                <p className="text-sm font-medium text-gray-900">
                                                    {isPayer ? `You paid ${s.to?.name}` : `${s.from?.name} paid you`}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {s.note || 'Settlement'} · {s.group?.name ? `${s.group.name} · ` : ''}{formatDate(s.createdAt)}
                                            </p>
                                        </div>
                                        <p className={`text-sm font-bold flex-shrink-0 ${isPayer ? 'text-red-500' : 'text-green-600'}`}>
                                            {isPayer ? '-' : '+'}{formatCurrency(s.amount, s.currency)}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    )
            }

            <SettleUpModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => { setShowModal(false); refresh() }}
            />
        </div>
    )
}

export default SettlementsPage
