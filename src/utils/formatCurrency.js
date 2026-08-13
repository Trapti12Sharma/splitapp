const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
}

export const formatCurrency = (amount, currency = 'INR') => {
  const symbol = currencySymbols[currency] || currency
  const num = parseFloat(amount) || 0
  return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export const getCurrencySymbol = (currency = 'INR') => currencySymbols[currency] || currency
