const Avatar = ({ user, size = 'md', className = '' }) => {
    const sizes = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-xl',
    }

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '?'

    const gradients = [
        'from-violet-500 to-purple-600',
        'from-blue-500 to-cyan-500',
        'from-emerald-500 to-teal-500',
        'from-orange-500 to-amber-500',
        'from-pink-500 to-rose-500',
        'from-indigo-500 to-blue-500',
    ]
    const gradientIndex = user?.name ? user.name.charCodeAt(0) % gradients.length : 0

    if (user?.profileImage) {
        // Cloudinary URLs are always full https:// URLs
        const imgSrc = user.profileImage.startsWith('http')
            ? user.profileImage
            : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.profileImage}`

        return (
            <img
                src={imgSrc}
                alt={user.name}
                className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-gray-800 ${className}`}
            />
        )
    }

    return (
        <div className={`${sizes[size]} bg-gradient-to-br ${gradients[gradientIndex]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white dark:ring-gray-800 ${className}`}>
            {initials}
        </div>
    )
}

export default Avatar
