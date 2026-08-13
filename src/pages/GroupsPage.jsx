import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, UsersRound } from 'lucide-react'
import { groupService } from '../services/groupService'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingSkeleton from '../components/common/LoadingSkeleton'

const GroupsPage = () => {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        groupService.getGroups().then((res) => setGroups(res.data.data.groups)).catch(() => { }).finally(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
                <Link to="/groups/create"><Button><Plus className="w-4 h-4" /> New Group</Button></Link>
            </div>

            {loading ? <LoadingSkeleton count={4} /> :
                groups.length === 0 ? (
                    <EmptyState icon={UsersRound} title="No groups yet" description="Create a group to split expenses with multiple people." />
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groups.map((g) => (
                            <Link key={g._id} to={`/groups/${g._id}`}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-primary-200 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    {g.groupImage
                                        ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${g.groupImage}`} alt={g.name} className="w-12 h-12 rounded-xl object-cover" />
                                        : <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-xl font-bold text-primary-600">{g.name[0]}</div>
                                    }
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{g.name}</p>
                                        <p className="text-xs text-gray-500">{g.members?.length} members</p>
                                    </div>
                                </div>
                                {g.description && <p className="text-xs text-gray-500 line-clamp-2">{g.description}</p>}
                            </Link>
                        ))}
                    </div>
                )
            }
        </div>
    )
}

export default GroupsPage
