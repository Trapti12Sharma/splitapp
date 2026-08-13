import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import Avatar from '../common/Avatar'
import { settlementService } from '../../services/settlementService'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']

const SettleUpModal = ({ isOpen, onClose, defaultTo, defaultAmount = 0, groupId, onSuccess }) => {
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: { amount: '', currency: 'INR', note: '' },
    })

    // Update amount field when defaultAmount or isOpen changes
    useEffect(() => {
        if (isOpen) {
            setValue('amount', defaultAmount > 0 ? defaultAmount.toFixed(2) : '')
        }
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
            toast.success(`Payment of ${data.currency} ${data.amount} recorded!`)
            reset()
            onSuccess?.()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record settlement')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settle Up" size="sm">
            {defaultTo && (
                <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-lg">
                    <Avatar user={defaultTo} size="md" />
                    <div>
                        <p className="text-sm font-medium text-gray-900">Paying {defaultTo.name}</p>
                        <p className="text-xs text-gray-500">@{defaultTo.username}</p>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            label="Amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            error={errors.amount?.message}
                            {...register('amount', {
                                required: 'Amount is required',
                                min: { value: 0.01, message: 'Must be > 0' },
                            })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" {...register('currency')}>
                            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <Input label="Note (optional)" placeholder="e.g. Dinner settlement" {...register('note')} />
                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" className="flex-1" type="button" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1" type="submit" loading={loading}>Record Payment</Button>
                </div>
            </form>
        </Modal>
    )
}

export default SettleUpModal
