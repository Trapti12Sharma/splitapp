import { useState, useEffect } from 'react'
import { getUploadUrl } from '../../utils/getUploadUrl'

const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
}

const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
    'from-fuchsia-500 to-pink-600',
    'from-teal-500 to-green-500',
]

// Hash the id (stable and well distributed) rather than the first character of
// the name, which gave every "A..." user the same colour.
const pickGradient = (key = '') => {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) | 0
    }
    return gradients[Math.abs(hash) % gradients.length]
}

const initialsOf = (name) =>
    name
        ? name
              .trim()
              .split(/\s+/)
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
        : '?'

const Avatar = ({ user, size = 'md', className = '', ring = true, style }) => {
    const src = getUploadUrl(user?.profileImage)
    const [failed, setFailed] = useState(false)

    // A new upload replaces profileImage — clear the previous failure so the
    // fresh URL actually gets attempted.
    useEffect(() => { setFailed(false) }, [src])

    const ringClass = ring ? 'ring-2 ring-white dark:ring-white/10' : ''
    const base = `${sizes[size] || sizes.md} rounded-full flex-shrink-0 ${ringClass} ${className}`

    if (src && !failed) {
        return (
            <img
                src={src}
                alt={user?.name ? `${user.name}'s avatar` : 'User avatar'}
                loading="lazy"
                decoding="async"
                // Fall back to initials instead of rendering a broken image icon
                // when the URL 404s or the host is unreachable.
                onError={() => setFailed(true)}
                className={`${base} object-cover bg-token-surface-2`}
                style={style}
            />
        )
    }

    return (
        <div
            className={`${base} bg-gradient-to-br ${pickGradient(user?._id || user?.username || user?.name || '')} flex items-center justify-center text-white font-bold select-none`}
            title={user?.name || undefined}
            style={style}
        >
            {initialsOf(user?.name)}
        </div>
    )
}

export default Avatar
