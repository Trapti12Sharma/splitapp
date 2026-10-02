import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Importing this module starts the backend health-check fetch immediately —
// before React even mounts. On Render's free tier the server spins down after
// ~15 min idle and takes 30–60 s to wake. Firing the ping here means the
// warm-up has already been running for however long it took the user to see
// the login form and fill it in, so by the time they hit "Sign in" the server
// is usually ready. LoginPage reads the same promise to decide whether to show
// a "waking up" overlay.
import './utils/serverWarmup.js'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
