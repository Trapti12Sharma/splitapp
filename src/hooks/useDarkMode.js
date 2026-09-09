import { useTheme } from '../context/ThemeContext'

/**
 * Backwards-compatible alias for `useTheme`.
 *
 * This was previously a standalone `useState` hook, so each component that called
 * it held its own independent copy of the theme and toggling in one place left
 * the others stale. It now delegates to the single ThemeContext; the old name is
 * kept so existing imports keep working.
 */
export const useDarkMode = useTheme

export default useDarkMode
