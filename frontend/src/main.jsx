import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider, useSelector } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { store } from './store/store.js'
import { initSessionManager, clearSessionManager } from './utils/sessionManager.js'
import { disableRightClick, disableKeyboardShortcuts } from './utils/videoProtection.js'
import './index.css'

// Global security protection (best-effort)
// Note: This can be bypassed by determined users, but provides basic protection
if (import.meta.env.PROD) {
  // Only enable in production
  disableRightClick();
  disableKeyboardShortcuts();
  
  // Additional devtools detection (best-effort)
  let devtools = { open: false };
  const threshold = 160;
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true;
        // Optionally redirect or show warning
        console.clear();
        console.log('%cStop!', 'color: red; font-size: 50px; font-weight: bold;');
        console.log('%cThis is a browser feature intended for developers.', 'font-size: 16px;');
      }
    } else {
      devtools.open = false;
    }
  }, 500);
}

// Component to initialize session manager on app load
const SessionInitializer = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize session manager if user is already authenticated
      initSessionManager(null, (reason) => {
        // Auto-logout callback
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          const message = reason === 'inactivity' 
            ? 'You have been logged out due to inactivity.'
            : reason === 'maxDuration'
            ? 'Your session has expired due to maximum duration limit.'
            : 'Your session has expired.';
          alert(message);
          window.location.href = '/login';
        }
      });
    } else {
      // Clear session manager if user is not authenticated
      clearSessionManager();
    }

    // Cleanup on unmount
    return () => {
      if (!isAuthenticated) {
        clearSessionManager();
      }
    };
  }, [isAuthenticated]);

  return null;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <SessionInitializer />
        <Toaster position="top-right" />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)

