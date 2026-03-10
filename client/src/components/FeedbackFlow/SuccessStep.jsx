import { useEffect } from 'react'
import { motion } from 'framer-motion'

const CONFETTI_COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#34d399', '#60a5fa', '#fbbf24']

const SuccessStep = ({ vendor, mealType, onReset }) => {
    // Confetti items
    const confetti = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        x: Math.random() * 300 - 150,
        delay: Math.random() * 0.5,
        size: Math.random() * 10 + 6,
        rotate: Math.random() * 720,
    }))

    return (
        <div className="glass-card p-10 text-center relative overflow-hidden">
            {/* Confetti burst */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {confetti.map(c => (
                    <motion.div
                        key={c.id}
                        className="absolute rounded-sm"
                        style={{ width: c.size, height: c.size, background: c.color, borderRadius: c.size < 8 ? '50%' : 2 }}
                        initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                        animate={{
                            x: c.x,
                            y: -(Math.random() * 180 + 60),
                            opacity: 0,
                            rotate: c.rotate,
                            scale: 0,
                        }}
                        transition={{ duration: 1.2, delay: c.delay, ease: [0.22, 1, 0.36, 1] }}
                    />
                ))}
            </div>

            {/* Animated Checkmark */}
            <motion.div
                className="relative w-24 h-24 mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            >
                <div className="absolute inset-0 rounded-full bg-grad-success opacity-20 animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-grad-success flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 52 52" className="w-12 h-12">
                        <motion.path
                            fill="none"
                            stroke="white"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 27 L22 35 L38 17"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                        />
                    </svg>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">
                    Feedback Submitted! 🎉
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">
                    Thank you for rating <strong className="text-purple-600">{mealType}</strong> at<br />
                    <strong className="text-purple-600">{vendor}</strong>
                </p>
                <p className="text-gray-400 text-xs mb-8">
                    Your feedback helps make the mess experience better for everyone.
                </p>

                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onReset}
                    className="btn-gradient px-10 py-3 text-base"
                >
                    Rate Another Meal
                </motion.button>
            </motion.div>
        </div>
    )
}

export default SuccessStep
