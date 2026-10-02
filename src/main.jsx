import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Fire a lightweight ping to the backend the moment the JS bundle loads.
// On Render's free tier the server spins down after ~15 min of inactivity and
// takes 30–60s to cold-start. Starting the wake-up immediately — before the
// user has even typed their email — means the server is ready (or nearly so)
// by the time they hit Login. The request is best-effort: we ignore errors and
// never block rendering on it.
if (import.meta.env.VITE_API_URL) {
    const warmupUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') + '/api/health'
    fetch(warmupUrl, { method: 'GET', signal: AbortSignal.timeout?.(20000) }).catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
