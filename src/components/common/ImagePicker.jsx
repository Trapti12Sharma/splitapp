import { useEffect, useRef, useState } from 'react'
import { Camera, X, ImagePlus } from 'lucide-react'
import toast from 'react-hot-toast'

const MAX_BYTES = 5 * 1024 * 1024 // must match the server's multer limit
const ACCEPTED = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/avif']

/**
 * File picker that hands the selected `File` straight to the parent.
 *
 * The pages used to do `<input {...register('profileImage')} onChange={...} />`.
 * Because the explicit `onChange` came after the spread it *replaced* the one
 * react-hook-form supplies, so RHF never recorded the file: the preview appeared,
 * but `data.profileImage` was undefined and nothing was ever appended to the
 * FormData. Keeping the file in ordinary state removes that whole class of bug.
 */
const ImagePicker = ({
    value,
    onChange,
    currentUrl = null,
    shape = 'circle',
    size = 'w-24 h-24',
    label = 'Add photo',
    fallback = null,
}) => {
    const inputRef = useRef(null)
    const [preview, setPreview] = useState(null)

    // Object URLs leak until revoked; tie each one to the file it came from.
    useEffect(() => {
        if (!value) {
            setPreview(null)
            return
        }
        const url = URL.createObjectURL(value)
        setPreview(url)
        return () => URL.revokeObjectURL(url)
    }, [value])

    const handleSelect = (e) => {
        const file = e.target.files?.[0]
        // Reset so picking the same file twice still fires a change event.
        e.target.value = ''
        if (!file) return

        if (!ACCEPTED.includes(file.type.toLowerCase())) {
            toast.error('Please choose a JPG, PNG, WEBP, GIF, HEIC or AVIF image')
            return
        }
        if (file.size > MAX_BYTES) {
            toast.error(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max is 5MB.`)
            return
        }
        onChange(file)
    }

    const clear = (e) => {
        e.preventDefault()
        e.stopPropagation()
        onChange(null)
    }

    const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
    const shown = preview || currentUrl

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={`relative ${size} ${rounded} overflow-hidden group transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                style={{
                    border: shown ? '2px solid var(--border)' : '2px dashed var(--border-strong)',
                    background: 'var(--surface-2)',
                }}
                aria-label={shown ? 'Change image' : label}
            >
                {shown ? (
                    <img src={shown} alt="" className="w-full h-full object-cover" />
                ) : (
                    fallback || (
                        <span className="w-full h-full flex flex-col items-center justify-center gap-1 text-subtle">
                            <ImagePlus className="w-6 h-6" />
                            <span className="text-[10px] font-medium">{label}</span>
                        </span>
                    )
                )}

                {/* Hover affordance */}
                <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                </span>
            </button>

            {/* Badge sits outside the button so it is not nested inside it. */}
            {value && (
                <button
                    type="button"
                    onClick={clear}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-600 transition-colors"
                >
                    <X className="w-3 h-3" /> Remove
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED.join(',')}
                className="hidden"
                onChange={handleSelect}
            />
        </div>
    )
}

export default ImagePicker
