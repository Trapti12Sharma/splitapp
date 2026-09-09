/**
 * A consistent hero header used at the top of every top-level page — icon
 * badge, title, subtitle, optional trailing action and stat chips, with a
 * soft colour blob behind it. Previously every page hand-rolled its own
 * `<h1>` + `<p>` pair with no shared visual identity, so navigating between
 * screens didn't feel like one designed product.
 */
const PageHeader = ({ icon: Icon, tint = 'gradient-primary', title, subtitle, stats, actions }) => (
    <div className="relative">
        {/* Soft colour wash behind the header — subtle, not another gradient card. */}
        <div
            className="absolute -top-6 -left-6 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ background: 'var(--brand-soft)' }}
        />
        <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
                {Icon && (
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${tint} flex items-center justify-center flex-shrink-0 shadow-glow`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                )}
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-default truncate">{title}</h1>
                    {subtitle && <p className="text-sm text-muted mt-0.5 truncate">{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>

        {stats && stats.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 relative">
                {stats.map(({ label, value }) => (
                    <div
                        key={label}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs"
                        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                        <span className="font-bold text-default">{value}</span>
                        <span className="text-subtle">{label}</span>
                    </div>
                ))}
            </div>
        )}
    </div>
)

export default PageHeader
