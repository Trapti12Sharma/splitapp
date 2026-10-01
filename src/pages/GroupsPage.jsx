import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Users, UsersRound, ChevronRight, Sparkles, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { groupService } from '../services/groupService'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import PageHeader from '../components/common/PageHeader'
import EditGroupModal from '../components/groups/EditGroupModal'
import ConfirmDialog from '../components/common/ConfirmDialog'

const GROUP_GRADIENTS = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-600',
]

// Edit button shown to all members; delete only to admins.
const GroupCardMenu = ({ onEdit, onDelete, isAdmin }) => (
    <div className="flex items-center gap-1.5" onClick={e => e.preventDefault()}>
        <button
            aria-label="Edit group"
            onClick={e => { e.stopPropagation(); onEdit() }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover-surface"
            style={{ background: 'var(--surface-2)' }}
        >
            <Edit2 className="w-3.5 h-3.5 text-muted" />
        </button>
        {isAdmin && (
            <button
                aria-label="Delete group"
                onClick={e => { e.stopPropagation(); onDelete() }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'var(--negative-soft)' }}
            >
                <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--negative)' }} />
            </button>
        )}
    </div>
)

const GroupsPage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)

    // Edit / delete state
    const [editTarget, setEditTarget] = useState(null)       // group object to edit
    const [deleteTarget, setDeleteTarget] = useState(null)   // group object to delete
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        groupService.getGroups()
            .then(res => setGroups(res.data.data.groups))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    // Any member can edit; only admins can delete
    const isMember = (group) =>
        group.members?.some(
            m => (m.user?._id ?? m.user)?.toString() === user?._id?.toString()
        )

    // Current user is admin if they appear in members with role 'admin'.
    // Normalise both sides to string — the populated member has .user._id (ObjectId)
    // while user._id from AuthContext is already a string, but belt-and-suspenders.
    const isAdmin = (group) =>
        group.members?.some(
            m => (m.user?._id ?? m.user)?.toString() === user?._id?.toString() && m.role === 'admin'
        )

    const handleEditSuccess = (updatedGroup) => {
        setGroups(prev => prev.map(g => g._id === updatedGroup._id ? updatedGroup : g))
        setEditTarget(null)
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await groupService.deleteGroup(deleteTarget._id)
            toast.success(`"${deleteTarget.name}" deleted`)
            setGroups(prev => prev.filter(g => g._id !== deleteTarget._id))
            setDeleteTarget(null)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete group')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                icon={UsersRound}
                title="Groups"
                subtitle={groups.length > 0 ? `${groups.length} active group${groups.length > 1 ? 's' : ''}` : 'Split with teams'}
                actions={
                    <Link to="/groups/create">
                        <Button className="gap-1.5">
                            <Plus className="w-4 h-4" />
                            New Group
                        </Button>
                    </Link>
                }
            />

            {loading ? (
                <LoadingSkeleton count={4} />
            ) : groups.length === 0 ? (
                /* Empty state */
                <div className="glass-card rounded-3xl p-12 text-center">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-default mb-2">No groups yet</h3>
                    <p className="text-sm text-muted mb-6 max-w-xs mx-auto">
                        Create a group to split expenses with roommates, friends, or for trips
                    </p>
                    <Link to="/groups/create">
                        <Button>
                            <Sparkles className="w-4 h-4" />
                            Create your first group
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((g, index) => {
                        const gradient = GROUP_GRADIENTS[index % GROUP_GRADIENTS.length]
                        const admin = isAdmin(g)
                        const member = isMember(g)
                        return (
                            <div key={g._id} className="relative glass-card card-hover rounded-2xl group">
                                {/* Clickable area navigates to detail */}
                                <Link to={`/groups/${g._id}`} className="block cursor-pointer">
                                    {/* Color band top */}
                                    <div className={`h-1.5 bg-gradient-to-r ${gradient} rounded-t-2xl`} />

                                    <div className="p-5">
                                        {/* Group identity */}
                                        <div className="flex items-start gap-3 mb-4">
                                            {g.groupImage ? (
                                                <img src={g.groupImage} alt={g.name}
                                                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                                            ) : (
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                                    <span className="text-xl font-extrabold text-white">{g.name[0]}</span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-default truncate text-base leading-tight">
                                                    {g.name}
                                                </h3>
                                                {g.description && (
                                                    <p className="text-xs text-muted mt-0.5 line-clamp-1">
                                                        {g.description}
                                                    </p>
                                                )}
                                            </div>
                                            {/* Chevron for non-members; spacer reserves room for action buttons */}
                                            {!member
                                                ? <ChevronRight className="w-4 h-4 text-subtle dark:text-muted flex-shrink-0 mt-1 group-hover:text-primary-500 transition-colors" />
                                                : <div className={`flex-shrink-0 ${admin ? 'w-[72px]' : 'w-8'}`} />
                                            }
                                        </div>

                                        {/* Members avatars */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex -space-x-2">
                                                    {g.members?.slice(0, 4).map((m, i) => {
                                                        const initials = m.user?.name?.charAt(0)?.toUpperCase() || '?'
                                                        const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500']
                                                        return (
                                                            <div key={i}
                                                                className={`w-7 h-7 rounded-full ${colors[i % colors.length]} border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden`}>
                                                                {m.user?.profileImage
                                                                    ? <img src={m.user.profileImage} alt="" className="w-full h-full object-cover" />
                                                                    : initials
                                                                }
                                                            </div>
                                                        )
                                                    })}
                                                    {g.members?.length > 4 && (
                                                        <div className="w-7 h-7 rounded-full bg-surface-2 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-muted dark:text-subtle text-[10px] font-bold">
                                                            +{g.members.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs text-subtle ml-2">
                                                    {g.members?.length} member{g.members?.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            {/* Badge */}
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white`}>
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Action buttons — edit for all members, delete for admins only */}
                                {member && (
                                    <div className="absolute top-4 right-4">
                                        <GroupCardMenu
                                            isAdmin={admin}
                                            onEdit={() => setEditTarget(g)}
                                            onDelete={() => setDeleteTarget(g)}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Add group card */}
                    <Link to="/groups/create"
                        className="rounded-2xl border-2 border-dashed border-token dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 flex flex-col items-center justify-center p-8 gap-3 transition-all duration-200 group min-h-[160px]">
                        <div className="w-10 h-10 rounded-xl bg-surface-2 dark:bg-gray-800 group-hover:gradient-primary flex items-center justify-center transition-all">
                            <Plus className="w-5 h-5 text-subtle group-hover:text-primary-600" />
                        </div>
                        <p className="text-sm font-semibold text-subtle group-hover:text-primary-600 transition-colors">
                            New Group
                        </p>
                    </Link>
                </div>
            )}

            {/* Edit modal */}
            <EditGroupModal
                isOpen={!!editTarget}
                onClose={() => setEditTarget(null)}
                group={editTarget}
                onSuccess={handleEditSuccess}
            />

            {/* Delete confirmation */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete this group?"
                message={`This permanently deletes "${deleteTarget?.name}" and all its expenses. This cannot be undone.`}
                confirmLabel="Delete Group"
                loading={deleting}
            />
        </div>
    )
}

export default GroupsPage
