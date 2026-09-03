import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, helper, icon: Icon, className = '', type = 'text', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
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
            w-full rounded-xl border text-sm transition-all duration-150 outline-none
            px-3.5 py-2.5
            bg-gray-50 dark:bg-white/5
            text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-600
            focus:ring-2 focus:ring-primary-500/30
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
                            ? 'border-red-400 dark:border-red-500 focus:border-red-400'
                            : 'border-gray-200 dark:border-white/10 focus:border-primary-400 dark:focus:border-primary-500'}
            ${Icon ? 'pl-10' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && <p className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">{error}</p>}
            {helper && !error && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-500">{helper}</p>}
        </div>
    )
})
Input.displayName = 'Input'
export default Input
