import { formatCurrency } from '../../utils/formatCurrency'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const CurrencyDisplay = ({ amount, currency = 'INR', showLabel = false, size = 'md' }) => {
    const isPositive = amount > 0.01
    const isNegative = amount < -0.01

    const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' }

    return (
        <div className={`inline-flex items-center gap-1 font-bold ${textSizes[size]} ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNegative ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
            }`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : isNegative ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            {showLabel && (
                <span className="text-[10px] font-medium mr-0.5 uppercase tracking-wide">
                    {isPositive ? 'gets' : isNegative ? 'owes' : ''}
                </span>
            )}
            {formatCurrency(Math.abs(amount), currency)}
        </div>
    )
}

export default CurrencyDisplay
