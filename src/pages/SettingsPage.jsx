import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

const SettingsPage = () => {
    const { logout } = useAuth()
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()
    const newPassword = watch('newPassword')

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await api.put('/users/password', { currentPassword: data.currentPassword, newPassword: data.newPassword })
            toast.success('Password changed successfully!')
            reset()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password')
        } finally { setLoading(false) }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            {/* Change Password */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="Current Password" type="password" placeholder="••••••••" error={errors.currentPassword?.message}
                        {...register('currentPassword', { required: 'Current password is required' })} />
                    <Input label="New Password" type="password" placeholder="Min 6 characters" error={errors.newPassword?.message}
                        {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                    <Input label="Confirm New Password" type="password" placeholder="Repeat new password" error={errors.confirmPassword?.message}
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (v) => v === newPassword || 'Passwords do not match',
                        })} />
                    <Button type="submit" className="w-full" loading={loading}>Update Password</Button>
                </form>
            </div>

            {/* Currency Preference */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Preferences</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="INR">₹ INR — Indian Rupee</option>
                        <option value="USD">$ USD — US Dollar</option>
                        <option value="EUR">€ EUR — Euro</option>
                        <option value="GBP">£ GBP — British Pound</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Used as default when creating new expenses</p>
                </div>
            </div>

            {/* Logout */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Account</h2>
                <Button variant="danger" className="w-full" onClick={logout}>
                    <LogOut className="w-4 h-4" /> Logout
                </Button>
            </div>
        </div>
    )
}

export default SettingsPage
