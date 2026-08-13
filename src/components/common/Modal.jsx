import { useEffect } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

const Modal = ({ isOpen, onClose, title, children, size = 'md', hideClose = false }) => {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4',
    }

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'unset'
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]`}>
                {(title || !hideClose) && (
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
                        {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
                        {!hideClose && (
                            <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}
                <div className="overflow-y-auto flex-1 p-5">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}

export default Modal
