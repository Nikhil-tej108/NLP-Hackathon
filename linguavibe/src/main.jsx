import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Note: React.StrictMode is disabled for WebRTC development
// StrictMode intentionally double-invokes effects in development,
// which causes duplicate WebSocket connections and WebRTC issues
// This is only a development behavior and doesn't affect production

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// If you want to re-enable StrictMode, use:
// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// )