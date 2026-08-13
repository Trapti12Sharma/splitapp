import { Link } from 'react-router-dom'
import { SplitSquareVertical } from 'lucide-react'

const AuthLayout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex flex-col items-center justify-center px-4 py-8">
        <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <SplitSquareVertical className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SplitApp</span>
        </Link>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {children}
        </div>
        <p className="mt-6 text-xs text-gray-400">
            Split expenses. Stay friends. &copy; {new Date().getFullYear()} SplitApp
        </p>
    </div>
)

export default AuthLayout
