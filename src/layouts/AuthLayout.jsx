import { Link } from 'react-router-dom'
import { Wallet, Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/**
 * The auth shell used to be hardcoded dark (`background: '#0f0f1a'`). That is why
 * the Register / Forgot / Reset headings — styled `text-gray-900` — were dark
 * text on a dark panel and effectively invisible. It now follows the theme, and
 * the decorative panel keeps its deep gradient in both modes because it always
 * carries white text.
 */
const features = [
    { emoji: '💸', text: 'Track shared expenses easily' },
    { emoji: '⚖️', text: 'Fair splits — equal, % or custom' },
    { emoji: '🤝', text: 'Settle up with one tap' },
    { emoji: '📊', text: 'See where your money goes' },
]

const AuthLayout = ({ children }) => {
    const { isDark, toggle } = useTheme()

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
            {/* Left decorative panel - hidden on mobile */}
            <div
                className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 relative overflow-hidden p-10"
                style={{ background: 'linear-gradient(150deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)' }}
            >
                {/* Orbs */}
                <div
                    className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-30 blur-3xl"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                />
                <div
                    className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-25 blur-3xl"
                    style={{ background: 'linear-gradient(135deg, #d946ef, #ec4899)' }}
                />
                <div
                    className="absolute top-2/3 left-0 w-40 h-40 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                />

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
                    {features.map(({ emoji, text }) => (
                        <div key={text} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                                {emoji}
                            </div>
                            <p className="text-sm text-indigo-100 font-medium">{text}</p>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-indigo-300/70 relative z-10">
                    &copy; {new Date().getFullYear()} SplitApp
                </p>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto relative">
                {/* Theme toggle — reachable before signing in, too. */}
                <button
                    onClick={toggle}
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="absolute top-4 right-4 p-2.5 rounded-xl border transition-colors"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                </button>

                {/* Mobile logo */}
                <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
                    <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                        <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-extrabold gradient-text">SplitApp</span>
                </Link>

                <div className="w-full max-w-md">
                    <div
                        className="rounded-3xl border p-8"
                        style={{
                            background: 'var(--surface)',
                            borderColor: 'var(--border)',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthLayout
