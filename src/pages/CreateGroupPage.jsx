import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Search, X, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { groupService } from '../services/groupService'
import { friendService } from '../services/friendService'
import { useDebounce } from '../hooks/useDebounce'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Avatar from '../components/common/Avatar'

const CreateGroupPage = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedMembers, setSelectedMembers] = useState([])
    const [imagePreview, setImagePreview] = useState(null)
    const debouncedSearch = useDebounce(searchQuery, 400)
    const { register, handleSubmit, formState: { errors } } = useForm()

    useEffect(() => {
        if (debouncedSearch.length < 2) { setSearchResults([]); return }
        friendService.searchUsers(debouncedSearch)
            .then(res => setSearchResults(res.data.data.users))
            .catch(() => { })
    }, [debouncedSearch])

    const addMember = (user) => {
        if (!selectedMembers.find(m => m._id === user._id)) {
            setSelectedMembers(prev => [...prev, user])
            setSearchResults(prev => prev.filter(u => u._id !== user._id))
            setSearchQuery('')
        }
    }

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', data.name)
            if (data.description) formData.append('description', data.description)
            if (data.groupImage?.[0]) formData.append('groupImage', data.groupImage[0])
            formData.append('memberIds', JSON.stringify(selectedMembers.map(m => m._id)))
            const res = await groupService.createGroup(formData)
            toast.success('Group created!')
            navigate(`/groups/${res.data.data.group._id}`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create group')
        } finally { setLoading(false) }
    }

    return (
        <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
            <Link to="/groups" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Groups
            </Link>

            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Create Group</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Start splitting with a new group</p>
            </div>

            <div className="glass-card rounded-3xl p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Group image */}
                    <div className="flex justify-center">
                        <label className="cursor-pointer group">
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-white/15 group-hover:border-primary-400 transition-colors">
                                {imagePreview
                                    ? <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                                    : <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                        <Camera className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                        <span className="text-[10px] text-gray-400">Add photo</span>
                                    </div>
                                }
                            </div>
                            <input type="file" accept="image/*" className="hidden" {...register('groupImage')}
                                onChange={e => { const f = e.target.files[0]; if (f) setImagePreview(URL.createObjectURL(f)) }} />
                        </label>
                    </div>

                    <Input label="Group Name" placeholder="e.g. Roommates, Goa Trip" error={errors.name?.message}
                        {...register('name', { required: 'Group name is required' })} />

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description (optional)</label>
                        <textarea rows={2} placeholder="What is this group for?"
                            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all resize-none"
                            {...register('description')} />
                    </div>

                    {/* Add members */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Add Members</label>
                        <Input icon={Search} placeholder="Search by name or username..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

                        {searchResults.length > 0 && (
                            <div className="mt-2 rounded-xl border border-gray-100 dark:border-white/8 overflow-hidden shadow-lg" style={{ background: '#16162a' }}>
                                {searchResults.slice(0, 5).map(u => (
                                    <button key={u._id} type="button" onClick={() => addMember(u)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors">
                                        <Avatar user={u} size="sm" />
                                        <div>
                                            <p className="text-sm font-semibold text-white">{u.name}</p>
                                            <p className="text-xs text-gray-400">@{u.username}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedMembers.map(m => (
                                    <div key={m._id} className="flex items-center gap-1.5 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-xl text-xs font-semibold border border-primary-200 dark:border-primary-800/50">
                                        <Avatar user={m} size="xs" />
                                        {m.name.split(' ')[0]}
                                        <button type="button" onClick={() => setSelectedMembers(prev => prev.filter(x => x._id !== m._id))}
                                            className="hover:text-red-500 transition-colors ml-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full" loading={loading} size="lg">Create Group</Button>
                </form>
            </div>
        </div>
    )
}

export default CreateGroupPage
