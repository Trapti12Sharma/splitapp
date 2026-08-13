import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '../../layouts/AuthLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { authService } from '../../services/authService'

const ResetPasswordPage = () => {
    const [loading, setLoading] = useState(false)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const password = watch('password')

    const onSubmit = async (data) => {
        if (!token) { toast.error('Invalid reset link'); return }
        setLoading(true)
        try {
            await authService.resetPassword(token, data.password, data.confirmPassword)
            toast.success('Password reset successfully!')
            navigate('/login', { replace: true })
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    if (!token) return (
        <AuthLayout>
            <div className="text-center space-y-3">
                <p className="text-red-500 font-medium">Invalid or missing reset token</p>
                <Link to="/forgot-password" className="text-sm text-primary-600">Request a new reset link</Link>
            </div>
        </AuthLayout>
    )

    return (
        <AuthLayout>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h1>
            <p className="text-sm text-gray-500 mb-6">Choose a new password for your account.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="New Password" type="password" icon={Lock} placeholder="Min 6 characters" error={errors.password?.message}
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                <Input label="Confirm Password" type="password" icon={Lock} placeholder="Repeat password" error={errors.confirmPassword?.message}
                    {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (v) => v === password || 'Passwords do not match',
                    })} />
                <Button type="submit" className="w-full" loading={loading}>Reset password</Button>
            </form>
        </AuthLayout>
    )
}

export default ResetPasswordPage
