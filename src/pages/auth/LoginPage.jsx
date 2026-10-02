import { useState, useEffect, useRef } from 'react'
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
    const warmupToastId = useRef(null)

    // If the backend is cold-starting (Render free tier spins down after ~15 min
    // idle), the login request can hang for 30–60s with no feedback. We show an
    // informational toast only when the first request actually takes a while, so
    // warm users never see it.
    useEffect(() => {
        const timer = setTimeout(() => {
            warmupToastId.current = toast.loading(
                'Server is waking up — this takes ~30s on first visit…',
                { duration: 60000, id: 'warmup' }
            )
        }, 4000) // only show if we haven't heard back in 4 seconds

        const checkHealth = async () => {
            if (!import.meta.env.VITE_API_URL) return
            const url = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') + '/api/health'
            try {
                const res = await fetch(url, { signal: AbortSignal.timeout?.(45000) })
                if (res.ok) {
                    clearTimeout(timer)
                    if (warmupToastId.current) {
                        toast.dismiss('warmup')
                        warmupToastId.current = null
                    }
                }
            } catch {
                // Server still cold or unreachable — toast stays until login succeeds
            }
        }
        checkHealth()

        return () => {
            clearTimeout(timer)
            toast.dismiss('warmup')
        }
    }, [])

    const onSubmit = async (data) => {
        setLoading(true)
        toast.dismiss('warmup')
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
                <h1 className="text-2xl font-extrabold text-default mb-1">Welcome back</h1>
                <p className="text-sm text-subtle">Sign in to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Email" type="email" icon={Mail} placeholder="you@example.com"
                    error={errors.email?.message}
                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />

                <Input label="Password" type="password" icon={Lock} placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password', { required: 'Password is required' })} />

                <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-xs font-semibold text-primary-500 hover:text-primary-400 transition-colors">
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" className="w-full" loading={loading} size="lg">
                    Sign In
                </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm text-subtle">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-500 hover:text-primary-400 font-semibold transition-colors">
                        Create one
                    </Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default LoginPage
