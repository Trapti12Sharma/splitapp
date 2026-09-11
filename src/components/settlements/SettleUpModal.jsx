import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import Avatar from '../common/Avatar'
import { settlementService } from '../../services/settlementService'
import { friendService } from '../../services/friendService'
import { formatCurrency } from '../../utils/formatCurrency'
import { useDebounce } from '../../hooks/useDebounce'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']

/**
 * Records a settlement. Only the person who actually received the money can
 * do this — the backend now always records the current user as the
 * receiver (`to`), so this confirms "X paid me", not "I paid X". That
 * matters: it means a debtor can no longer unilaterally mark their own debt
 * as settled with no confirmation from the person they owe.
 *
 * `defaultFrom` pre-fills who paid (e.g. opened from a friend/group balance
 * that already knows who owes what). Without it — the standalone "Record
 * Payment" entry point — the payer is picked here via search; that search
 * previously didn't exist at all, so that button had no way to actually
 * complete the form.
 */
const SettleUpModal = ({ isOpen, onClose, defaultFrom, defaultAmount = 0, groupId, onSuccess }) => {
    const [loading, setLoading] = useState(false)
    const [payer, setPayer] = useState(defaultFrom || null)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const debouncedSearch = useDebounce(searchQuery, 400)
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: { amount: '', currency: 'INR', note: '' },
    })

    useEffect(() => {
        if (isOpen) {
            setValue('amount', defaultAmount > 0 ? defaultAmount.toFixed(2) : '')
            setPayer(defaultFrom || null)
            setSearchQuery('')
            setSearchResults([])
        }
    }, [isOpen, defaultFrom, defaultAmount, setValue])

    useEffect(() => {
        if (defaultFrom || debouncedSearch.length < 2) { setSearchResults([]); return }
        setSearching(true)
        friendService.searchUsers(debouncedSearch)
            .then(res => setSearchResults(res.data.data.users))
            .catch(() => { })
            .finally(() => setSearching(false))
    }, [debouncedSearch, defaultFrom])

    const onSubmit = async (data) => {
        if (!payer) { toast.error('Choose who paid you first'); return }
        setLoading(true)
        try {
            await settlementService.createSettlement({
                from: payer._id,
                amount: parseFloat(data.amount),
                currency: data.currency,
                note: data.note,
                group: groupId || undefined,
            })
            toast.success('Payment confirmed!')
            reset()
            onSuccess?.()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to confirm settlement')
        } finally { setLoading(false) }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settle Up" size="sm">
            {payer ? (
                <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl" style={{ background: 'var(--brand-soft)' }}>
                    <Avatar user={payer} size="md" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-default">Received from {payer.name}</p>
                        <p className="text-xs text-subtle">@{payer.username}</p>
                        {defaultAmount > 0 && (
                            <p className="text-xs text-primary-500 font-semibold mt-0.5">Suggested: {formatCurrency(defaultAmount)}</p>
                        )}
                    </div>
                    {!defaultFrom && (
                        <button type="button" onClick={() => setPayer(null)} className="text-xs font-semibold text-subtle hover:text-default transition-colors">
                            Change
                        </button>
                    )}
                </div>
            ) : (
                <div className="mb-5">
                    <Input icon={Search} placeholder="Who paid you? Search friends..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
                    {searching && <p className="text-xs text-subtle mt-2">Searching...</p>}
                    {!searching && searchResults.length > 0 && (
                        <div className="mt-2 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                            {searchResults.slice(0, 5).map(u => (
                                <button key={u._id} type="button" onClick={() => setPayer(u)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover-surface text-left transition-colors">
                                    <Avatar user={u} size="sm" />
                                    <div>
                                        <p className="text-sm font-semibold text-default">{u.name}</p>
                                        <p className="text-xs text-subtle">@{u.username}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {payer && (
                <p className="text-xs text-subtle mb-4 -mt-1">
                    Only confirm this once you've actually received the money — it clears what {payer.name} owes you.
                </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input label="Amount" type="number" step="0.01" min="0.01" placeholder="0.00"
                            error={errors.amount?.message}
                            {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-muted mb-1.5">Currency</label>
                        <select className="field h-[42px] w-24" {...register('currency')}>
                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <Input label="Note (optional)" placeholder="e.g. Dinner settlement" {...register('note')} />
                <div className="flex gap-3 pt-1">
                    <Button variant="secondary" className="flex-1" type="button" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1" type="submit" loading={loading} disabled={!payer}>Settle Up</Button>
                </div>
            </form>
        </Modal>
    )
}

export default SettleUpModal
