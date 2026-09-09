import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Mail, AtSign, User as UserIcon, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getUploadUrl } from '../utils/getUploadUrl'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import ImagePicker from '../components/common/ImagePicker'

const ProfilePage = () => {
    const { user, updateUser } = useAuth()
    const [loading, setLoading] = useState(false)
    // The chosen file lives in ordinary state. It used to be registered with
    // react-hook-form, but the inline onChange overwrote RHF's own handler, so
    // the file was never recorded and never reached the server.
    const [imageFile, setImageFile] = useState(null)

    const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
        defaultValues: { name: user?.name || '', username: user?.username || '', email: user?.email || '' },
    })

    useEffect(() => {
        if (user) reset({ name: user.name, username: user.username, email: user.email })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id])

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', data.name)
            formData.append('username', data.username)
            formData.append('email', data.email)
            if (imageFile) formData.append('profileImage', imageFile)

            // Let the browser set the multipart boundary itself — setting the
            // Content-Type by hand omits it and the server cannot parse the body.
            const res = await api.put('/users/profile', formData)

            updateUser(res.data.data.user)
            setImageFile(null)
            reset({
                name: res.data.data.user.name,
                username: res.data.data.user.username,
                email: res.data.data.user.email,
            })
            toast.success('Profile updated')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed')
        } finally {
            setLoading(false)
        }
    }

    const canSubmit = isDirty || Boolean(imageFile)

    return (
        <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-extrabold text-default">Profile</h1>
                <p className="text-sm text-muted mt-0.5">Manage your account information</p>
            </div>

            {/* Identity header card */}
            <div className="relative rounded-3xl overflow-hidden">
                <div className="h-24 gradient-primary" />
                <div className="glass-card rounded-b-3xl px-6 pb-6 -mt-12 border-t-0">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="flex flex-col items-center">
                            <ImagePicker
                                value={imageFile}
                                onChange={setImageFile}
                                currentUrl={getUploadUrl(user?.profileImage)}
                                shape="rounded"
                                size="w-24 h-24"
                                label="Add photo"
                            />
                            <p className="mt-2 text-lg font-bold text-default">{user?.name}</p>
                            <p className="text-xs text-subtle">@{user?.username}</p>
                        </div>

                        <Input
                            label="Full Name"
                            icon={UserIcon}
                            placeholder="Your full name"
                            error={errors.name?.message}
                            {...register('name', {
                                required: 'Name is required',
                                minLength: { value: 2, message: 'Min 2 characters' },
                            })}
                        />
                        <Input
                            label="Username"
                            icon={AtSign}
                            placeholder="Pick a unique username"
                            error={errors.username?.message}
                            {...register('username', {
                                required: 'Username is required',
                                minLength: { value: 3, message: 'Min 3 characters' },
                                pattern: {
                                    value: /^[a-zA-Z0-9_]+$/,
                                    message: 'Only letters, numbers and underscores',
                                },
                            })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            icon={Mail}
                            placeholder="you@example.com"
                            error={errors.email?.message}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                            })}
                        />

                        <Button type="submit" className="w-full" loading={loading} size="lg" disabled={!canSubmit}>
                            <Save className="w-4 h-4" /> Save Changes
                        </Button>
                    </form>
                </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl gradient-green flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-default">Keep your account secure</p>
                    <p className="text-xs text-muted mt-0.5">
                        Change your password anytime from Settings.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
