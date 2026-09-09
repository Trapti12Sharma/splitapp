import { formatCurrency } from '../../utils/formatCurrency'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * Renders a signed balance. `pill` wraps it in a soft coloured chip instead of
 * plain coloured text — used wherever a balance needs to read as a distinct
 * "stamp" (friend rows, settle-up targets) rather than blend into a list.
 */
const CurrencyDisplay = ({ amount, currency = 'INR', showLabel = false, size = 'md', pill = false }) => {
    const isPos = amount > 0.01
    const isNeg = amount < -0.01
    const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' }
    const tone = isPos ? 'var(--positive)' : isNeg ? 'var(--negative)' : 'var(--text-subtle)'
    const softTone = isPos ? 'var(--positive-soft)' : isNeg ? 'var(--negative-soft)' : 'var(--surface-2)'

    const content = (
        <>
            {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : isNeg ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            {showLabel && <span className="text-[10px] font-semibold uppercase tracking-wide">{isPos ? 'gets back' : isNeg ? 'owes' : 'settled'}</span>}
            <span className="amount">{formatCurrency(Math.abs(amount), currency)}</span>
        </>
    )

    if (pill) {
        return (
            <div
                className={`inline-flex items-center gap-1.5 font-bold rounded-full px-3 py-1.5 ${textSizes[size]}`}
                style={{ color: tone, background: softTone }}
            >
                {content}
            </div>
        )
    }

    return (
        <div className={`inline-flex items-center gap-1 font-bold ${textSizes[size]}`} style={{ color: tone }}>
            {content}
        </div>
    )
}

export default CurrencyDisplay
