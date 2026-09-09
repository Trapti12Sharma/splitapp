import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Search, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { groupService } from '../services/groupService'
import { friendService } from '../services/friendService'
import { useDebounce } from '../hooks/useDebounce'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Avatar from '../components/common/Avatar'
import ImagePicker from '../components/common/ImagePicker'

const CreateGroupPage = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedMembers, setSelectedMembers] = useState([])
    // Plain state — the previous `{...register('groupImage')} onChange={...}` was
    // overwriting react-hook-form's handler, so the image never got submitted.
    const [imageFile, setImageFile] = useState(null)
    const debouncedSearch = useDebounce(searchQuery, 400)
    const { register, handleSubmit, formState: { errors } } = useForm()

    useEffect(() => {
        if (debouncedSearch.trim().length < 2) {
            setSearchResults([])
            return
        }
        let cancelled = false
        friendService
            .searchUsers(debouncedSearch)
            .then((res) => { if (!cancelled) setSearchResults(res.data.data.users) })
            .catch(() => { })
        return () => { cancelled = true }
    }, [debouncedSearch])

    const addMember = (user) => {
        if (!selectedMembers.find((m) => m._id === user._id)) {
            setSelectedMembers((prev) => [...prev, user])
            setSearchResults((prev) => prev.filter((u) => u._id !== user._id))
            setSearchQuery('')
        }
    }

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', data.name)
            if (data.description) formData.append('description', data.description)
            if (imageFile) formData.append('groupImage', imageFile)
            formData.append('memberIds', JSON.stringify(selectedMembers.map((m) => m._id)))

            const res = await groupService.createGroup(formData)
            toast.success('Group created!')
            navigate(`/groups/${res.data.data.group._id}`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create group')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
            <Link
                to="/groups"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-default transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Groups
            </Link>

            <div>
                <h1 className="text-2xl font-extrabold text-default">Create Group</h1>
                <p className="text-sm text-muted mt-0.5">Start splitting with a new group</p>
            </div>

            <div className="glass-card rounded-3xl p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="flex justify-center">
                        <ImagePicker
                            value={imageFile}
                            onChange={setImageFile}
                            shape="rounded"
                            size="w-24 h-24"
                            label="Add photo"
                        />
                    </div>

                    <Input
                        label="Group Name"
                        placeholder="e.g. Roommates, Goa Trip"
                        error={errors.name?.message}
                        {...register('name', { required: 'Group name is required' })}
                    />

                    <div>
                        <label className="block text-sm font-semibold text-muted mb-1.5">
                            Description (optional)
                        </label>
                        <textarea
                            rows={2}
                            placeholder="What is this group for?"
                            className="field resize-none"
                            {...register('description')}
                        />
                    </div>

                    {/* Add members */}
                    <div>
                        <label className="block text-sm font-semibold text-muted mb-1.5">Add Members</label>
                        <Input
                            icon={Search}
                            placeholder="Search by name or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        {searchResults.length > 0 && (
                            <div
                                className="mt-2 rounded-xl border overflow-hidden animate-scale-in"
                                style={{
                                    background: 'var(--surface)',
                                    borderColor: 'var(--border)',
                                    boxShadow: 'var(--shadow-lg)',
                                }}
                            >
                                {searchResults.slice(0, 5).map((u) => (
                                    <button
                                        key={u._id}
                                        type="button"
                                        onClick={() => addMember(u)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:opacity-90"
                                        style={{ background: 'transparent' }}
                                    >
                                        <Avatar user={u} size="sm" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-default truncate">{u.name}</p>
                                            <p className="text-xs text-subtle truncate">@{u.username}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedMembers.map((m) => (
                                    <div
                                        key={m._id}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border text-primary-700 dark:text-primary-200"
                                        style={{ background: 'var(--brand-soft)', borderColor: 'var(--border)' }}
                                    >
                                        <Avatar user={m} size="xs" ring={false} />
                                        {m.name.split(' ')[0]}
                                        <button
                                            type="button"
                                            aria-label={`Remove ${m.name}`}
                                            onClick={() =>
                                                setSelectedMembers((prev) => prev.filter((x) => x._id !== m._id))
                                            }
                                            className="hover:text-red-500 transition-colors ml-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedMembers.length === 0 && (
                            <p className="mt-2 text-xs text-subtle flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                You can add members now or invite them later.
                            </p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" loading={loading} size="lg">
                        Create Group
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default CreateGroupPage
