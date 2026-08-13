import { forwardRef } from 'react'

const Input = forwardRef(({
    label,
    error,
    helper,
    icon: Icon,
    className = '',
    type = 'text',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={`
            w-full rounded-xl border bg-white dark:bg-gray-800/50 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 dark:focus:border-primary-500
            disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
            ${error ? 'border-red-400 dark:border-red-500 focus:ring-red-500/40' : 'border-gray-200 dark:border-gray-700'}
            ${Icon ? 'pl-10' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>}
            {helper && !error && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-500">{helper}</p>}
        </div>
    )
})

Input.displayName = 'Input'

export default Input
