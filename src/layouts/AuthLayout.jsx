import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'

const AuthLayout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />

        <Link to="/" className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-11 h-11 gradient-primary rounded-2xl flex items-center justify-center shadow-glow-lg">
                <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-extrabold text-white">SplitApp</span>
        </Link>

        <div className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 border border-white/10 dark:border-gray-700/50 shadow-xl shadow-black/10">
            {children}
        </div>

        <p className="mt-6 text-xs text-gray-500 relative z-10">
            Split expenses. Stay friends. &copy; {new Date().getFullYear()} SplitApp
        </p>
    </div>
)

export default AuthLayout
