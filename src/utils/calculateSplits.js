/**
 * Frontend split calculation preview (mirrors backend logic)
 */
export const calculateSplits = (splitType, amount, splits) => {
  const total = parseFloat(amount) || 0

  switch (splitType) {
    case 'equal': {
      const n = splits.length
      if (n === 0) return splits
      const perPerson = Math.round((total / n) * 100) / 100
      return splits.map((s, i) => ({
        ...s,
        amount: i === n - 1
          ? Math.round((total - perPerson * (n - 1)) * 100) / 100
          : perPerson,
      }))
    }

    case 'exact':
      return splits.map((s) => ({ ...s, amount: parseFloat(s.amount) || 0 }))

    case 'percentage':
      return splits.map((s, i) => {
        const pct = parseFloat(s.percentage) || 0
        const amt = i === splits.length - 1
          ? Math.round((total - splits.slice(0, -1).reduce((sum, x) => sum + Math.round(total * (parseFloat(x.percentage) || 0) / 100 * 100) / 100, 0)) * 100) / 100
          : Math.round((total * pct) / 100 * 100) / 100
        return { ...s, amount: amt }
      })

    case 'shares': {
      const totalShares = splits.reduce((sum, s) => sum + (parseFloat(s.shares) || 0), 0)
      if (totalShares === 0) return splits
      return splits.map((s, i) => {
        const share = parseFloat(s.shares) || 0
        const amt = i === splits.length - 1
          ? Math.round((total - splits.slice(0, -1).reduce((sum, x) => sum + Math.round(total * (parseFloat(x.shares) || 0) / totalShares * 100) / 100, 0)) * 100) / 100
          : Math.round((total * share) / totalShares * 100) / 100
        return { ...s, amount: amt }
      })
    }

    default:
      return splits
  }
}

export const validateSplits = (splitType, amount, splits) => {
  const total = parseFloat(amount) || 0
  switch (splitType) {
    case 'exact': {
      const sum = splits.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0)
      if (Math.abs(sum - total) > 0.01) return `Amounts must sum to ${total.toFixed(2)} (got ${sum.toFixed(2)})`
      break
    }
    case 'percentage': {
      const sum = splits.reduce((s, x) => s + (parseFloat(x.percentage) || 0), 0)
      if (Math.abs(sum - 100) > 0.01) return `Percentages must sum to 100% (got ${sum.toFixed(2)}%)`
      break
    }
    case 'shares': {
      const sum = splits.reduce((s, x) => s + (parseFloat(x.shares) || 0), 0)
      if (sum <= 0) return 'Total shares must be greater than 0'
      break
    }
  }
  return null
}
