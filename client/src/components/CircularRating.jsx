import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

/**
 * CircularRating
 * SVG-based circular selector. Numbers 1–5 are placed around a 240° arc.
 * Clicking a number selects it and animates the arc fill accordingly.
 */

const SIZE = 240
const CX = SIZE / 2
const CY = SIZE / 2
const RADIUS = 88
const STROKE = 12
const START_ANGLE = 150  // degrees (bottom-left)
const END_ANGLE = 30   // degrees (bottom-right), going clockwise = 240° span

const EMOJIS = ['😞', '😕', '😐', '😊', '🤩']
const LABELS = ['Poor', 'Fair', 'Okay', 'Good', 'Excellent']
const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#8b5cf6']

// Convert polar angle (degrees) to cartesian coordinates
const polarToCart = (cx, cy, r, angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// SVG arc path from startDeg to endDeg (clockwise)
const describeArc = (cx, cy, r, startDeg, endDeg) => {
    const s = polarToCart(cx, cy, r, startDeg)
    const e = polarToCart(cx, cy, r, endDeg)
    const large = (endDeg - startDeg + 360) % 360 > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

// Total arc span: 240 degrees, from START_ANGLE to START_ANGLE+240
const TOTAL_SPAN = 240

// Position of each value (1–5) along the arc
const valueAngles = [1, 2, 3, 4, 5].map(v => {
    const fraction = (v - 1) / 4   // 0 to 1
    return (START_ANGLE + fraction * TOTAL_SPAN) % 360
})

const CircularRating = ({ value, onChange, label, description, emoji: catEmoji }) => {
    // Arc fill: from START_ANGLE to the angle of the selected value
    const fillEndAngle = value > 0
        ? (START_ANGLE + ((value - 1) / 4) * TOTAL_SPAN) % 360
        : START_ANGLE

    const trackPath = describeArc(CX, CY, RADIUS, START_ANGLE, (START_ANGLE + TOTAL_SPAN) % 360)
    const fillPath = value > 0
        ? describeArc(CX, CY, RADIUS, START_ANGLE, fillEndAngle)
        : null

    const arcLength = Math.PI * 2 * RADIUS * (TOTAL_SPAN / 360)
    const fillLength = value > 0 ? arcLength * ((value - 1) / 4) : 0

    return (
        <div className="flex flex-col items-center">
            {/* Category label */}
            <div className="text-center mb-4">
                <span className="text-3xl">{catEmoji}</span>
                <h3 className="text-lg font-bold text-gray-800 mt-1">{label}</h3>
                <p className="text-xs text-gray-400">{description}</p>
            </div>

            {/* SVG Circle */}
            <div className="relative" style={{ width: SIZE, height: SIZE }}>
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                    {/* Track arc */}
                    <path
                        d={trackPath}
                        fill="none"
                        stroke="#e9d5ff"
                        strokeWidth={STROKE}
                        strokeLinecap="round"
                    />

                    {/* Filled arc */}
                    {value > 0 && (
                        <motion.path
                            d={fillPath}
                            fill="none"
                            stroke={COLORS[value - 1]}
                            strokeWidth={STROKE}
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: (value - 1) / 4 || 0.01 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    )}

                    {/* Number buttons around the arc */}
                    {[1, 2, 3, 4, 5].map((v, i) => {
                        const angle = valueAngles[i]
                        const { x, y } = polarToCart(CX, CY, RADIUS, angle)
                        const isSelected = value === v
                        return (
                            <g key={v} onClick={() => onChange(v)} style={{ cursor: 'pointer' }}>
                                <motion.circle
                                    cx={x} cy={y} r={isSelected ? 20 : 16}
                                    fill={isSelected ? COLORS[i] : '#f3e8ff'}
                                    stroke={isSelected ? COLORS[i] : '#d8b4fe'}
                                    strokeWidth={2}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    animate={{ scale: isSelected ? 1.15 : 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                />
                                <text
                                    x={x} y={y}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={isSelected ? 13 : 11}
                                    fontWeight="700"
                                    fill={isSelected ? 'white' : '#7c3aed'}
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                >
                                    {v}
                                </text>
                            </g>
                        )
                    })}
                </svg>

                {/* Center display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.span
                        key={value}
                        className="text-4xl"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                        {value > 0 ? EMOJIS[value - 1] : '🤔'}
                    </motion.span>
                    <motion.span
                        key={`label-${value}`}
                        className="text-xs font-bold mt-1"
                        style={{ color: value > 0 ? COLORS[value - 1] : '#c4b5fd' }}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {value > 0 ? LABELS[value - 1] : 'Tap to rate'}
                    </motion.span>
                </div>
            </div>

            {/* Bottom labels */}
            <div className="flex justify-between w-full max-w-[200px] mt-1">
                <span className="text-xs text-gray-400 font-medium">Poor</span>
                <span className="text-xs text-gray-400 font-medium">Excellent</span>
            </div>
        </div>
    )
}

export default CircularRating
