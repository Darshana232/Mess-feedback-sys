import { useState } from 'react'
import { motion } from 'framer-motion'

const CommentsStep = ({ onSubmit, onBack, loading }) => {
    const [comment, setComment] = useState('')

    return (
        <div className="glass-card p-8">
            <div className="text-center mb-8">
                <span className="text-4xl mb-3 block">💬</span>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">Any Suggestions?</h2>
                <p className="text-gray-400 text-sm">Tell us what could be improved (optional)</p>
            </div>

            <motion.div
                className="relative mb-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    maxLength={500}
                    rows={5}
                    placeholder="Tell us what could be improved… better food, more variety, cleaner utensils?"
                    className="input-glass resize-none text-sm leading-relaxed"
                />
                <span className="absolute bottom-3 right-4 text-xs text-gray-300">
                    {comment.length}/500
                </span>
            </motion.div>

            {/* Tips */}
            <div className="flex flex-wrap gap-2 mb-8">
                {['More variety', 'Better taste', 'Faster service', 'Cleaner area', 'Fresh ingredients'].map(tip => (
                    <button
                        key={tip}
                        type="button"
                        onClick={() => setComment(c => c ? c + ', ' + tip.toLowerCase() : tip.toLowerCase())}
                        className="text-xs font-medium text-purple-500 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-full px-3 py-1.5 transition-all"
                    >
                        + {tip}
                    </button>
                ))}
            </div>

            <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
                    className="flex-1 py-3 rounded-full border-2 border-purple-200 text-purple-500 font-semibold text-sm hover:bg-purple-50 transition-all">
                    ← Back
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSubmit(comment)}
                    disabled={loading}
                    className="flex-[2] btn-gradient py-3 text-base"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Submitting…
                        </span>
                    ) : 'Submit Feedback 🚀'}
                </motion.button>
            </div>
        </div>
    )
}

export default CommentsStep
