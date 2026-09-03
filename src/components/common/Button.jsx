import { Loader2 } from 'lucide-react'

const variants = {
    primary: 'text-white border-transparent shadow-sm',
    secondary: 'bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/12 text-gray-700 dark:text-gray-200 border-transparent',
    danger: 'text-white border-transparent shadow-sm',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-white/8 text-gray-600 dark:text-gray-300 border-transparent',
    success: 'text-white border-transparent shadow-sm',
    outline: 'bg-transparent border-gray-200 dark:border-white/15 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5',
}

const gradients = {
    primary: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    danger: 'linear-gradient(135deg, #f43f5e, #ef4444)',
    success: 'linear-gradient(135deg, #10b981, #06b6d4)',
}

const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
}

const Button = ({ children, variant = 'primary', size = 'md', loading = false, disabled = false, className = '', type = 'button', onClick, style, ...props }) => {
    const hasgradient = ['primary', 'danger', 'success'].includes(variant)
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            style={hasgradient ? { background: gradients[variant], ...style } : style}
            className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl border
        transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2 dark:focus:ring-offset-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    )
}

export default Button
