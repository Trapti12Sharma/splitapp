import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '../../layouts/AuthLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { authService } from '../../services/authService'

const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await authService.forgotPassword(data.email)
            setSent(true)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset email')
        } finally {
            setLoading(false)
        }
    }

    if (sent) return (
        <AuthLayout>
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
                <p className="text-sm text-gray-500">If that email is registered, we've sent a password reset link.</p>
                <Link to="/login" className="block text-sm text-primary-600 hover:text-primary-700 font-medium">Back to login</Link>
            </div>
        </AuthLayout>
    )

    return (
        <AuthLayout>
            <Link to="/login" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h1>
            <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message}
                    {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                    })} />
                <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
            </form>
        </AuthLayout>
    )
}

export default ForgotPasswordPage
