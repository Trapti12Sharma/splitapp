import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Wifi } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '../../layouts/AuthLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { getWarmupState, COLD_THRESHOLD_MS } from '../../utils/serverWarmup'

// ---------------------------------------------------------------------------
// WarmupOverlay — shown only when the server is cold-starting.
// Dismissed automatically the moment the health check responds.
// ---------------------------------------------------------------------------
const WarmupOverlay = ({ onDismiss }) => {
    const [dots, setDots] = useState('.')
    useEffect(() => {
        const id = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500)
        return () => clearInterval(id)
    }, [])

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6"
            style={{ background: 'var(--bg)', backdropFilter: 'blur(4px)' }}
        >
            {/* Animated logo */}
            <div className="relative">
                <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center shadow-glow animate-pulse">
                    <Wifi className="w-10 h-10 text-white" />
                </div>
                {/* Ripple rings */}
                <div className="absolute inset-0 rounded-3xl border-2 border-primary-400/40 animate-ping" />
            </div>

            <div className="text-center max-w-xs">
                <p className="text-lg font-extrabold text-default">
                    Server is waking up{dots}
                </p>
                <p className="text-sm text-muted mt-2 leading-relaxed">
                    The server goes to sleep after inactivity.
                    First visit takes about <span className="font-semibold text-primary-500">30–60 seconds</span>.
                </p>
            </div>

            {/* Progress bar */}
            <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                <div
                    className="h-full gradient-primary rounded-full"
                    style={{ animation: 'warmup-progress 55s linear forwards' }}
                />
            </div>

            <button
                onClick={onDismiss}
                className="text-xs text-subtle hover:text-muted transition-colors underline underline-offset-2"
            >
                Continue to login anyway
            </button>

            {/* keyframe injected once — Tailwind can't generate this duration */}
            <style>{`
                @keyframes warmup-progress {
                    from { width: 0% }
                    to   { width: 100% }
                }
            `}</style>
        </div>
    )
}

// ---------------------------------------------------------------------------
// LoginPage
// ---------------------------------------------------------------------------
const LoginPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    // showOverlay: null = not decided yet, true = show, false = hide
    const [showOverlay, setShowOverlay] = useState(null)
    const decisionTimer = useRef(null)

    useEffect(() => {
        const { promise, isCold, isWarm } = getWarmupState()

        if (isWarm) {
            // Server already responded before we even mounted — never show overlay.
            setShowOverlay(false)
            return
        }

        if (isCold) {
            // Server is taking a while — show the overlay right now.
            setShowOverlay(true)
        } else {
            // We haven't hit the cold threshold yet — wait a bit before deciding.
            decisionTimer.current = setTimeout(() => {
                const { isWarm: nowWarm } = getWarmupState()
                if (!nowWarm) setShowOverlay(true)
            }, COLD_THRESHOLD_MS)
        }

        // Dismiss overlay the moment the server responds.
        promise.then(() => {
            clearTimeout(decisionTimer.current)
            setShowOverlay(false)
        })

        return () => clearTimeout(decisionTimer.current)
    }, [])

    const onSubmit = async (data) => {
        setLoading(true)
        setShowOverlay(false) // user explicitly clicked Sign In — get out of their way
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
            {/* Overlay mounts on top of AuthLayout but inside the tree so
                the page structure is already rendered beneath it. */}
            {showOverlay && <WarmupOverlay onDismiss={() => setShowOverlay(false)} />}

            <div className="mb-7">
                <h1 className="text-2xl font-extrabold text-default mb-1">Welcome back</h1>
                <p className="text-sm text-subtle">Sign in to continue</p>
            </div>

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

                <div className="flex justify-end">
                    <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-primary-500 hover:text-primary-400 transition-colors"
                    >
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
                    <Link
                        to="/register"
                        className="text-primary-500 hover:text-primary-400 font-semibold transition-colors"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default LoginPage
