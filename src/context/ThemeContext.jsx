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

const readStoredTheme = () => {
    if (typeof window === 'undefined') return false
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === 'dark') return true
        if (stored === 'light') return false
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
        // Private mode / blocked storage — fall back to the OS preference.
        return false
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
    // `null` until the user picks explicitly — that's how we know to keep
    // following the OS setting.
    const [hasExplicitChoice, setHasExplicitChoice] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            return stored === 'dark' || stored === 'light'
        } catch {
            return false
        }
    })

    useEffect(() => {
        applyTheme(isDark)
    }, [isDark])

    // Follow the OS while the user hasn't made an explicit choice.
    useEffect(() => {
        if (hasExplicitChoice) return
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const onChange = (e) => setIsDark(e.matches)
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }, [hasExplicitChoice])

    const setTheme = useCallback((dark) => {
        setIsDark(dark)
        setHasExplicitChoice(true)
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
