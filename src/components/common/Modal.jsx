import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

/**
 * The modal surface used to be hardcoded to `#16162a`, so every dialog rendered
 * dark even in light mode. It now follows the design tokens.
 */
const Modal = ({ isOpen, onClose, title, subtitle, children, size = 'md', hideClose = false }) => {
    const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-full mx-4' }
    const panelRef = useRef(null)

    useEffect(() => {
        if (!isOpen) return
        // Lock scroll while open, and restore whatever the page had before
        // rather than assuming it was 'unset'.
        const previous = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = previous }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const onKeyDown = (e) => {
            if (e.key === 'Escape') { onClose?.(); return }

            // Keep focus inside the dialog while it is open.
            if (e.key !== 'Tab' || !panelRef.current) return
            const focusable = panelRef.current.querySelectorAll(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            )
            if (focusable.length === 0) return
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div
                ref={panelRef}
                className={`relative w-full ${sizes[size]} flex flex-col max-h-[92vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl border animate-slide-up overflow-hidden`}
                style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                }}
            >
                {/* Accent bar — a small touch of colour so dialogs don't read as flat grey boxes. */}
                <div className="h-1 w-full gradient-primary flex-shrink-0" />

                {(title || !hideClose) && (
                    <div
                        className="flex items-center justify-between gap-3 px-6 py-4 border-b flex-shrink-0"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <div className="min-w-0">
                            {title && <h2 className="text-base font-bold text-default truncate">{title}</h2>}
                            {subtitle && <p className="text-xs text-subtle mt-0.5 truncate">{subtitle}</p>}
                        </div>
                        {!hideClose && (
                            <button
                                onClick={onClose}
                                aria-label="Close dialog"
                                className="ml-auto p-1.5 rounded-xl text-muted hover:text-default transition-colors flex-shrink-0"
                                style={{ background: 'var(--surface-2)' }}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                <div className="overflow-y-auto flex-1 p-6">{children}</div>
            </div>
        </div>,
        document.body
    )
}

export default Modal
