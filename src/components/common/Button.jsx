import { Loader2 } from 'lucide-react'

const gradients = {
    primary: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    danger: 'linear-gradient(135deg, #f43f5e, #ef4444)',
    success: 'linear-gradient(135deg, #10b981, #06b6d4)',
    sunset: 'linear-gradient(135deg, #f97316, #ec4899)',
    ocean: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
}

const gradientVariants = new Set(['primary', 'danger', 'success', 'sunset', 'ocean'])

const variants = {
    primary: 'text-white border-transparent',
    danger: 'text-white border-transparent',
    success: 'text-white border-transparent',
    sunset: 'text-white border-transparent',
    ocean: 'text-white border-transparent',
    secondary: 'border-transparent text-default',
    ghost: 'bg-transparent border-transparent text-muted hover:text-default',
    outline: 'bg-transparent text-muted hover:text-default',
}

const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
}

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    type = 'button',
    onClick,
    style,
    ...props
}) => {
    const hasGradient = gradientVariants.has(variant)

    // Non-gradient variants take their colours from the design tokens so they
    // read correctly in both themes.
    const tokenStyle =
        variant === 'secondary'
            ? { background: 'var(--surface-2)' }
            : variant === 'outline'
                ? { borderColor: 'var(--border-strong)' }
                : undefined

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            style={hasGradient ? { background: gradients[variant], ...style } : { ...tokenStyle, ...style }}
            className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl border
        transition-all duration-150 active:scale-[0.98]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${hasGradient ? 'shadow-sm hover:shadow-md hover:brightness-110' : ''}
        ${variants[variant] || variants.primary} ${sizes[size]} ${className}
      `}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    )
}

export default Button
