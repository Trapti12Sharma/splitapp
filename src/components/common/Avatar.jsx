const Avatar = ({ user, size = 'md', className = '' }) => {
    const sizes = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
    }

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '?'

    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
    const colorIndex = user?.name ? user.name.charCodeAt(0) % colors.length : 0

    if (user?.profileImage) {
        const imgSrc = user.profileImage.startsWith('http')
            ? user.profileImage
            : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.profileImage}`
        return (
            <img
                src={imgSrc}
                alt={user.name}
                className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`}
            />
        )
    }

    return (
        <div className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}>
            {initials}
        </div>
    )
}

export default Avatar
