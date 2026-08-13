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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={`
            w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900
            placeholder:text-gray-400 transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'}
            ${Icon ? 'pl-9' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            {helper && !error && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
        </div>
    )
})

Input.displayName = 'Input'

export default Input
