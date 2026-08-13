import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '../../layouts/AuthLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

const LoginPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await login(data.email, data.password)
            const from = location.state?.from?.pathname || '/dashboard'
            navigate(from, { replace: true })
            toast.success('Welcome back!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Input
                    label="Password"
                    type="password"
                    icon={Lock}
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password', { required: 'Password is required' })}
                />

                <div className="flex items-center justify-between">
                    <span />
                    <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" className="w-full" loading={loading}>
                    Sign in
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                    Create one
                </Link>
            </p>
        </AuthLayout>
    )
}

export default LoginPage
