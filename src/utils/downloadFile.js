/**
 * Helpers for downloading files returned by the API as blobs.
 */

/**
 * Pull the filename out of a Content-Disposition header. Prefers the RFC 5987
 * `filename*=UTF-8''…` form (keeps non-Latin group names intact) and falls
 * back to the plain `filename="…"`.
 */
export const filenameFromDisposition = (header) => {
    if (!header) return null
    const star = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header)
    if (star) {
        try {
            return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ''))
        } catch {
            // malformed encoding — fall through to the plain form
        }
    }
    const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header)
    return plain ? plain[1].trim() : null
}

/** Trigger a browser download for a Blob. */
export const saveBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.rel = 'noopener'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    link.remove()
    // Revoking synchronously can cancel the download in Safari/Firefox.
    setTimeout(() => URL.revokeObjectURL(url), 10000)
}

/**
 * With `responseType: 'blob'` an API error body is a Blob too, so
 * `err.response.data.message` is undefined. Read the JSON out of it.
 */
export const blobErrorMessage = async (err, fallback) => {
    const data = err?.response?.data
    if (data instanceof Blob) {
        try {
            const parsed = JSON.parse(await data.text())
            if (parsed?.message) return parsed.message
        } catch {
            // not JSON — use the fallback
        }
    }
    if (err?.code === 'ECONNABORTED') return 'The download took too long. Please try again.'
    return data?.message || fallback
}
