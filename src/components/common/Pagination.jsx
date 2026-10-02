import Button from './Button'

/**
 * Prev/page-indicator/Next pager for the list pages whose backend routes
 * already paginate (expenses, settlements, notifications, group expenses —
 * see each controller's `{ page, limit }` query handling). Self-guarding:
 * renders nothing for a single page, so callers don't need their own
 * conditional around it.
 */
const Pagination = ({ page, pages, onChange }) => {
    if (!pages || pages <= 1) return null

    return (
        <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => onChange(page - 1)}>
                Previous
            </Button>
            <span className="text-sm text-muted font-medium">{page} / {pages}</span>
            <Button variant="secondary" size="sm" disabled={page === pages} onClick={() => onChange(page + 1)}>
                Next
            </Button>
        </div>
    )
}

export default Pagination
