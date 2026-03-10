import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CircularRating from '../CircularRating'

const slideVariants = {
    enter: (d) => ({ x: d > 0 ? '80%' : '-80%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? '-80%' : '80%', opacity: 0 }),
}

const RatingStep = ({ categories, ratings, onRate, ratingStep, setRatingStep, onNext, onBack }) => {
    const [dir, setDir] = useState(1)
    const cat = categories[ratingStep]
    const isLast = ratingStep === categories.length - 1
    const currentVal = ratings[cat.key]

    const goPrev = () => {
        if (ratingStep === 0) { onBack(); return }
        setDir(-1); setRatingStep(s => s - 1)
    }
    const goFwd = () => {
        if (currentVal === 0) return
        if (isLast) { onNext(); return }
        setDir(1); setRatingStep(s => s + 1)
    }

    return (
        <div className="glass-card p-8">
            {/* Category dots */}
            <div className="flex justify-center gap-2 mb-6">
                {categories.map((c, i) => (
                    <motion.div
                        key={c.key}
                        animate={{ scale: i === ratingStep ? 1 : 0.7, opacity: i <= ratingStep ? 1 : 0.3 }}
                        className={`h-2 rounded-full transition-all duration-300
              ${i === ratingStep ? 'w-6 bg-grad-primary' : 'w-2 bg-purple-200'}`}
                    />
                ))}
            </div>

            <div className="relative overflow-hidden min-h-[380px] flex flex-col items-center justify-center">
                <AnimatePresence custom={dir} mode="wait">
                    <motion.div
                        key={ratingStep}
                        custom={dir}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="flex flex-col items-center w-full"
                    >
                        <CircularRating
                            value={currentVal}
                            onChange={(v) => onRate(cat.key, v)}
                            label={cat.label}
                            description={cat.description}
                            emoji={cat.emoji}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Nav */}
            <div className="flex gap-3 mt-4">
                <motion.button whileTap={{ scale: 0.97 }} onClick={goPrev}
                    className="flex-1 py-3 rounded-full border-2 border-purple-200 text-purple-500 font-semibold text-sm hover:bg-purple-50 transition-all">
                    ← Back
                </motion.button>
                <motion.button
                    whileHover={currentVal > 0 ? { scale: 1.02 } : {}}
                    whileTap={currentVal > 0 ? { scale: 0.98 } : {}}
                    onClick={goFwd}
                    disabled={currentVal === 0}
                    className={`flex-[2] btn-gradient py-3 ${currentVal === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                    {isLast ? 'Next: Comments →' : `Next: ${categories[ratingStep + 1]?.label} →`}
                </motion.button>
            </div>
            {currentVal === 0 && (
                <p className="text-center text-xs text-gray-400 mt-2">Tap a number on the dial to rate</p>
            )}
        </div>
    )
}

export default RatingStep
