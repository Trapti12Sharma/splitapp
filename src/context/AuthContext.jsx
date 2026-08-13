import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Initialise once on mount — read token, fetch current user
    useEffect(() => {
        let cancelled = false
        const init = async () => {
            const token = localStorage.getItem('token')
            if (!token) { setLoading(false); return }
            try {
                const res = await authService.getMe()
                if (!cancelled) setUser(res.data.data.user)
            } catch {
                localStorage.removeItem('token')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        init()
        return () => { cancelled = true }
    }, []) // ← runs exactly once

    const login = useCallback(async (email, password) => {
        const res = await authService.login({ email, password })
        const { user: userData, token } = res.data.data
        localStorage.setItem('token', token)
        setUser(userData)
        return userData
    }, [])

    const register = useCallback(async (formData) => {
        const res = await authService.register(formData)
        const { user: userData, token } = res.data.data
        localStorage.setItem('token', token)
        setUser(userData)
        return userData
    }, [])

    const logout = useCallback(async () => {
        try { await authService.logout() } catch { }
        localStorage.removeItem('token')
        setUser(null)
    }, [])

    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser)
    }, [])

    // Memoize context value so consumers only re-render when values actually change
    const value = useMemo(
        () => ({ user, loading, login, register, logout, updateUser }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user, loading]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
