import Button from './Button'

const EmptyState = ({ icon: Icon, title, description, action, actionLabel }) => (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
        {Icon && (
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
                <Icon className="w-8 h-8 text-white" />
            </div>
        )}
        <h3 className="text-base font-bold text-default mb-1">{title}</h3>
        {description && <p className="text-sm text-muted mb-6 max-w-sm">{description}</p>}
        {action && actionLabel && (
            <Button onClick={action} size="sm">{actionLabel}</Button>
        )}
    </div>
)

export default EmptyState
