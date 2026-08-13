import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import { expenseService } from '../../services/expenseService'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Rent', 'Utilities', 'Health', 'Groceries', 'Transport', 'Other']
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']

const EditExpenseModal = ({ isOpen, onClose, expense, onSuccess }) => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors }, reset } = useForm()

    // Populate form when modal opens with existing expense data
    useEffect(() => {
        if (isOpen && expense) {
            reset({
                description: expense.description || '',
                amount: expense.amount?.toString() || '',
                currency: expense.currency || 'INR',
                category: expense.category || 'Other',
                date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
                notes: expense.notes || '',
            })
        }
    }, [isOpen, expense, reset])

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('description', data.description)
            formData.append('amount', data.amount)
            formData.append('currency', data.currency)
            formData.append('category', data.category)
            formData.append('date', data.date)
            if (data.notes) formData.append('notes', data.notes)
            if (data.receipt?.[0]) formData.append('receipt', data.receipt[0])

            await expenseService.updateExpense(expense._id, formData)
            toast.success('Expense updated!')
            onSuccess?.()
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update expense')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Expense" size="md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Description" error={errors.description?.message}
                    {...register('description', { required: 'Description is required' })} />

                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input label="Amount" type="number" step="0.01" min="0.01"
                            error={errors.amount?.message}
                            {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Currency</label>
                        <select className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" {...register('currency')}>
                            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                        <select className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" {...register('category')}>
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <Input label="Date" type="date" {...register('date')} />
                </div>

                <Input label="Notes (optional)" placeholder="Any notes..." {...register('notes')} />

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Receipt (optional)</label>
                    <input type="file" accept="image/*"
                        className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-950 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100"
                        {...register('receipt')} />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" className="flex-1" type="button" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1" type="submit" loading={loading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    )
}

export default EditExpenseModal
