import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Check, UserCheck } from 'lucide-react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import Avatar from '../common/Avatar'
import { expenseService } from '../../services/expenseService'
import { groupService } from '../../services/groupService'
import { friendService } from '../../services/friendService'
import { useAuth } from '../../context/AuthContext'
import { calculateSplits, validateSplits } from '../../utils/calculateSplits'
import { formatCurrency } from '../../utils/formatCurrency'

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Rent', 'Utilities', 'Health', 'Groceries', 'Transport', 'Other']
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']
const SPLIT_TYPES = [
    { value: 'equal', label: 'Equal' },
    { value: 'exact', label: 'Exact' },
    { value: 'percentage', label: '%' },
    { value: 'shares', label: 'Shares' },
]

const EditExpenseModal = ({ isOpen, onClose, expense, onSuccess }) => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [groups, setGroups] = useState([])
    const [friends, setFriends] = useState([])
    const [selectedGroup, setSelectedGroup] = useState('')
    const [groupMembers, setGroupMembers] = useState([])
    const [selectedParticipants, setSelectedParticipants] = useState([])
    const [splitType, setSplitType] = useState('equal')
    const [splitData, setSplitData] = useState([])
    const [previewSplits, setPreviewSplits] = useState([])
    const fetchedRef = useRef(false)

    const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm()
    const amount = watch('amount')

    // Populate form with existing expense data
    useEffect(() => {
        if (!isOpen || !expense) return

        // Set form values
        reset({
            description: expense.description || '',
            amount: expense.amount?.toString() || '',
            currency: expense.currency || 'INR',
            category: expense.category || 'Other',
            date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
            notes: expense.notes || '',
            paidBy: expense.paidBy?._id || expense.paidBy || user._id,
        })

        // Set group
        const grpId = expense.group?._id || expense.group || ''
        setSelectedGroup(grpId)

        // Set split type
        setSplitType(expense.splitType || 'equal')

        // Set participants from existing splits
        const participants = expense.splits?.map(s => s.user?._id || s.user) || [user._id]
        setSelectedParticipants(participants)

        // Set split data
        setSplitData(expense.splits?.map(s => ({
            userId: s.user?._id || s.user,
            amount: s.amount?.toString() || '',
            percentage: s.percentage?.toString() || '',
            shares: s.shares?.toString() || '1',
        })) || [])
    }, [isOpen, expense])

    // Fetch groups + friends once
    useEffect(() => {
        if (!isOpen) { fetchedRef.current = false; return }
        if (fetchedRef.current) return
        fetchedRef.current = true
        Promise.all([groupService.getGroups(), friendService.getFriends()])
            .then(([gRes, fRes]) => {
                setGroups(gRes.data.data.groups)
                setFriends(fRes.data.data.friends.map(f => f.friend))
            }).catch(() => { })
    }, [isOpen])

    // Load group members when group changes
    useEffect(() => {
        if (selectedGroup) {
            groupService.getGroup(selectedGroup).then(res => {
                const members = res.data.data.group.members.map(m => m.user)
                setGroupMembers(members)
            }).catch(() => { })
        } else {
            setGroupMembers([])
        }
    }, [selectedGroup])

    const allPeople = selectedGroup ? groupMembers : [user, ...friends]

    // Sync splitData when participants change
    const prevKey = useRef('')
    useEffect(() => {
        const key = selectedParticipants.join(',') + '|' + splitType
        if (prevKey.current === key) return
        prevKey.current = key
        setSplitData(prev =>
            selectedParticipants.map(uid =>
                prev.find(s => s.userId === uid) || { userId: uid, amount: '', percentage: '', shares: '1' }
            )
        )
    }, [selectedParticipants, splitType])

    // Calculate preview
    const splitDataKey = JSON.stringify(splitData)
    useEffect(() => {
        if (!amount || selectedParticipants.length === 0) { setPreviewSplits([]); return }
        try {
            const preview = calculateSplits(splitType, parseFloat(amount) || 0, splitData.map(s => ({
                ...s, amount: parseFloat(s.amount) || 0,
                percentage: parseFloat(s.percentage) || 0,
                shares: parseFloat(s.shares) || 1,
            })))
            setPreviewSplits(preview)
        } catch { setPreviewSplits([]) }
    }, [amount, splitType, splitDataKey])

    const toggleParticipant = (uid) => {
        setSelectedParticipants(prev =>
            prev.includes(uid) ? (prev.length > 1 ? prev.filter(id => id !== uid) : prev) : [...prev, uid]
        )
    }

    const selectAll = () => setSelectedParticipants(allPeople.map(p => p._id))

    const updateSplitData = (userId, field, value) => {
        setSplitData(prev => prev.map(s => s.userId === userId ? { ...s, [field]: value } : s))
    }

    const onSubmit = async (data) => {
        if (selectedParticipants.length === 0) { toast.error('Select at least one person'); return }

        const validationError = validateSplits(splitType, parseFloat(data.amount), splitData.map(s => ({
            amount: parseFloat(s.amount) || 0,
            percentage: parseFloat(s.percentage) || 0,
            shares: parseFloat(s.shares) || 1,
        })))
        if (validationError && splitType !== 'equal') { toast.error(validationError); return }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('description', data.description)
            formData.append('amount', data.amount)
            formData.append('currency', data.currency)
            formData.append('category', data.category)
            formData.append('paidBy', data.paidBy || user._id)
            formData.append('splitType', splitType)
            formData.append('date', data.date)
            if (data.notes) formData.append('notes', data.notes)
            if (data.receipt?.[0]) formData.append('receipt', data.receipt[0])
            formData.append('splits', JSON.stringify(splitData.map(s => ({
                userId: s.userId,
                amount: parseFloat(s.amount) || 0,
                percentage: parseFloat(s.percentage) || 0,
                shares: parseFloat(s.shares) || 1,
            }))))

            await expenseService.updateExpense(expense._id, formData)
            toast.success('Expense updated!')
            onSuccess?.()
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Expense" size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Description */}
                <Input label="Description" error={errors.description?.message}
                    {...register('description', { required: 'Required' })} />

                {/* Amount + Currency */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input label="Amount" type="number" step="0.01" min="0.01" error={errors.amount?.message}
                            {...register('amount', { required: 'Required', min: { value: 0.01, message: '> 0' } })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Currency</label>
                        <select className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm h-[42px]" {...register('currency')}>
                            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Group + Paid by */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Group</label>
                        <select className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm"
                            value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
                            <option value="">No group</option>
                            {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Paid by</label>
                        <select className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm" {...register('paidBy')}>
                            {allPeople.map(p => (
                                <option key={p._id} value={p._id}>{p._id === user._id ? `You (${p.name})` : p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Category + Date */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                        <select className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm" {...register('category')}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <Input label="Date" type="date" {...register('date')} />
                </div>

                {/* Participants */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-primary-600" />
                            Split between ({selectedParticipants.length})
                        </label>
                        <button type="button" onClick={selectAll} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Select All</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                        {allPeople.map(p => {
                            const selected = selectedParticipants.includes(p._id)
                            return (
                                <button key={p._id} type="button" onClick={() => toggleParticipant(p._id)}
                                    className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all text-left ${selected ? 'border-primary-400 bg-primary-50 dark:bg-primary-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}>
                                    <div className="relative flex-shrink-0">
                                        <Avatar user={p} size="xs" />
                                        {selected && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary-600 rounded-full flex items-center justify-center">
                                                <Check className="w-2 h-2 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-xs font-medium truncate ${selected ? 'text-primary-800 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {p._id === user._id ? 'You' : p.name?.split(' ')[0]}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Split type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Split type</label>
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                        {SPLIT_TYPES.map(({ value, label }) => (
                            <button key={value} type="button" onClick={() => setSplitType(value)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${splitType === value ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'
                                    }`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Split preview */}
                {selectedParticipants.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Split Breakdown</p>
                        {selectedParticipants.map((uid, idx) => {
                            const person = allPeople.find(p => p._id === uid)
                            const preview = previewSplits[idx]
                            const sd = splitData.find(s => s.userId === uid)
                            return (
                                <div key={uid} className="flex items-center gap-2">
                                    <Avatar user={person} size="xs" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300 w-16 truncate font-medium">
                                        {uid === user._id ? 'You' : person?.name?.split(' ')[0]}
                                    </span>
                                    {splitType === 'exact' && (
                                        <input type="number" step="0.01" placeholder="0.00"
                                            className="flex-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5"
                                            value={sd?.amount || ''} onChange={e => updateSplitData(uid, 'amount', e.target.value)} />
                                    )}
                                    {splitType === 'percentage' && (
                                        <input type="number" step="0.1" placeholder="%"
                                            className="flex-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5"
                                            value={sd?.percentage || ''} onChange={e => updateSplitData(uid, 'percentage', e.target.value)} />
                                    )}
                                    {splitType === 'shares' && (
                                        <input type="number" step="1" min="1"
                                            className="flex-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5"
                                            value={sd?.shares || '1'} onChange={e => updateSplitData(uid, 'shares', e.target.value)} />
                                    )}
                                    {splitType === 'equal' && <div className="flex-1" />}
                                    <span className="text-sm font-bold text-gray-900 dark:text-white w-20 text-right">
                                        {preview ? formatCurrency(preview.amount) : '—'}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Notes */}
                <Input label="Notes (optional)" {...register('notes')} />

                {/* Receipt */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Receipt (optional)</label>
                    <input type="file" accept="image/*"
                        className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-950 file:text-primary-700 dark:file:text-primary-300"
                        {...register('receipt')} />
                    {expense?.receipt && (
                        <p className="text-xs text-gray-500 mt-1">Current receipt will be kept unless you upload a new one.</p>
                    )}
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
