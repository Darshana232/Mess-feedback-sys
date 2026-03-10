import { motion } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'

// Doodle shapes data
const DOODLES = [
    { emoji: '🍕', size: 48, top: '8%', left: '6%', delay: 0, duration: 6 },
    { emoji: '⭐', size: 36, top: '15%', left: '88%', delay: 1, duration: 5 },
    { emoji: '🥗', size: 44, top: '72%', left: '5%', delay: 2, duration: 7 },
    { emoji: '🍜', size: 40, top: '80%', left: '90%', delay: 0.5, duration: 5.5 },
    { emoji: '💜', size: 28, top: '45%', left: '3%', delay: 1.5, duration: 4 },
    { emoji: '🌸', size: 34, top: '30%', left: '92%', delay: 2.5, duration: 6 },
    { emoji: '✨', size: 26, top: '60%', left: '88%', delay: 3, duration: 4.5 },
    { emoji: '🍰', size: 42, top: '20%', left: '15%', delay: 1, duration: 5.5 },
    { emoji: '🥤', size: 32, top: '55%', left: '95%', delay: 2, duration: 6.5 },
    { emoji: '🌟', size: 30, top: '88%', left: '40%', delay: 0.8, duration: 5 },
]

// Pastel blob shapes
const BLOBS = [
    { color: '#fce7f3', w: 300, h: 300, top: '-100px', left: '-100px', opacity: 0.6 },
    { color: '#ede9fe', w: 200, h: 200, top: '40%', left: '70%', opacity: 0.5 },
    { color: '#fff3e6', w: 250, h: 250, bottom: '-80px', right: '-80px', opacity: 0.6 },
]

const LoginPage = ({ onSuccess }) => {
    return (
        <div className="relative min-h-screen bg-grad-hero overflow-hidden flex items-center justify-center p-6">

            {/* Pastel blob backgrounds */}
            {BLOBS.map((b, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full blur-3xl pointer-events-none"
                    style={{
                        background: b.color, width: b.w, height: b.h,
                        top: b.top, left: b.left, bottom: b.bottom, right: b.right,
                        opacity: b.opacity,
                    }}
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                    transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}

            {/* Floating emoji doodles */}
            {DOODLES.map((d, i) => (
                <motion.div
                    key={i}
                    className="absolute pointer-events-none select-none"
                    style={{ top: d.top, left: d.left, fontSize: d.size }}
                    animate={{ y: [0, -18, 0], rotate: [0, 8, -4, 0] }}
                    transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {d.emoji}
                </motion.div>
            ))}

            {/* Login card */}
            <motion.div
                className="relative z-10 w-full max-w-md glass-card p-8 sm:p-10 text-center"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
                {/* Logo */}
                <motion.div
                    className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-grad-primary flex items-center justify-center text-4xl shadow-btn"
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    🍽️
                </motion.div>

                <h1 className="text-3xl font-black tracking-tight mb-2 bg-grad-primary bg-clip-text text-transparent">
                    MessMate
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    Rate your meals. Help improve<br />your college mess experience.
                </p>

                {/* Feature chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {['⭐ Rate meals', '📋 View menus', '💬 Give feedback', '📊 Analytics'].map(f => (
                        <span key={f} className="text-xs font-medium text-purple-600 bg-purple-50 border border-purple-100 rounded-full px-3 py-1">
                            {f}
                        </span>
                    ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-purple-100" />
                    <span className="text-xs text-gray-400 font-medium">Sign in with college email</span>
                    <div className="flex-1 h-px bg-purple-100" />
                </div>

                {/* Google Login */}
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={onSuccess}
                        onError={() => console.log('Login Failed')}
                        theme="outline"
                        shape="pill"
                        size="large"
                        text="signin_with"
                    />
                </div>

                <p className="mt-6 text-xs text-gray-400">
                    Only college email addresses are allowed access.
                </p>
            </motion.div>
        </div>
    )
}

export default LoginPage
