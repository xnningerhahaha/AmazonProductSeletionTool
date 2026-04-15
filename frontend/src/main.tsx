import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import AdminDashboard from './pages/AdminDashboard.tsx'
import './index.css'
import { LanguageProvider } from './i18n/LanguageContext'

const isAdmin = window.location.pathname === '/admin'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAdmin ? (
      <AdminDashboard />
    ) : (
      <LanguageProvider>
        <App />
      </LanguageProvider>
    )}
  </React.StrictMode>,
)
