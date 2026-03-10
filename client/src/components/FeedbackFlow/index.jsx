import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import VendorSelectStep from './VendorSelectStep'
import MealSelectStep from './MealSelectStep'
import RatingStep from './RatingStep'
import CommentsStep from './CommentsStep'
import SuccessStep from './SuccessStep'

const STEPS = ['Vendor', 'Meal', 'Rate', 'Comment', 'Done']

const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

const FeedbackFlow = ({ user }) => {
    const [step, setStep] = useState(0)
    const [direction, setDir] = useState(1)
    const [mealType, setMealType] = useState('Breakfast')
    const [ratings, setRatings] = useState({ quality: 0, hygiene: 0, quantity: 0, taste: 0, overall: 0 })
    const [ratingStep, setRatingStep] = useState(0)
    const [suggestion, setSuggestion] = useState('')
    const [loading, setLoading] = useState(false)
    const [currentMenu, setCurrentMenu] = useState(null)

    const RATING_CATEGORIES = [
        { key: 'quality', label: 'Food Quality', emoji: '🍲', description: 'How nutritious and well-prepared was the food?' },
        { key: 'taste', label: 'Taste', emoji: '😋', description: 'How good did the food taste?' },
        { key: 'hygiene', label: 'Hygiene', emoji: '✨', description: 'How clean was the mess area and utensils?' },
        { key: 'overall', label: 'Overall', emoji: '⭐', description: 'Your overall experience this meal?' },
    ]

    useEffect(() => {
        if (!user || !mealType) return
        const fetchMenu = async () => {
            try {
                const dateStr = new Date().toISOString().split('T')[0]
                const res = await fetch(`http://localhost:5001/api/menu?vendorId=${user.assignedVendor}&date=${dateStr}`)
                const data = await res.json()
                const mealMenu = data.menus?.find(m => m.mealType === mealType)
                setCurrentMenu(mealMenu || null)
            } catch (e) { console.error(e) }
        }
        fetchMenu()
    }, [mealType, user])

    // Also check if already rated
    useEffect(() => {
        if (!user || !mealType) return
        const checkStatus = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/feedback/status?userId=${user._id}&mealType=${mealType}`)
                const data = await res.json()
                if (data.hasRated) setStep(4) // jump to success-like state
            } catch (e) { }
        }
        if (step === 0) checkStatus()
    }, [mealType])

    const goNext = () => {
        setDir(1)
        setStep(s => Math.min(s + 1, STEPS.length - 1))
    }
    const goBack = () => {
        setDir(-1)
        setStep(s => Math.max(s - 1, 0))
    }

    const handleSubmit = async (comment) => {
        setSuggestion(comment)
        setLoading(true)
        try {
            const res = await fetch('http://localhost:5001/api/feedback/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    vendorId: user.assignedVendor,
                    mealType,
                    ratings: { ...ratings, quantity: ratings.quality }, // map quality to quantity too
                    suggestion: comment,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setDir(1)
                setStep(4)
            } else {
                alert('Error: ' + data.message)
            }
        } catch (e) {
            alert('Failed to submit feedback.')
        } finally {
            setLoading(false)
        }
    }

    const handleRatingSet = (key, val) => {
        setRatings(prev => ({ ...prev, [key]: val }))
    }

    const resetFlow = () => {
        setStep(0); setDir(1); setRatingStep(0)
        setRatings({ quality: 0, hygiene: 0, quantity: 0, taste: 0, overall: 0 })
        setSuggestion('')
    }

    const renderStep = () => {
        switch (step) {
            case 0: return <VendorSelectStep user={user} onNext={() => { setDir(1); setStep(1) }} />
            case 1: return <MealSelectStep mealType={mealType} setMealType={setMealType} currentMenu={currentMenu} onNext={goNext} onBack={goBack} />
            case 2: return (
                <RatingStep
                    categories={RATING_CATEGORIES}
                    ratings={ratings}
                    onRate={handleRatingSet}
                    ratingStep={ratingStep}
                    setRatingStep={setRatingStep}
                    onNext={goNext}
                    onBack={goBack}
                />
            )
            case 3: return <CommentsStep onSubmit={handleSubmit} onBack={goBack} loading={loading} />
            case 4: return <SuccessStep vendor={user.assignedVendor} mealType={mealType} onReset={resetFlow} />
            default: return null
        }
    }

    return (
        <div className="max-w-lg mx-auto">
            {/* Progress bar */}
            {step < 4 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {STEPS.slice(0, 4).map((s, i) => (
                            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${i < step ? 'bg-grad-primary text-white shadow-btn' :
                                        i === step ? 'bg-white border-2 border-purple-400 text-purple-600' :
                                            'bg-white border-2 border-gray-200 text-gray-300'}`}>
                                    {i < step ? '✓' : i + 1}
                                </div>
                                {i < 3 && (
                                    <div className={`flex-1 h-1 rounded-full mx-1 transition-all duration-500
                    ${i < step ? 'bg-grad-primary' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 text-center font-medium">
                        {STEPS[step]} · Step {step + 1} of 4
                    </p>
                </div>
            )}

            {/* Step Slides */}
            <div className="relative overflow-hidden">
                <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

export default FeedbackFlow
