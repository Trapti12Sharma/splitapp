import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Camera, Save } from 'lucide-react'
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

    useEffect(() => {
        if (user) reset({ name: user.name, username: user.username, email: user.email })
    }, [user?._id])

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
        <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Profile</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account information</p>
            </div>

            <div className="glass-card rounded-3xl p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Avatar upload */}
                    <div className="flex justify-center py-2">
                        <label className="relative cursor-pointer group">
                            <div className="relative">
                                {preview
                                    ? <img src={preview} alt="preview" className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-800" />
                                    : <Avatar user={user} size="xl" className="!rounded-2xl" />
                                }
                                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 gradient-primary rounded-xl flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
                                    <Camera className="w-3.5 h-3.5 text-white" />
                                </div>
                            </div>
                            <input type="file" accept="image/*" className="hidden" {...register('profileImage')}
                                onChange={e => { const f = e.target.files[0]; if (f) setPreview(URL.createObjectURL(f)) }} />
                        </label>
                    </div>

                    <Input label="Full Name" error={errors.name?.message}
                        {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } })} />
                    <Input label="Username" error={errors.username?.message}
                        {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'Min 3 chars' } })} />
                    <Input label="Email" type="email" error={errors.email?.message}
                        {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />

                    <Button type="submit" className="w-full" loading={loading} size="lg">
                        <Save className="w-4 h-4" /> Save Changes
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default ProfilePage
