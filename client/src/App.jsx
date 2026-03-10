import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import FeedbackFlow from './components/FeedbackFlow/index'
import AdminDashboard from './components/AdminDashboard'
import VendorPortal from './components/VendorPortal'
import LoginPage from './components/LoginPage'
import './App.css'

const ROLE_COLORS = {
  student: 'bg-purple-100 text-purple-700',
  admin: 'bg-pink-100 text-pink-600',
  vendor: 'bg-orange-100 text-orange-600',
}

function App() {
  const [user, setUser] = useState(null)

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      })
      const data = await response.json()
      if (response.ok) setUser(data.user)
      else alert(data.message)
    } catch (err) {
      console.error('Login Failed:', err)
    }
  }

  const renderView = () => {
    switch (user?.role) {
      case 'admin': return <AdminDashboard user={user} />
      case 'vendor': return <VendorPortal user={user} />
      default: return <FeedbackFlow user={user} />
    }
  }

  if (!user) return <LoginPage onSuccess={handleLoginSuccess} />

  return (
    <div className="min-h-screen bg-grad-hero">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-purple-100/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-grad-primary flex items-center justify-center text-lg shadow-btn">
              🍽️
            </div>
            <span className="font-bold text-lg bg-grad-primary bg-clip-text text-transparent tracking-tight">
              MessMate
            </span>
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 bg-white border border-purple-100 rounded-full px-3 py-1.5">
              <img
                src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff`}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${ROLE_COLORS[user.role] || ROLE_COLORS.student}`}>
              {user.role}
            </span>
            <button
              onClick={() => setUser(null)}
              className="text-xs text-gray-400 hover:text-red-400 border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-full px-3 py-1.5 transition-all duration-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={user.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
