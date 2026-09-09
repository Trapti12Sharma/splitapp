import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * Styling now comes from the `.field` token class in index.css, so inputs look
 * correct in both themes without a pile of `dark:` variants that had to be kept
 * in sync by hand.
 */
const Input = forwardRef(
    ({ label, error, helper, icon: Icon, className = '', type = 'text', ...props }, ref) => {
        const id = useId()
        const [revealed, setRevealed] = useState(false)

        const isPassword = type === 'password'
        const resolvedType = isPassword && revealed ? 'text' : type

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={id} className="block text-sm font-semibold text-muted mb-1.5">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {Icon && (
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Icon className="w-4 h-4 text-subtle" />
                        </div>
                    )}

                    <input
                        id={id}
                        ref={ref}
                        type={resolvedType}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error || helper ? `${id}-desc` : undefined}
                        className={`field ${error ? 'field-error' : ''} ${Icon ? 'pl-10' : ''} ${
                            isPassword ? 'pr-11' : ''
                        } ${className}`}
                        {...props}
                    />

                    {/* Password fields are easy to mistype on mobile — let people check. */}
                    {isPassword && (
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setRevealed((v) => !v)}
                            aria-label={revealed ? 'Hide password' : 'Show password'}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-subtle hover:text-default transition-colors"
                        >
                            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {error && (
                    <p id={`${id}-desc`} className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}
                {helper && !error && (
                    <p id={`${id}-desc`} className="mt-1.5 text-xs text-subtle">
                        {helper}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
export default Input
