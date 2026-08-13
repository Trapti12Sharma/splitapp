import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Avatar from '../components/common/Avatar'

const ProfilePage = () => {
    const { user, updateUser } = useAuth()
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState(null)
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: { name: user?.name || '', username: user?.username || '', email: user?.email || '' },
    })

    // Repopulate form if user loads asynchronously (e.g. page refresh)
    useEffect(() => {
        if (user) {
            reset({ name: user.name, username: user.username, email: user.email })
        }
    }, [user?._id]) // only reset when a different user loads

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', data.name)
            formData.append('username', data.username)
            formData.append('email', data.email)
            if (data.profileImage?.[0]) formData.append('profileImage', data.profileImage[0])

            const res = await api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            updateUser(res.data.data.user)
            toast.success('Profile updated!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed')
        } finally { setLoading(false) }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Avatar */}
                    <div className="flex justify-center">
                        <label className="relative cursor-pointer group">
                            <div className="relative">
                                {preview
                                    ? <img src={preview} alt="preview" className="w-24 h-24 rounded-full object-cover" />
                                    : <Avatar user={user} size="xl" />
                                }
                                <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center border-2 border-white">
                                    <Camera className="w-3.5 h-3.5 text-white" />
                                </div>
                            </div>
                            <input type="file" accept="image/*" className="hidden" {...register('profileImage')}
                                onChange={(e) => { const f = e.target.files[0]; if (f) setPreview(URL.createObjectURL(f)) }} />
                        </label>
                    </div>

                    <Input label="Full Name" error={errors.name?.message}
                        {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } })} />
                    <Input label="Username" error={errors.username?.message}
                        {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'Min 3 chars' } })} />
                    <Input label="Email" type="email" error={errors.email?.message}
                        {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />

                    <Button type="submit" className="w-full" loading={loading}>Save Changes</Button>
                </form>
            </div>
        </div>
    )
}

export default ProfilePage
