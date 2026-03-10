import { motion } from 'framer-motion'

const MEALS = [
    { id: 'Breakfast', emoji: '🌅', time: '7:00 – 9:00 AM', grad: 'from-amber-100 to-yellow-50', border: 'border-amber-200', ring: 'ring-amber-400' },
    { id: 'Lunch', emoji: '☀️', time: '12:00 – 2:00 PM', grad: 'from-orange-100 to-peach-50', border: 'border-orange-200', ring: 'ring-orange-400' },
    { id: 'Snacks', emoji: '🍿', time: '4:00 – 5:30 PM', grad: 'from-pink-100 to-rose-50', border: 'border-pink-200', ring: 'ring-pink-400' },
    { id: 'Dinner', emoji: '🌙', time: '7:30 – 9:30 PM', grad: 'from-indigo-100 to-purple-50', border: 'border-indigo-200', ring: 'ring-purple-400' },
]

const MealSelectStep = ({ mealType, setMealType, currentMenu, onNext, onBack }) => {
    return (
        <div className="glass-card p-8">
            <div className="text-center mb-8">
                <span className="text-4xl mb-3 block">🍽️</span>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">Select a Meal</h2>
                <p className="text-gray-400 text-sm">Which meal would you like to rate?</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                {MEALS.map((m, i) => {
                    const isSelected = mealType === m.id
                    return (
                        <motion.button
                            key={m.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setMealType(m.id)}
                            className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 cursor-pointer
                bg-gradient-to-br ${m.grad} ${m.border}
                ${isSelected ? `ring-2 ${m.ring} ring-offset-2 shadow-card-hover` : 'hover:shadow-card'}`}
                        >
                            <div className="text-3xl mb-2">{m.emoji}</div>
                            <div className="font-bold text-gray-800 text-sm">{m.id}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{m.time}</div>
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-grad-primary rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">✓</span>
                                </div>
                            )}
                        </motion.button>
                    )
                })}
            </div>

            {/* Menu Preview */}
            {currentMenu && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 flex gap-3 items-start"
                >
                    {currentMenu.imageUrl && (
                        <img src={`http://localhost:5001${currentMenu.imageUrl}`} alt="menu"
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div>
                        <p className="text-xs font-bold text-purple-500 uppercase tracking-wide mb-1">Today's Menu</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{currentMenu.items}</p>
                    </div>
                </motion.div>
            )}

            <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
                    className="flex-1 py-3 rounded-full border-2 border-purple-200 text-purple-500 font-semibold text-sm hover:bg-purple-50 transition-all">
                    ← Back
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onNext}
                    className="flex-[2] btn-gradient py-3">
                    Rate {mealType} →
                </motion.button>
            </div>
        </div>
    )
}

export default MealSelectStep
