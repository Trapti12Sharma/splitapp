import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    timeout: 30000, // uploads on a slow connection need room, but not forever
})

// Attach JWT and pick the right Content-Type for the payload.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // The instance used to hardcode `Content-Type: application/json`. Axios
        // treats a JSON content type as an instruction to serialise the body, so
        // any FormData sent through it was converted to JSON and the file was
        // silently dropped. Let the browser set the multipart boundary itself,
        // and only declare JSON when the body really is JSON.
        const isFormData =
            typeof FormData !== 'undefined' && config.data instanceof FormData

        if (isFormData) {
            // AxiosHeaders normalises casing internally, so use its own API
            // rather than `delete` on the object.
            if (typeof config.headers.delete === 'function') {
                config.headers.delete('Content-Type')
            } else {
                delete config.headers['Content-Type']
            }
        } else if (config.data !== undefined && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json'
        }

        return config
    },
    (error) => Promise.reject(error)
)

// Handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api
