import { formatCurrency } from '../../utils/formatCurrency'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const CurrencyDisplay = ({ amount, currency = 'INR', showLabel = false, size = 'md' }) => {
    const isPositive = amount > 0.01
    const isNegative = amount < -0.01
    const isZero = !isPositive && !isNegative

    const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' }

    return (
        <div className={`inline-flex items-center gap-1 font-semibold ${textSizes[size]} ${isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-gray-500'
            }`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : isNegative ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            {showLabel && (
                <span className="text-xs font-normal mr-1">
                    {isPositive ? 'owed to you' : isNegative ? 'you owe' : 'settled'}
                </span>
            )}
            {formatCurrency(Math.abs(amount), currency)}
        </div>
    )
}

export default CurrencyDisplay
