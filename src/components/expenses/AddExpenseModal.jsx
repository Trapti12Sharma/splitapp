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

const AddExpenseModal = ({ isOpen, onClose, defaultGroupId, onSuccess }) => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [groups, setGroups] = useState([])
    const [friends, setFriends] = useState([])
    const [selectedGroup, setSelectedGroup] = useState(defaultGroupId || '')
    const [groupMembers, setGroupMembers] = useState([])
    const [selectedParticipants, setSelectedParticipants] = useState([user._id])
    const [splitType, setSplitType] = useState('equal')
    const [splitData, setSplitData] = useState([{ userId: user._id, amount: '', percentage: '', shares: '1' }])
    const [previewSplits, setPreviewSplits] = useState([])
    const fetchedRef = useRef(false)

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
        defaultValues: { currency: 'INR', category: 'Other', date: new Date().toISOString().split('T')[0], paidBy: user._id },
    })
    const amount = watch('amount')

    // Fetch groups and friends only once per open session
    useEffect(() => {
        if (!isOpen) { fetchedRef.current = false; return }
        if (fetchedRef.current) return
        fetchedRef.current = true
        Promise.all([groupService.getGroups(), friendService.getFriends()])
            .then(([gRes, fRes]) => {
                setGroups(gRes.data.data.groups)
                setFriends(fRes.data.data.friends.map((f) => f.friend))
            }).catch(() => { })
    }, [isOpen])

    // Load group members when group changes
    useEffect(() => {
        if (selectedGroup) {
            groupService.getGroup(selectedGroup).then((res) => {
                const members = res.data.data.group.members.map((m) => m.user)
                setGroupMembers(members)
                // By default select ALL group members
                setSelectedParticipants(members.map((m) => m._id))
            }).catch(() => { })
        } else {
            setGroupMembers([])
            // For personal expenses, default to just current user
            setSelectedParticipants([user._id])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGroup])

    // All people available to split with
    const allPeople = selectedGroup ? groupMembers : [user, ...friends]

    // Sync splitData when participants or splitType changes (stable key comparison)
    const prevKey = useRef('')
    useEffect(() => {
        const key = selectedParticipants.join(',') + '|' + splitType
        if (prevKey.current === key) return
        prevKey.current = key
        setSplitData((prev) =>
            selectedParticipants.map((uid) =>
                prev.find((s) => s.userId === uid) || { userId: uid, amount: '', percentage: '', shares: '1' }
            )
        )
    }, [selectedParticipants, splitType])

    // Recalculate preview (use JSON.stringify to avoid object-ref churn)
    const splitDataKey = JSON.stringify(splitData)
    useEffect(() => {
        if (!amount || selectedParticipants.length === 0) { setPreviewSplits([]); return }
        try {
            const preview = calculateSplits(splitType, parseFloat(amount) || 0, splitData.map((s) => ({
                ...s, amount: parseFloat(s.amount) || 0,
                percentage: parseFloat(s.percentage) || 0,
                shares: parseFloat(s.shares) || 1,
            })))
            setPreviewSplits(preview)
        } catch { setPreviewSplits([]) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount, splitType, splitDataKey])

    const toggleParticipant = (uid) => {
        setSelectedParticipants((prev) =>
            prev.includes(uid)
                ? prev.length > 1 ? prev.filter((id) => id !== uid) : prev  // keep at least 1
                : [...prev, uid]
        )
    }

    const selectAll = () => setSelectedParticipants(allPeople.map((p) => p._id))
    const selectOnlyMe = () => setSelectedParticipants([user._id])

    const updateSplitData = (userId, field, value) => {
        setSplitData((prev) => prev.map((s) => s.userId === userId ? { ...s, [field]: value } : s))
    }

    const handleClose = () => {
        reset()
        setSplitType('equal')
        setSelectedGroup(defaultGroupId || '')
        setPreviewSplits([])
        fetchedRef.current = false
        onClose()
    }

    const onSubmit = async (data) => {
        if (selectedParticipants.length === 0) {
            toast.error('Select at least one person to split with')
            return
        }

        const validationError = validateSplits(splitType, parseFloat(data.amount), splitData.map((s) => ({
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

            formData.append('splits', JSON.stringify(splitData.map((s) => ({
                userId: s.userId,
                amount: parseFloat(s.amount) || 0,
                percentage: parseFloat(s.percentage) || 0,
                shares: parseFloat(s.shares) || 1,
            }))))

            if (selectedGroup) {
                await expenseService.createGroupExpense(selectedGroup, formData)
            } else {
                await expenseService.createExpense(formData)
            }

            toast.success('Expense added! Notifications sent to participants.')
            onSuccess?.()
            handleClose()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add expense')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add Expense" size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Description */}
                <Input label="Description" placeholder="e.g. Dinner, Electricity bill..." error={errors.description?.message}
                    {...register('description', { required: 'Description is required' })} />

                {/* Amount + Currency */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input label="Amount" type="number" step="0.01" min="0.01" placeholder="0.00"
                            error={errors.amount?.message}
                            {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 h-[38px]" {...register('currency')}>
                            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Group + Paid by */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Group (optional)</label>
                        <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                            <option value="">No group (personal)</option>
                            {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paid by</label>
                        <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" {...register('paidBy')}>
                            {allPeople.map((p) => (
                                <option key={p._id} value={p._id}>{p._id === user._id ? `You (${p.name})` : p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Category + Date */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" {...register('category')}>
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <Input label="Date" type="date" {...register('date')} />
                </div>

                {/* ─── Participant Selector ─── */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-primary-600" />
                            Split between
                            <span className="text-xs font-normal text-gray-500">({selectedParticipants.length}/{allPeople.length} selected)</span>
                        </label>
                        <div className="flex gap-2">
                            <button type="button" onClick={selectAll}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium">All</button>
                            <span className="text-gray-300">·</span>
                            <button type="button" onClick={selectOnlyMe}
                                className="text-xs text-gray-500 hover:text-gray-700">Only me</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                        {allPeople.map((p) => {
                            const selected = selectedParticipants.includes(p._id)
                            return (
                                <button
                                    key={p._id}
                                    type="button"
                                    onClick={() => toggleParticipant(p._id)}
                                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left ${selected
                                        ? 'border-primary-400 bg-primary-50'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Avatar user={p} size="sm" />
                                        {selected && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-xs font-medium truncate ${selected ? 'text-primary-800' : 'text-gray-700'}`}>
                                            {p._id === user._id ? 'You' : p.name.split(' ')[0]}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">@{p.username}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Split type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Split type</label>
                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                        {SPLIT_TYPES.map(({ value, label }) => (
                            <button key={value} type="button" onClick={() => setSplitType(value)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${splitType === value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                    }`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Split preview & inputs */}
                {selectedParticipants.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Split Breakdown</p>
                            {amount && parseFloat(amount) > 0 && (
                                <p className="text-xs text-gray-500">Total: {formatCurrency(parseFloat(amount))}</p>
                            )}
                        </div>
                        {selectedParticipants.map((uid, idx) => {
                            const person = allPeople.find((p) => p._id === uid)
                            const preview = previewSplits[idx]
                            const sd = splitData.find((s) => s.userId === uid)
                            return (
                                <div key={uid} className="flex items-center gap-2.5">
                                    <Avatar user={person} size="xs" className="flex-shrink-0" />
                                    <span className="text-xs text-gray-700 w-16 truncate font-medium">
                                        {uid === user._id ? 'You' : person?.name?.split(' ')[0]}
                                    </span>

                                    {/* Input based on split type */}
                                    {splitType === 'exact' && (
                                        <div className="flex-1 relative">
                                            <input type="number" step="0.01" min="0" placeholder="0.00"
                                                className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                value={sd?.amount || ''}
                                                onChange={(e) => updateSplitData(uid, 'amount', e.target.value)} />
                                        </div>
                                    )}
                                    {splitType === 'percentage' && (
                                        <div className="flex-1 relative">
                                            <input type="number" step="0.1" min="0" max="100" placeholder="0"
                                                className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 pr-5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                value={sd?.percentage || ''}
                                                onChange={(e) => updateSplitData(uid, 'percentage', e.target.value)} />
                                            <span className="absolute right-2 top-1.5 text-xs text-gray-400">%</span>
                                        </div>
                                    )}
                                    {splitType === 'shares' && (
                                        <div className="flex-1">
                                            <input type="number" step="1" min="1" placeholder="1"
                                                className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                value={sd?.shares || '1'}
                                                onChange={(e) => updateSplitData(uid, 'shares', e.target.value)} />
                                        </div>
                                    )}
                                    {splitType === 'equal' && <div className="flex-1" />}

                                    {/* Calculated amount */}
                                    <div className="text-right flex-shrink-0 w-20">
                                        <span className={`text-sm font-bold ${preview ? 'text-gray-900' : 'text-gray-300'}`}>
                                            {preview ? formatCurrency(preview.amount) : '—'}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Validation indicator */}
                        {splitType === 'exact' && amount && (
                            <div className={`text-xs pt-1 border-t border-gray-200 flex justify-between ${Math.abs(splitData.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0) - parseFloat(amount)) < 0.01
                                ? 'text-green-600' : 'text-red-500'
                                }`}>
                                <span>Total entered</span>
                                <span>{formatCurrency(splitData.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0))}</span>
                            </div>
                        )}
                        {splitType === 'percentage' && (
                            <div className={`text-xs pt-1 border-t border-gray-200 flex justify-between ${Math.abs(splitData.reduce((s, x) => s + (parseFloat(x.percentage) || 0), 0) - 100) < 0.01
                                ? 'text-green-600' : 'text-red-500'
                                }`}>
                                <span>Total %</span>
                                <span>{splitData.reduce((s, x) => s + (parseFloat(x.percentage) || 0), 0).toFixed(1)}%</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Notes */}
                <Input label="Notes (optional)" placeholder="Any additional notes..." {...register('notes')} />

                {/* Receipt */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (optional)</label>
                    <input type="file" accept="image/*"
                        className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        {...register('receipt')} />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" className="flex-1" type="button" onClick={handleClose}>Cancel</Button>
                    <Button className="flex-1" type="submit" loading={loading}>
                        Add Expense
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

export default AddExpenseModal
