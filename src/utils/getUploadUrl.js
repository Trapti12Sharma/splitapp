/**
 * Convert a relative upload path to a full URL.
 * Works in both development (localhost) and production (Render).
 */
export const getUploadUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  return `${base}${path}`
}
