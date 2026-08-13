import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Search, X } from 'lucide-react'
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

    // Bug fix: was useState() — must be useEffect for side effects
    useEffect(() => {
        if (debouncedSearch.length < 2) { setSearchResults([]); return }
        friendService.searchUsers(debouncedSearch)
            .then((res) => setSearchResults(res.data.data.users))
            .catch(() => { })
    }, [debouncedSearch])

    const addMember = (user) => {
        if (!selectedMembers.find((m) => m._id === user._id)) {
            setSelectedMembers((prev) => [...prev, user])
            setSearchResults((prev) => prev.filter((u) => u._id !== user._id))
            setSearchQuery('')
        }
    }

    const removeMember = (id) => setSelectedMembers((prev) => prev.filter((m) => m._id !== id))

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', data.name)
            if (data.description) formData.append('description', data.description)
            if (data.groupImage?.[0]) formData.append('groupImage', data.groupImage[0])
            formData.append('memberIds', JSON.stringify(selectedMembers.map((m) => m._id)))

            const res = await groupService.createGroup(formData)
            toast.success('Group created!')
            navigate(`/groups/${res.data.data.group._id}`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create group')
        } finally { setLoading(false) }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <Link to="/groups" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" /> Back to Groups
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create Group</h1>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Image */}
                    <div className="flex justify-center">
                        <label className="cursor-pointer group">
                            <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-primary-400">
                                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="preview" /> : <span className="text-3xl font-bold text-gray-300">G</span>}
                            </div>
                            <input type="file" accept="image/*" className="hidden" {...register('groupImage')}
                                onChange={(e) => { const f = e.target.files[0]; if (f) setImagePreview(URL.createObjectURL(f)) }} />
                        </label>
                    </div>

                    <Input label="Group Name" placeholder="e.g. Roommates, Trip to Goa" error={errors.name?.message}
                        {...register('name', { required: 'Group name is required' })} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                        <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" rows={2}
                            placeholder="What is this group for?" {...register('description')} />
                    </div>

                    {/* Add members */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add Members</label>
                        <Input icon={Search} placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        {searchResults.length > 0 && (
                            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                {searchResults.slice(0, 5).map((u) => (
                                    <button key={u._id} type="button" onClick={() => addMember(u)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left">
                                        <Avatar user={u} size="sm" />
                                        <div><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-gray-500">@{u.username}</p></div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {selectedMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedMembers.map((m) => (
                                    <div key={m._id} className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                                        <Avatar user={m} size="xs" />
                                        {m.name.split(' ')[0]}
                                        <button type="button" onClick={() => removeMember(m._id)}><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full" loading={loading}>Create Group</Button>
                </form>
            </div>
        </div>
    )
}

export default CreateGroupPage
