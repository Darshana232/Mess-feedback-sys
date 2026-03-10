import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Star, MessageSquare, ChefHat } from 'lucide-react'
import MenuManager from './MenuManager'

const TABS = [
    { id: 'scores', label: 'Scores', icon: Star },
    { id: 'suggestions', label: 'Suggestions', icon: MessageSquare },
    { id: 'menu', label: 'Daily Menu', icon: ChefHat },
]

const VendorPortal = ({ user }) => {
    const [activeTab, setActiveTab] = useState('scores')
    const [stats, setStats] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(true)

    const API = 'http://localhost:5001/api/vendor'

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [sR, suR] = await Promise.all([
                    fetch(`${API}/my-analytics?userId=${user._id}`),
                    fetch(`${API}/my-suggestions?userId=${user._id}`),
                ])
                const [sD, suD] = await Promise.all([sR.json(), suR.json()])
                setStats(sD.stats || [])
                setSuggestions(suD.suggestions || [])
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [user])

    const totalFeedbacks = stats.reduce((s, x) => s + x.count, 0)
    const avgOverall = stats.length > 0
        ? (stats.reduce((s, x) => s + x.avgOverall, 0) / stats.length).toFixed(1) : '–'

    const radarData = (s) => [
        { subject: 'Quality', A: +s.avgQuality.toFixed(2), fullMark: 5 },
        { subject: 'Hygiene', A: +s.avgHygiene.toFixed(2), fullMark: 5 },
        { subject: 'Taste', A: +s.avgTaste.toFixed(2), fullMark: 5 },
        { subject: 'Quantity', A: +s.avgQuantity.toFixed(2), fullMark: 5 },
        { subject: 'Overall', A: +s.avgOverall.toFixed(2), fullMark: 5 },
    ]

    const BarRow = ({ label, value }) => (
        <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-medium text-gray-500 w-16 flex-shrink-0">{label}</span>
            <div className="flex-1 bg-purple-100 rounded-full h-2">
                <motion.div
                    className="h-2 rounded-full bg-grad-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / 5) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
            </div>
            <span className="text-xs font-bold text-purple-600 w-8 text-right">{value.toFixed(1)}</span>
        </div>
    )

    if (loading) return (
        <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
            <svg className="animate-spin w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
            </svg>
            Loading your data…
        </div>
    )

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight text-gray-800">
                    Vendor <span className="bg-grad-primary bg-clip-text text-transparent">Portal</span>
                </h2>
                <p className="text-gray-400 mt-1 text-sm">Track your performance and manage your daily menu.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Ratings Today', value: totalFeedbacks, icon: '⭐', grad: 'from-purple-100 to-violet-50', accent: 'text-purple-600' },
                    { label: 'Meals Rated', value: stats.length, icon: '🍽️', grad: 'from-pink-100 to-rose-50', accent: 'text-pink-600' },
                    { label: 'Avg Overall', value: avgOverall, icon: '📈', grad: 'from-orange-100 to-amber-50', accent: 'text-orange-600' },
                ].map((c, i) => (
                    <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className={`glass-card-sm p-4 bg-gradient-to-br ${c.grad} hover:-translate-y-1 transition-all`}>
                        <div className="text-2xl mb-1">{c.icon}</div>
                        <div className={`text-2xl font-black ${c.accent}`}>{c.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5 font-medium">{c.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/70 border border-purple-100 backdrop-blur-sm rounded-full p-1.5 mb-6 w-fit">
                {TABS.map(t => {
                    const Icon = t.icon
                    return (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
                ${activeTab === t.id ? 'bg-grad-primary text-white shadow-btn' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'}`}>
                            <Icon className="w-4 h-4" />{t.label}
                        </button>
                    )
                })}
            </div>

            {/* Scores Tab */}
            {activeTab === 'scores' && (
                <div className="space-y-4">
                    {stats.length === 0 ? (
                        <div className="glass-card p-16 text-center text-gray-400"><div className="text-4xl mb-3">📭</div>No ratings for your mess today.</div>
                    ) : stats.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800">{s._id}</h3>
                                <span className="text-xs bg-purple-100 text-purple-600 rounded-full px-3 py-1 font-semibold">{s.count} ratings</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <BarRow label="Quality" value={s.avgQuality} />
                                    <BarRow label="Hygiene" value={s.avgHygiene} />
                                    <BarRow label="Taste" value={s.avgTaste} />
                                    <BarRow label="Quantity" value={s.avgQuantity} />
                                    <BarRow label="Overall" value={s.avgOverall} />
                                </div>
                                <div className="flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <RadarChart data={radarData(s)}>
                                            <PolarGrid stroke="#e9d5ff" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                            <Radar name="Avg" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
                <div className="space-y-3">
                    {suggestions.length === 0 ? (
                        <div className="glass-card p-16 text-center text-gray-400"><div className="text-4xl mb-3">💬</div>No suggestions yet.</div>
                    ) : suggestions.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="glass-card-sm p-5">
                            <p className="text-gray-700 text-sm leading-relaxed mb-3">"{s.suggestion}"</p>
                            <div className="flex gap-2">
                                <span className="text-xs font-bold bg-purple-100 text-purple-600 rounded-full px-3 py-1">{s.mealType}</span>
                                <span className="text-xs text-gray-400">{new Date(s.date).toLocaleDateString()}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Menu Tab */}
            {activeTab === 'menu' && <MenuManager user={user} />}
        </div>
    )
}

export default VendorPortal
