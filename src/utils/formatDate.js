export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export const formatRelativeDate = (date) => {
  if (!date) return ''
  const now = new Date()
  const d = new Date(date)
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const pad = (n) => String(n).padStart(2, '0')

/** A Date as the `YYYY-MM-DDTHH:mm` string a datetime-local input expects, in local time. */
export const toDateTimeLocalValue = (date = new Date()) => {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** A datetime-local value (local time) as an ISO string for the API, or null. */
export const dateTimeLocalToIso = (value) => {
  if (!value) return null
  const d = new Date(value) // `YYYY-MM-DDTHH:mm` without a zone parses as local time
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

// Expenses created before the date+time picker only stored a calendar day,
// saved as exactly midnight UTC.
const isCalendarDayOnly = (d) =>
  d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0

/**
 * When an expense happened: `{ date, hasTime }`.
 * For older calendar-day-only expenses, the time they were added is used if
 * that was on the same day; otherwise there is no honest time to show.
 */
export const getExpenseDateTime = (expense) => {
  if (!expense?.date) return { date: null, hasTime: false }
  const d = new Date(expense.date)
  if (Number.isNaN(d.getTime())) return { date: null, hasTime: false }
  if (!isCalendarDayOnly(d)) return { date: d, hasTime: true }

  // Rebuild the intended calendar day in local time (reading UTC parts avoids
  // the day shifting backwards for users west of UTC).
  const day = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  const created = expense.createdAt ? new Date(expense.createdAt) : null
  if (created && !Number.isNaN(created.getTime())
    && created.getFullYear() === day.getFullYear()
    && created.getMonth() === day.getMonth()
    && created.getDate() === day.getDate()) {
    return { date: created, hasTime: true }
  }
  return { date: day, hasTime: false }
}

/** "25 Nov 2026, 10:42 pm" — or just "25 Nov 2026" when no time is known. */
export const formatExpenseDateTime = (expense) => {
  const { date, hasTime } = getExpenseDateTime(expense)
  if (!date) return ''
  return hasTime ? formatDateTime(date) : formatDate(date)
}
