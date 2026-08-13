import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, Users, Clock, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { friendService } from '../services/friendService'
import { useDebounce } from '../hooks/useDebounce'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import CurrencyDisplay from '../components/common/CurrencyDisplay'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import EmptyState from '../components/common/EmptyState'

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
    }, []) // stable — no external deps needed

    useEffect(() => { fetchData() }, [])

    useEffect(() => {
        if (debouncedSearch.length < 2) { setSearchResults([]); return }
        setSearchLoading(true)
        friendService.searchUsers(debouncedSearch)
            .then((res) => setSearchResults(res.data.data.users))
            .catch(() => { })
            .finally(() => setSearchLoading(false))
    }, [debouncedSearch])

    const handleSendRequest = async (userId) => {
        setActionLoading((p) => ({ ...p, [userId]: true }))
        try {
            await friendService.sendRequest(userId)
            toast.success('Friend request sent!')
            setSearchResults((prev) => prev.filter((u) => u._id !== userId))
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send request')
        } finally {
            setActionLoading((p) => ({ ...p, [userId]: false }))
        }
    }

    const handleAccept = async (id) => {
        setActionLoading((p) => ({ ...p, [id]: 'accept' }))
        try {
            await friendService.acceptRequest(id)
            toast.success('Friend request accepted!')
            fetchData()
        } catch { toast.error('Failed to accept') } finally {
            setActionLoading((p) => ({ ...p, [id]: false }))
        }
    }

    const handleReject = async (id) => {
        setActionLoading((p) => ({ ...p, [id]: 'reject' }))
        try {
            await friendService.rejectRequest(id)
            toast.success('Request rejected')
            setRequests((prev) => prev.filter((r) => r._id !== id))
        } catch { toast.error('Failed to reject') } finally {
            setActionLoading((p) => ({ ...p, [id]: false }))
        }
    }

    const tabs = [
        { id: 'friends', label: 'Friends', count: friends.length },
        { id: 'requests', label: 'Requests', count: requests.length },
        { id: 'find', label: 'Find People' },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Friends</h1>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                {tabs.map(({ id, label, count }) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label}
                        {count > 0 && <span className="ml-1.5 bg-primary-100 text-primary-700 text-xs rounded-full px-1.5">{count}</span>}
                    </button>
                ))}
            </div>

            {/* Friends List */}
            {tab === 'friends' && (
                loading ? <LoadingSkeleton count={4} /> :
                    friends.length === 0
                        ? <EmptyState icon={Users} title="No friends yet" description="Search for people and send friend requests to get started." action={() => setTab('find')} actionLabel="Find Friends" />
                        : <div className="grid sm:grid-cols-2 gap-3">
                            {friends.map(({ friendshipId, friend, balance }) => (
                                <Link key={friendshipId} to={`/friends/${friend._id}`}
                                    className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:border-primary-200 transition-colors">
                                    <Avatar user={friend} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{friend.name}</p>
                                        <p className="text-xs text-gray-500">@{friend.username}</p>
                                    </div>
                                    <CurrencyDisplay amount={balance} size="sm" showLabel />
                                </Link>
                            ))}
                        </div>
            )}

            {/* Friend Requests */}
            {tab === 'requests' && (
                requests.length === 0
                    ? <EmptyState icon={Clock} title="No pending requests" description="You're all caught up." />
                    : <div className="space-y-3">
                        {requests.map((req) => (
                            <div key={req._id} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                <Avatar user={req.requester} size="md" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900">{req.requester?.name}</p>
                                    <p className="text-xs text-gray-500">@{req.requester?.username}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="success" size="sm" loading={actionLoading[req._id] === 'accept'} onClick={() => handleAccept(req._id)}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button variant="danger" size="sm" loading={actionLoading[req._id] === 'reject'} onClick={() => handleReject(req._id)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
            )}

            {/* Find People */}
            {tab === 'find' && (
                <div className="space-y-4">
                    <Input icon={Search} placeholder="Search by name, username, or email..."
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    {searchLoading && <p className="text-sm text-gray-500">Searching...</p>}
                    {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No users found</p>
                    )}
                    <div className="space-y-3">
                        {searchResults.map((u) => (
                            <div key={u._id} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                <Avatar user={u} size="md" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900">{u.name}</p>
                                    <p className="text-xs text-gray-500">@{u.username}</p>
                                </div>
                                <Button size="sm" variant="secondary" loading={actionLoading[u._id]} onClick={() => handleSendRequest(u._id)}>
                                    <UserPlus className="w-4 h-4" /> Add
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
