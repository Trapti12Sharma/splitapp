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
        } finally { setLoading(false) }
    }

    return (
        <AuthLayout>
            <div className="mb-7">
                <h1 className="text-2xl font-extrabold text-white mb-1">Welcome back</h1>
                <p className="text-sm text-gray-400">Sign in to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Email" type="email" icon={Mail} placeholder="you@example.com"
                    error={errors.email?.message}
                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />

                <Input label="Password" type="password" icon={Lock} placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password', { required: 'Password is required' })} />

                <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" className="w-full" loading={loading} size="lg">
                    Sign In
                </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/8 text-center">
                <p className="text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                        Create one
                    </Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default LoginPage
