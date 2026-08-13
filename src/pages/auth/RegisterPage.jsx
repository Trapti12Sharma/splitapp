import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { User, Mail, Lock, AtSign, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '../../layouts/AuthLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

const RegisterPage = () => {
    const { register: registerUser } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [profilePreview, setProfilePreview] = useState(null)

    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const password = watch('password')

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) setProfilePreview(URL.createObjectURL(file))
    }

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', data.name)
            formData.append('username', data.username)
            formData.append('email', data.email)
            formData.append('password', data.password)
            formData.append('confirmPassword', data.confirmPassword)
            if (data.profileImage?.[0]) formData.append('profileImage', data.profileImage[0])

            await registerUser(formData)
            navigate('/dashboard', { replace: true })
            toast.success('Account created! Welcome to SplitApp.')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
            <p className="text-sm text-gray-500 mb-6">Start splitting expenses with friends</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Profile image */}
                <div className="flex justify-center mb-2">
                    <label className="relative cursor-pointer group">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-primary-400 transition-colors">
                            {profilePreview
                                ? <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                                : <Camera className="w-7 h-7 text-gray-400" />
                            }
                        </div>
                        <input type="file" accept="image/*" className="hidden" {...register('profileImage')} onChange={handleImageChange} />
                    </label>
                </div>

                <Input label="Full Name" icon={User} placeholder="Trapti Sharma" error={errors.name?.message}
                    {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />

                <Input label="Username" icon={AtSign} placeholder="trapti" error={errors.username?.message}
                    {...register('username', {
                        required: 'Username is required',
                        minLength: { value: 3, message: 'Min 3 characters' },
                        pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, underscores' },
                    })} />

                <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message}
                    {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                    })} />

                <Input label="Password" type="password" icon={Lock} placeholder="Min 6 characters" error={errors.password?.message}
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />

                <Input label="Confirm Password" type="password" icon={Lock} placeholder="Repeat password" error={errors.confirmPassword?.message}
                    {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (v) => v === password || 'Passwords do not match',
                    })} />

                <Button type="submit" className="w-full" loading={loading}>Create account</Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
            </p>
        </AuthLayout>
    )
}

export default RegisterPage
