import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'

const AuthLayout = ({ children }) => (
    <div className="min-h-screen flex" style={{ background: '#0f0f1a' }}>
        {/* Left decorative panel - hidden on mobile */}
        <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 relative overflow-hidden p-10"
            style={{ background: 'linear-gradient(135deg, #1a1a3e 0%, #0f0f2a 100%)' }}>
            {/* Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-15 blur-3xl"
                style={{ background: 'linear-gradient(135deg, #d946ef, #ec4899)' }} />

            {/* Logo */}
            <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                    <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-white">SplitApp</span>
            </div>

            {/* Feature highlights */}
            <div className="relative z-10 space-y-6">
                <h2 className="text-3xl font-extrabold text-white leading-tight">
                    Split expenses,<br />
                    <span className="gradient-text">not friendships.</span>
                </h2>
                {[
                    { emoji: '💸', text: 'Track shared expenses easily' },
                    { emoji: '⚖️', text: 'Fair splits — equal, % or custom' },
                    { emoji: '🤝', text: 'Settle up with one tap' },
                    { emoji: '📊', text: 'See where your money goes' },
                ].map(({ emoji, text }) => (
                    <div key={text} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">{emoji}</div>
                        <p className="text-sm text-gray-300 font-medium">{text}</p>
                    </div>
                ))}
            </div>

            <p className="text-xs text-gray-500 relative z-10">&copy; {new Date().getFullYear()} SplitApp</p>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
            {/* Mobile logo */}
            <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
                <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-extrabold text-white">SplitApp</span>
            </Link>

            <div className="w-full max-w-md">
                <div className="rounded-3xl border border-white/8 p-8" style={{ background: '#16162a' }}>
                    {children}
                </div>
            </div>
        </div>
    </div>
)

export default AuthLayout
