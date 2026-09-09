import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, Users, Clock, Check, X, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { friendService } from '../services/friendService'
import { useDebounce } from '../hooks/useDebounce'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import CurrencyDisplay from '../components/common/CurrencyDisplay'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/common/PageHeader'

const FriendsPage = () => {
    const [tab, setTab] = useState('friends')
    const [friends, setFriends] = useState([])
    const [requests, setRequests] = useState([])
    const [searchResults, setSearchResults] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [searchLoading, setSearchLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState({})
    const debouncedSearch = useDebounce(searchQuery, 400)

    const fetchData = useCallback(async () => {
        try {
            const [fRes, rRes] = await Promise.all([friendService.getFriends(), friendService.getFriendRequests()])
            setFriends(fRes.data.data.friends)
            setRequests(rRes.data.data.requests)
        } catch { } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    useEffect(() => {
        if (debouncedSearch.length < 2) { setSearchResults([]); return }
        setSearchLoading(true)
        friendService.searchUsers(debouncedSearch)
            .then(res => setSearchResults(res.data.data.users))
            .catch(() => { })
            .finally(() => setSearchLoading(false))
    }, [debouncedSearch])

    const handleSendRequest = async (userId) => {
        setActionLoading(p => ({ ...p, [userId]: true }))
        try {
            await friendService.sendRequest(userId)
            toast.success('Friend request sent!')
            setSearchResults(prev => prev.filter(u => u._id !== userId))
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed')
        } finally { setActionLoading(p => ({ ...p, [userId]: false })) }
    }

    const handleAccept = async (id) => {
        setActionLoading(p => ({ ...p, [id]: 'accept' }))
        try {
            await friendService.acceptRequest(id)
            toast.success('Friend request accepted!')
            fetchData()
        } catch { toast.error('Failed') } finally { setActionLoading(p => ({ ...p, [id]: false })) }
    }

    const handleReject = async (id) => {
        setActionLoading(p => ({ ...p, [id]: 'reject' }))
        try {
            await friendService.rejectRequest(id)
            toast.success('Rejected')
            setRequests(prev => prev.filter(r => r._id !== id))
        } catch { toast.error('Failed') } finally { setActionLoading(p => ({ ...p, [id]: false })) }
    }

    const tabs = [
        { id: 'friends', label: 'Friends', count: friends.length },
        { id: 'requests', label: 'Requests', count: requests.length },
        { id: 'find', label: 'Find People' },
    ]

    return (
        <div className="space-y-5 animate-fade-in">
            <PageHeader icon={Users} title="Friends" subtitle="Manage your connections" />

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: 'var(--brand-soft)' }}>
                {tabs.map(({ id, label, count }) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === id ? 'gradient-primary text-white shadow-sm' : 'text-muted hover:text-muted dark:hover:text-gray-200'
                            }`}>
                        {label}{count > 0 && <span className={`ml-1.5 text-xs rounded-full px-1.5 ${tab === id ? 'bg-white/25' : 'bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'}`}>{count}</span>}
                    </button>
                ))}
            </div>

            {/* Friends list */}
            {tab === 'friends' && (
                loading ? <LoadingSkeleton count={4} /> :
                    friends.length === 0
                        ? <EmptyState icon={Users} title="No friends yet" description="Find people and send friend requests" action={() => setTab('find')} actionLabel="Find Friends" />
                        : <div className="grid sm:grid-cols-2 gap-3">
                            {friends.map(({ friendshipId, friend, balance }) => (
                                <Link key={friendshipId} to={`/friends/${friend._id}`}
                                    className="glass-card card-hover rounded-2xl p-4 flex items-center gap-3">
                                    <Avatar user={friend} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-default truncate">{friend.name}</p>
                                        <p className="text-xs text-subtle">@{friend.username}</p>
                                    </div>
                                    <CurrencyDisplay amount={balance} size="sm" pill />
                                </Link>
                            ))}
                        </div>
            )}

            {/* Requests */}
            {tab === 'requests' && (
                requests.length === 0
                    ? <EmptyState icon={Clock} title="No pending requests" description="You're all caught up!" />
                    : <div className="space-y-3">
                        {requests.map(req => (
                            <div key={req._id} className="glass-card rounded-2xl p-4 flex items-center gap-3">
                                <Avatar user={req.requester} size="md" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-default">{req.requester?.name}</p>
                                    <p className="text-xs text-subtle">@{req.requester?.username}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAccept(req._id)} disabled={actionLoading[req._id]}
                                        className="w-9 h-9 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 flex items-center justify-center transition-colors">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                    </button>
                                    <button onClick={() => handleReject(req._id)} disabled={actionLoading[req._id]}
                                        className="w-9 h-9 rounded-xl bg-red-500/15 hover:bg-red-500/25 flex items-center justify-center transition-colors">
                                        <X className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
            )}

            {/* Find people */}
            {tab === 'find' && (
                <div className="space-y-4">
                    <Input icon={Search} placeholder="Search by name, username, or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    {searchLoading && <p className="text-sm text-subtle">Searching...</p>}
                    {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                        <div className="glass-card rounded-2xl p-8 text-center">
                            <p className="text-sm text-muted">No users found for "{searchQuery}"</p>
                        </div>
                    )}
                    <div className="space-y-3">
                        {searchResults.map(u => (
                            <div key={u._id} className="glass-card rounded-2xl p-4 flex items-center gap-3">
                                <Avatar user={u} size="md" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-default">{u.name}</p>
                                    <p className="text-xs text-subtle">@{u.username}</p>
                                </div>
                                <Button size="sm" variant="secondary" loading={actionLoading[u._id]} onClick={() => handleSendRequest(u._id)}>
                                    <UserPlus className="w-3.5 h-3.5" /> Add
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default FriendsPage
