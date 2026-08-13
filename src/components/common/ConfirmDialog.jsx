import Modal from './Modal'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    loading = false,
}) => (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" hideClose>
        <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <div>
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
            </div>
            <div className="flex gap-3 w-full">
                <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
                    {cancelLabel}
                </Button>
                <Button variant={variant} className="flex-1" onClick={onConfirm} loading={loading}>
                    {confirmLabel}
                </Button>
            </div>
        </div>
    </Modal>
)

export default ConfirmDialog
