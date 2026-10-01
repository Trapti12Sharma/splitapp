import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

/**
 * A single source of truth for the theme.
 *
 * This used to be a plain `useState` hook, which meant every component that called
 * it owned an independent copy of `isDark`. Toggling in the sidebar updated only
 * the sidebar's copy, while the navbars and layout kept their stale value — and
 * because they applied it as inline styles (which outrank Tailwind's `dark:`
 * classes) the page ended up half dark and half light. One provider fixes that.
 */
const ThemeContext = createContext(null)

const STORAGE_KEY = 'theme'

// Dark mode is the app's default — only an explicit 'light' choice turns it
// off. This used to fall back to the OS's `prefers-color-scheme`, but the
// product default is dark regardless of system theme.
const readStoredTheme = () => {
    if (typeof window === 'undefined') return true
    try {
        return localStorage.getItem(STORAGE_KEY) !== 'light'
    } catch {
        // Private mode / blocked storage — fall back to the default.
        return true
    }
}

// Apply the class before first paint so there is no light-mode flash on reload.
const applyTheme = (dark) => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.style.colorScheme = dark ? 'dark' : 'light'
    // Keep the mobile browser chrome in step with the app background.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', dark ? '#0b0b16' : '#f6f7fb')
}

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(readStoredTheme)

    useEffect(() => {
        applyTheme(isDark)
    }, [isDark])

    const setTheme = useCallback((dark) => {
        setIsDark(dark)
        try {
            localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
        } catch {
            // Storage unavailable — the theme still applies for this session.
        }
    }, [])

    const toggle = useCallback(() => setTheme(!isDark), [isDark, setTheme])

    const value = useMemo(() => ({ isDark, toggle, setTheme }), [isDark, toggle, setTheme])

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
    return ctx
}
