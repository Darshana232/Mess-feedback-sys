import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer
} from 'recharts'
import { Users, Star, MessageSquare, TrendingUp, ChefHat, BarChart2 } from 'lucide-react'
import MenuManager from './MenuManager'

const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'suggestions', label: 'Suggestions', icon: MessageSquare },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'menu', label: 'Daily Menu', icon: ChefHat },
]

const GRAD_COLORS = {
    admin: ['#8b5cf6', '#ec4899'],
    students: ['#60a5fa', '#8b5cf6'],
    avg: ['#34d399', '#059669'],
    feedback: ['#f97316', '#ec4899'],
}

const PIE_COLORS = ['#8b5cf6', '#ec4899', '#fb923c', '#34d399']
const RADAR_KEYS = ['Quality', 'Hygiene', 'Taste', 'Quantity', 'Overall']

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
}

const AdminDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview')
    const [stats, setStats] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState('vendor')
    const [inviteVendor, setInviteVendor] = useState('The Craving Brew')
    const [inviteMsg, setInviteMsg] = useState('')

    const [adminMenuVendor, setAdminMenuVendor] = useState('The Craving Brew')
    const [filterVendor, setFilterVendor] = useState('all')
    const [filterMeal, setFilterMeal] = useState('all')

    const API = 'http://localhost:5001/api/admin'

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [sR, suR, uR] = await Promise.all([
                fetch(`${API}/analytics?userId=${user._id}`),
                fetch(`${API}/suggestions?userId=${user._id}`),
                fetch(`${API}/users?userId=${user._id}`),
            ])
            const [sD, suD, uD] = await Promise.all([sR.json(), suR.json(), uR.json()])
            setStats(sD.stats || [])
            setSuggestions(suD.suggestions || [])
            setUsers(uD.users || [])
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleRoleChange = async (targetUserId, newRole) => {
        try {
            const res = await fetch(`${API}/update-user?userId=${user._id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId, newRole }),
            })
            if (res.ok) fetchData(); else { const d = await res.json(); alert(d.message) }
        } catch (e) { console.error(e) }
    }

    const handleInvite = async (e) => {
        e.preventDefault(); setInviteMsg('')
        try {
            const res = await fetch(`${API}/invite-user?userId=${user._id}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole, assignedVendor: inviteVendor }),
            })
            const data = await res.json()
            setInviteMsg(data.message)
            if (res.ok) { setInviteEmail(''); fetchData() }
        } catch (e) { setInviteMsg('Failed to invite') }
    }

    // Compute analytics
    const totalFeedbacks = stats.reduce((s, x) => s + x.count, 0)
    const avgOverall = stats.length > 0
        ? (stats.reduce((s, x) => s + x.avgOverall, 0) / stats.length).toFixed(1) : '–'

    const filteredStats = stats.filter(s =>
        (filterVendor === 'all' || s._id?.vendorId === filterVendor) &&
        (filterMeal === 'all' || s._id?.mealType === filterMeal)
    )

    // Chart data
    const barData = stats.map(s => ({
        name: s._id?.vendorId?.split(' ')[0] + ' - ' + s._id?.mealType,
        Quality: +s.avgQuality.toFixed(1),
        Taste: +s.avgTaste.toFixed(1),
        Hygiene: +s.avgHygiene.toFixed(1),
        Overall: +s.avgOverall.toFixed(1),
    }))

    const vendorMap = {}
    stats.forEach(s => {
        const v = s._id?.vendorId || 'Unknown'
        vendorMap[v] = (vendorMap[v] || 0) + s.count
    })
    const pieData = Object.entries(vendorMap).map(([name, value]) => ({ name, value }))

    const mealMap = {}
    stats.forEach(s => {
        const m = s._id?.mealType || 'Unknown'
        mealMap[m] = (mealMap[m] || 0) + s.count
    })
    const mealPieData = Object.entries(mealMap).map(([name, value]) => ({ name, value }))

    const radarData = RADAR_KEYS.map(k => {
        const vals = stats.map(s => s[`avg${k}`] || 0)
        return { subject: k, A: vals.length ? +(vals.reduce((a, b) => a + b) / vals.length).toFixed(2) : 0, fullMark: 5 }
    })

    const lineData = stats.map((s, i) => ({
        name: s._id?.mealType, Overall: +s.avgOverall.toFixed(1), Quality: +s.avgQuality.toFixed(1)
    }))

    const vendors = [...new Set(stats.map(s => s._id?.vendorId).filter(Boolean))]
    const meals = [...new Set(stats.map(s => s._id?.mealType).filter(Boolean))]
    const getInit = (n) => (n || '?').split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2)
    const ROLE_COLORS = { student: 'bg-purple-100 text-purple-700', admin: 'bg-pink-100 text-pink-600', vendor: 'bg-orange-100 text-orange-600' }

    if (loading) return (
        <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
            <svg className="animate-spin w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
            </svg>
            Loading dashboard…
        </div>
    )

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight text-gray-800">
                    Admin <span className="bg-grad-primary bg-clip-text text-transparent">Dashboard</span>
                </h2>
                <p className="text-gray-400 mt-1 text-sm">Overview of all mess feedback, users, and menus.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/70 border border-purple-100 backdrop-blur-sm rounded-full p-1.5 mb-8 overflow-x-auto w-fit">
                {TABS.map(t => {
                    const Icon = t.icon
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap
                ${activeTab === t.id ? 'bg-grad-primary text-white shadow-btn' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'}`}
                        >
                            <Icon className="w-4 h-4" />{t.label}
                        </button>
                    )
                })}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Ratings Today', value: totalFeedbacks, icon: Star, grad: 'from-purple-100 to-violet-50', accent: 'text-purple-600' },
                            { label: 'Avg Overall Score', value: avgOverall, icon: TrendingUp, grad: 'from-pink-100 to-rose-50', accent: 'text-pink-600' },
                            { label: 'Total Users', value: users.length, icon: Users, grad: 'from-blue-100 to-indigo-50', accent: 'text-blue-600' },
                            { label: 'Suggestions', value: suggestions.length, icon: MessageSquare, grad: 'from-orange-100 to-amber-50', accent: 'text-orange-600' },
                        ].map((c, i) => {
                            const Icon = c.icon
                            return (
                                <motion.div key={c.label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                                    className={`glass-card-sm p-5 bg-gradient-to-br ${c.grad} hover:-translate-y-1 hover:shadow-card-hover transition-all`}>
                                    <Icon className={`w-5 h-5 ${c.accent} mb-3`} />
                                    <div className={`text-3xl font-black ${c.accent}`}>{c.value}</div>
                                    <div className="text-xs text-gray-500 mt-1 font-medium">{c.label}</div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Filters */}
                    <div className="glass-card-sm p-4 flex flex-wrap gap-3 items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Filters:</span>
                        <select className="input-glass w-auto text-xs py-2" value={filterVendor} onChange={e => setFilterVendor(e.target.value)}>
                            <option value="all">All Vendors</option>
                            {vendors.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <select className="input-glass w-auto text-xs py-2" value={filterMeal} onChange={e => setFilterMeal(e.target.value)}>
                            <option value="all">All Meals</option>
                            {meals.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    {/* Charts */}
                    {stats.length === 0 ? (
                        <div className="glass-card p-16 text-center text-gray-400">
                            <div className="text-4xl mb-3">📭</div>No feedback data for today yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Bar Chart */}
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-bold text-gray-600 mb-4 flex items-center gap-2">
                                    <BarChart2 className="w-4 h-4 text-purple-400" /> Vendor Comparison
                                </h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={barData} margin={{ left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                        <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                        <Legend />
                                        <Bar dataKey="Quality" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Taste" fill="#ec4899" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Hygiene" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Overall" fill="#34d399" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Line Chart */}
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-bold text-gray-600 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-pink-400" /> Rating Trend by Meal
                                </h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={lineData} margin={{ left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                        <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="Overall" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 5, fill: '#8b5cf6' }} />
                                        <Line type="monotone" dataKey="Quality" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 5, fill: '#ec4899' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Pie Charts */}
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-bold text-gray-600 mb-4">Feedback by Vendor</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Radar Chart */}
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-bold text-gray-600 mb-4">Rating Categories (Radar)</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#e9d5ff" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                        <Radar name="Avg" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Feedback Table */}
                    {filteredStats.length > 0 && (
                        <div className="glass-card p-6 overflow-x-auto">
                            <h3 className="text-sm font-bold text-gray-600 mb-4">Feedback Breakdown</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-purple-100">
                                        <th className="pb-3 pr-4">Vendor</th>
                                        <th className="pb-3 pr-4">Meal</th>
                                        <th className="pb-3 pr-4">Ratings</th>
                                        <th className="pb-3 pr-4">Count</th>
                                        <th className="pb-3">Overall</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStats.map((s, i) => (
                                        <tr key={i} className="border-b border-purple-50 hover:bg-purple-50/40 transition-colors">
                                            <td className="py-3 pr-4 font-medium text-gray-700">{s._id?.vendorId}</td>
                                            <td className="py-3 pr-4 text-gray-500">{s._id?.mealType}</td>
                                            <td className="py-3 pr-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {[['Q', s.avgQuality], ['T', s.avgTaste], ['H', s.avgHygiene]].map(([k, v]) => (
                                                        <span key={k} className="text-xs bg-purple-100 text-purple-600 rounded-full px-2 py-0.5 font-medium">
                                                            {k}:{v.toFixed(1)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 text-gray-500">{s.count}</td>
                                            <td className="py-3">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full
                          ${s.avgOverall >= 4 ? 'bg-green-100 text-green-700' : s.avgOverall >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                                                    ⭐ {s.avgOverall.toFixed(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">
                        {suggestions.length} Student Suggestions
                    </h3>
                    {suggestions.length === 0 ? (
                        <div className="glass-card p-16 text-center text-gray-400"><div className="text-4xl mb-3">💬</div>No suggestions yet.</div>
                    ) : suggestions.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="glass-card-sm p-5">
                            <p className="text-gray-700 text-sm leading-relaxed mb-3">"{s.suggestion}"</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs font-bold bg-purple-100 text-purple-600 rounded-full px-3 py-1">{s.mealType}</span>
                                <span className="text-xs bg-pink-100 text-pink-600 rounded-full px-3 py-1">{s.vendorId}</span>
                                <span className="text-xs text-gray-400">{new Date(s.date).toLocaleDateString()}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    {/* Invite Form */}
                    <div className="glass-card p-6">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" /> Invite User</h3>
                        <form onSubmit={handleInvite} className="space-y-3">
                            <input type="text" placeholder="college@email.edu" value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)} required className="input-glass" />
                            <div className="flex gap-3">
                                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="input-glass">
                                    <option value="vendor">Vendor</option>
                                    <option value="admin">Admin</option>
                                    <option value="student">Student</option>
                                </select>
                                <select value={inviteVendor} onChange={e => setInviteVendor(e.target.value)} className="input-glass">
                                    <option>The Craving Brew</option>
                                    <option>GSR</option>
                                    <option>Uniworld</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-gradient w-full py-3">Send Invite ✉️</button>
                            {inviteMsg && <p className={`text-sm text-center font-medium ${inviteMsg.includes('Failed') ? 'text-red-400' : 'text-green-500'}`}>{inviteMsg}</p>}
                        </form>
                    </div>

                    {/* User List */}
                    <div className="glass-card p-6">
                        <h3 className="font-bold text-gray-700 mb-4">All Users ({users.length})</h3>
                        <div className="space-y-3">
                            {users.map((u, i) => (
                                <motion.div key={u._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-purple-50/50 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-grad-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {getInit(u.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-800 text-sm truncate">{u.name}</div>
                                        <div className="text-xs text-gray-400 truncate">{u.email}</div>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role] || ROLE_COLORS.student}`}>{u.role}</span>
                                    <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                                        className="input-glass w-auto text-xs py-1.5 px-2">
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                        <option value="vendor">Vendor</option>
                                    </select>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Tab */}
            {activeTab === 'menu' && (
                <div className="space-y-4">
                    <div className="glass-card-sm p-4 flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Select Vendor:</label>
                        <select value={adminMenuVendor} onChange={e => setAdminMenuVendor(e.target.value)} className="input-glass w-auto">
                            <option>The Craving Brew</option>
                            <option>GSR</option>
                            <option>Uniworld</option>
                        </select>
                    </div>
                    <MenuManager user={user} adminSelectedVendor={adminMenuVendor} />
                </div>
            )}
        </div>
    )
}

export default AdminDashboard
