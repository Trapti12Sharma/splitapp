import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import ImagePicker from '../common/ImagePicker'
import { groupService } from '../../services/groupService'

/**
 * Admin-only: rename a group, edit its description, or replace its photo.
 * The backend has always supported PUT /api/groups/:id — there was simply no
 * UI anywhere that called it.
 */
const EditGroupModal = ({ isOpen, onClose, group, onSuccess }) => {
    const [loading, setLoading] = useState(false)
    const [image, setImage] = useState(null)
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { name: group?.name || '', description: group?.description || '' },
    })

    useEffect(() => {
        if (isOpen && group) {
            reset({ name: group.name, description: group.description || '' })
            setImage(null)
        }
    }, [isOpen, group, reset])

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', data.name)
            formData.append('description', data.description || '')
            if (image) formData.append('groupImage', image)
            const res = await groupService.updateGroup(group._id, formData)
            toast.success('Group updated')
            onSuccess?.(res.data.data.group)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update group')
        } finally { setLoading(false) }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Group" size="sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="flex justify-center">
                    <ImagePicker
                        value={image}
                        onChange={setImage}
                        currentUrl={group?.groupImage}
                        shape="rounded"
                        label="Group photo"
                    />
                </div>

                <Input label="Group Name" error={errors.name?.message}
                    {...register('name', { required: 'Group name is required' })} />

                <div>
                    <label className="block text-sm font-semibold text-muted mb-1.5">Description (optional)</label>
                    <textarea rows={2} placeholder="What is this group for?" className="field resize-none"
                        {...register('description')} />
                </div>

                <div className="flex gap-3 pt-1">
                    <Button variant="secondary" className="flex-1" type="button" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1" type="submit" loading={loading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    )
}

export default EditGroupModal
