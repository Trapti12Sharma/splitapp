/**
 * Frontend split calculation preview (mirrors backend logic)
 *
 * Works in integer cents and hands leftover cents to the largest remainders,
 * exactly like the backend, so the preview always matches what gets saved.
 */
const allocateCents = (totalCents, weights) => {
  const weightSum = weights.reduce((s, w) => s + w, 0)
  const exact = weights.map((w) => (totalCents * w) / weightSum)
  const parts = exact.map(Math.floor)
  let leftover = totalCents - parts.reduce((s, p) => s + p, 0)

  const order = exact
    .map((e, i) => ({ i, frac: e - Math.floor(e) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i)

  for (let k = 0; leftover > 0; k = (k + 1) % order.length, leftover--) {
    parts[order[k].i] += 1
  }
  return parts
}

export const calculateSplits = (splitType, amount, splits) => {
  const totalCents = Math.round((parseFloat(amount) || 0) * 100)
  if (splits.length === 0 || totalCents <= 0) return splits

  const withCents = (weights) => {
    const parts = allocateCents(totalCents, weights)
    return splits.map((s, i) => ({ ...s, amount: parts[i] / 100 }))
  }

  switch (splitType) {
    case 'equal':
      return withCents(splits.map(() => 1))

    case 'exact':
      return splits.map((s) => ({ ...s, amount: parseFloat(s.amount) || 0 }))

    case 'percentage':
      return withCents(splits.map((s) => Math.max(0, parseFloat(s.percentage) || 0)))

    case 'shares': {
      const weights = splits.map((s) => Math.max(0, parseFloat(s.shares) || 0))
      if (weights.reduce((a, b) => a + b, 0) === 0) return splits
      return withCents(weights)
    }

    default:
      return splits
  }
}

/** Parse a shares input: an empty field counts as 1, but an explicit 0 stays 0. */
export const parseShares = (value) => {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : 1
}

export const validateSplits = (splitType, amount, splits) => {
  const total = parseFloat(amount) || 0
  switch (splitType) {
    case 'exact': {
      if (splits.some((x) => (parseFloat(x.amount) || 0) < 0)) return 'Amounts cannot be negative'
      const sumCents = splits.reduce((s, x) => s + Math.round((parseFloat(x.amount) || 0) * 100), 0)
      if (sumCents !== Math.round(total * 100)) return `Amounts must sum to ${total.toFixed(2)} (got ${(sumCents / 100).toFixed(2)})`
      break
    }
    case 'percentage': {
      if (splits.some((x) => (parseFloat(x.percentage) || 0) < 0)) return 'Percentages cannot be negative'
      const sum = splits.reduce((s, x) => s + (parseFloat(x.percentage) || 0), 0)
      if (Math.abs(sum - 100) > 0.01) return `Percentages must sum to 100% (got ${sum.toFixed(2)}%)`
      break
    }
    case 'shares': {
      if (splits.some((x) => (parseFloat(x.shares) || 0) < 0)) return 'Shares cannot be negative'
      const sum = splits.reduce((s, x) => s + (parseFloat(x.shares) || 0), 0)
      if (sum <= 0) return 'Total shares must be greater than 0'
      break
    }
  }
  return null
}
