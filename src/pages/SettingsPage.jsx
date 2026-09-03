import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LogOut, Lock, Moon, Sun } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useDarkMode } from '../hooks/useDarkMode'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

const SettingsPage = () => {
    const { logout } = useAuth()
    const { isDark, toggle } = useDarkMode()
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()
    const newPassword = watch('newPassword')

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await api.put('/users/password', { currentPassword: data.currentPassword, newPassword: data.newPassword })
            toast.success('Password changed!')
            reset()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed')
        } finally { setLoading(false) }
    }

    return (
        <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Preferences and security</p>
            </div>

            {/* Appearance */}
            <div className="glass-card rounded-3xl p-5">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
                <button onClick={toggle}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-white/8 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            {isDark ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{isDark ? 'Light Mode' : 'Dark Mode'}</p>
                            <p className="text-xs text-gray-400">Currently {isDark ? 'dark' : 'light'}</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-primary-600' : 'bg-gray-200'} relative`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${isDark ? 'left-6' : 'left-0.5'}`} />
                    </div>
                </button>
            </div>

            {/* Change password */}
            <div className="glass-card rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-primary-500" />
                    <h2 className="font-bold text-gray-900 dark:text-white">Change Password</h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="Current Password" type="password" placeholder="••••••••" error={errors.currentPassword?.message}
                        {...register('currentPassword', { required: 'Required' })} />
                    <Input label="New Password" type="password" placeholder="Min 6 characters" error={errors.newPassword?.message}
                        {...register('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                    <Input label="Confirm New Password" type="password" placeholder="Repeat" error={errors.confirmPassword?.message}
                        {...register('confirmPassword', { required: 'Required', validate: v => v === newPassword || 'Passwords do not match' })} />
                    <Button type="submit" className="w-full" loading={loading}>Update Password</Button>
                </form>
            </div>

            {/* Account */}
            <div className="glass-card rounded-3xl p-5">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4">Account</h2>
                <button onClick={logout}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-red-500/12 flex items-center justify-center">
                        <LogOut className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-red-500">Sign Out</p>
                        <p className="text-xs text-gray-400">You'll need to log in again</p>
                    </div>
                </button>
            </div>
        </div>
    )
}

export default SettingsPage
