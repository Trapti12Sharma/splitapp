import { formatCurrency } from '../../utils/formatCurrency'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const CurrencyDisplay = ({ amount, currency = 'INR', showLabel = false, size = 'md' }) => {
    const isPos = amount > 0.01
    const isNeg = amount < -0.01
    const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' }

    return (
        <div className={`inline-flex items-center gap-1 font-bold ${textSizes[size]} ${isPos ? 'text-emerald-500' : isNeg ? 'text-red-400' : 'text-gray-400'
            }`}>
            {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : isNeg ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            {showLabel && <span className="text-[10px] font-semibold mr-0.5 uppercase tracking-wide">{isPos ? 'gets' : isNeg ? 'owes' : ''}</span>}
            {formatCurrency(Math.abs(amount), currency)}
        </div>
    )
}

export default CurrencyDisplay
