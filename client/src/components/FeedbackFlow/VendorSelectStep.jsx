import { motion } from 'framer-motion'

const VENDORS = [
    { id: 'The Craving Brew', name: 'The Craving Brew', emoji: '☕', grad: 'from-amber-100 to-orange-100', border: 'border-orange-200', accent: 'text-orange-600', desc: 'Coffee, snacks & quick bites' },
    { id: 'GSR', name: 'GSR', emoji: '🍱', grad: 'from-green-100 to-teal-100', border: 'border-green-200', accent: 'text-green-600', desc: 'Traditional meals served fresh' },
    { id: 'Uniworld', name: 'Uniworld', emoji: '🌍', grad: 'from-blue-100 to-indigo-100', border: 'border-blue-200', accent: 'text-blue-600', desc: 'Multi-cuisine food court' },
]

const VendorSelectStep = ({ user, onNext }) => {
    const assignedVendor = user.assignedVendor

    return (
        <div className="glass-card p-8">
            <div className="text-center mb-8">
                <span className="text-4xl mb-3 block">🏪</span>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">Your Mess Vendor</h2>
                <p className="text-gray-400 text-sm">You are assigned to the following mess.</p>
            </div>

            <div className="flex flex-col gap-4 mb-8">
                {VENDORS.map((v, i) => {
                    const isAssigned = v.id === assignedVendor
                    return (
                        <motion.div
                            key={v.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative rounded-2xl border-2 p-5 flex items-center gap-4 transition-all duration-200
                bg-gradient-to-r ${v.grad} ${v.border}
                ${isAssigned ? 'ring-2 ring-purple-400 ring-offset-2 shadow-card-hover scale-[1.02]' : 'opacity-50'}`}
                        >
                            <div className="text-4xl">{v.emoji}</div>
                            <div className="flex-1">
                                <div className={`font-bold text-gray-800 ${isAssigned ? 'text-purple-700' : ''}`}>{v.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{v.desc}</div>
                            </div>
                            {isAssigned && (
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs font-bold bg-grad-primary bg-clip-text text-transparent">Your Mess</span>
                                    <span className="text-lg">✓</span>
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNext}
                className="btn-gradient w-full text-base py-4"
            >
                Continue to Meal Selection →
            </motion.button>
        </div>
    )
}

export default VendorSelectStep
