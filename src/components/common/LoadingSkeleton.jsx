export const SkeletonLine = ({ className = '' }) => (
    <div className={`h-4 bg-gray-200 rounded animate-pulse ${className}`} />
)

export const SkeletonCard = () => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <SkeletonLine className="w-3/4" />
                <SkeletonLine className="w-1/2 h-3" />
            </div>
        </div>
        <SkeletonLine />
        <SkeletonLine className="w-2/3" />
    </div>
)

export const SkeletonList = ({ count = 4 }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
)

const LoadingSkeleton = ({ type = 'list', count = 4 }) => {
    if (type === 'list') return <SkeletonList count={count} />
    return <SkeletonCard />
}

export default LoadingSkeleton
