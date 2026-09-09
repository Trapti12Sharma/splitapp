import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { User, Mail, Lock, AtSign } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '../../layouts/AuthLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import ImagePicker from '../../components/common/ImagePicker'
import { useAuth } from '../../context/AuthContext'

const RegisterPage = () => {
    const { register: registerUser } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    // Held in plain state rather than registered with react-hook-form: the inline
    // onChange used to clobber RHF's handler, so the file never reached FormData.
    const [imageFile, setImageFile] = useState(null)

    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const password = watch('password')

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', data.name)
            formData.append('username', data.username)
            formData.append('email', data.email)
            formData.append('password', data.password)
            formData.append('confirmPassword', data.confirmPassword)
            if (imageFile) formData.append('profileImage', imageFile)

            await registerUser(formData)
            navigate('/dashboard', { replace: true })
            toast.success('Account created! Welcome to SplitApp.')
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Registration failed'
            // If already registered, offer to login instead
            if (msg.toLowerCase().includes('email already') || msg.toLowerCase().includes('already registered')) {
                toast.error('This email is already registered. Try logging in.')
                setTimeout(() => navigate('/login'), 2000)
            } else {
                toast.error(msg)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-default mb-1">Create account</h1>
                <p className="text-sm text-muted">Start splitting expenses with friends</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex justify-center mb-2">
                    <ImagePicker
                        value={imageFile}
                        onChange={setImageFile}
                        shape="circle"
                        size="w-20 h-20"
                        label="Photo"
                    />
                </div>

                <Input
                    label="Full Name"
                    icon={User}
                    placeholder="Enter your full name"
                    error={errors.name?.message}
                    autoComplete="name"
                    {...register('name', {
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Min 2 characters' },
                    })}
                />

                <Input
                    label="Username"
                    icon={AtSign}
                    placeholder="Choose a username"
                    helper="Letters, numbers and underscores only"
                    error={errors.username?.message}
                    autoComplete="username"
                    {...register('username', {
                        required: 'Username is required',
                        minLength: { value: 3, message: 'Min 3 characters' },
                        pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, underscores' },
                    })}
                />

                <Input
                    label="Email"
                    type="email"
                    icon={Mail}
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    autoComplete="email"
                    {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                    })}
                />

                <Input
                    label="Password"
                    type="password"
                    icon={Lock}
                    placeholder="At least 6 characters"
                    error={errors.password?.message}
                    autoComplete="new-password"
                    {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Min 6 characters' },
                    })}
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    icon={Lock}
                    placeholder="Re-enter your password"
                    error={errors.confirmPassword?.message}
                    autoComplete="new-password"
                    {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (v) => v === password || 'Passwords do not match',
                    })}
                />

                <Button type="submit" className="w-full" loading={loading} size="lg">
                    Create account
                </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-500 hover:text-primary-400 font-semibold transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default RegisterPage
