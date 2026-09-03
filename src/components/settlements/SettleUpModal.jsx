import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import Avatar from '../common/Avatar'
import { settlementService } from '../../services/settlementService'
import { formatCurrency } from '../../utils/formatCurrency'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']

const SettleUpModal = ({ isOpen, onClose, defaultTo, defaultAmount = 0, groupId, onSuccess }) => {
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: { amount: '', currency: 'INR', note: '' },
    })

    useEffect(() => {
        if (isOpen) setValue('amount', defaultAmount > 0 ? defaultAmount.toFixed(2) : '')
    }, [isOpen, defaultAmount, setValue])

    const onSubmit = async (data) => {
        if (!defaultTo) { toast.error('No recipient selected'); return }
        setLoading(true)
        try {
            await settlementService.createSettlement({
                to: defaultTo._id,
                amount: parseFloat(data.amount),
                currency: data.currency,
                note: data.note,
                group: groupId || undefined,
            })
            toast.success(`Payment recorded!`)
            reset()
            onSuccess?.()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record settlement')
        } finally { setLoading(false) }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settle Up" size="sm">
            {defaultTo && (
                <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl" style={{ background: 'rgba(99,102,241,0.08)' }}>
                    <Avatar user={defaultTo} size="md" />
                    <div>
                        <p className="text-sm font-bold text-white">Paying {defaultTo.name}</p>
                        <p className="text-xs text-gray-400">@{defaultTo.username}</p>
                        {defaultAmount > 0 && (
                            <p className="text-xs text-primary-400 font-semibold mt-0.5">Suggested: {formatCurrency(defaultAmount)}</p>
                        )}
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input label="Amount" type="number" step="0.01" min="0.01" placeholder="0.00"
                            error={errors.amount?.message}
                            {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1.5">Currency</label>
                        <select className="h-[42px] rounded-xl border border-white/10 bg-white/5 text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" {...register('currency')}>
                            {CURRENCIES.map(c => <option key={c} value={c} style={{ background: '#16162a' }}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <Input label="Note (optional)" placeholder="e.g. Dinner settlement" {...register('note')} />
                <div className="flex gap-3 pt-1">
                    <Button variant="secondary" className="flex-1" type="button" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1" type="submit" loading={loading}>Record Payment</Button>
                </div>
            </form>
        </Modal>
    )
}

export default SettleUpModal
