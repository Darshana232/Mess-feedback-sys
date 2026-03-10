import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Upload } from 'lucide-react'

const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Snacks: '🍿', Dinner: '🌙' }
const MEAL_GRADS = {
    Breakfast: 'from-amber-100 to-yellow-50',
    Lunch: 'from-orange-100 to-rose-50',
    Snacks: 'from-pink-100 to-fuchsia-50',
    Dinner: 'from-indigo-100 to-purple-50',
}

const MenuManager = ({ user, adminSelectedVendor = null }) => {
    const vendorToManage = user.role === 'vendor' ? user.assignedVendor : adminSelectedVendor

    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [menus, setMenus] = useState([])
    const [loading, setLoading] = useState(false)
    const [mealType, setMealType] = useState('Breakfast')
    const [items, setItems] = useState('')
    const [image, setImage] = useState(null)
    const [imageName, setImageName] = useState('')
    const [statusMsg, setStatusMsg] = useState('')
    const [statusOk, setStatusOk] = useState(true)

    const API = 'http://localhost:5001/api/menu'

    useEffect(() => { if (vendorToManage) fetchMenus() }, [date, vendorToManage])

    const fetchMenus = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API}?vendorId=${vendorToManage}&date=${date}`)
            const data = await res.json()
            setMenus(data.menus || [])
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setStatusMsg('Saving…')
        const fd = new FormData()
        fd.append('userId', user._id)
        fd.append('vendorId', vendorToManage)
        fd.append('date', date)
        fd.append('mealType', mealType)
        fd.append('items', items)
        if (image) fd.append('image', image)

        try {
            const res = await fetch(API, { method: 'POST', body: fd })
            const data = await res.json()
            if (res.ok) {
                setStatusMsg('Menu saved! ✅'); setStatusOk(true)
                setItems(''); setImage(null); setImageName('')
                e.target.reset(); fetchMenus()
            } else {
                setStatusMsg(data.message || 'Failed'); setStatusOk(false)
            }
        } catch { setStatusMsg('Server Error'); setStatusOk(false) }
    }

    if (!vendorToManage) return (
        <div className="glass-card p-16 text-center text-gray-400"><div className="text-4xl mb-3">🍽️</div>Select a vendor to manage their menu.</div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <ChefHatIcon /> Menu for <span className="text-purple-600">{vendorToManage}</span>
                </h3>
                <div className="flex items-center gap-2 bg-white border border-purple-100 rounded-full px-4 py-2">
                    <CalendarDays className="w-4 h-4 text-purple-400" />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="bg-transparent text-sm text-gray-700 outline-none" />
                </div>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSave} className="glass-card p-6 space-y-4">
                <h4 className="font-semibold text-gray-700 text-sm">Upload / Update Menu</h4>

                {/* Meal type tabs */}
                <div className="flex flex-wrap gap-2">
                    {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(m => (
                        <button type="button" key={m} onClick={() => setMealType(m)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border
                ${mealType === m ? 'bg-grad-primary text-white border-transparent shadow-btn' : 'bg-white border-purple-100 text-gray-500 hover:border-purple-300'}`}>
                            {MEAL_ICONS[m]} {m}
                        </button>
                    ))}
                </div>

                <input type="text" placeholder="e.g., Dal, Rice, Paneer, Roti" value={items}
                    onChange={e => setItems(e.target.value)} required className="input-glass" />

                {/* File drop zone */}
                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-purple-200 rounded-2xl p-6 cursor-pointer hover:border-purple-400 hover:bg-purple-50/40 transition-all">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={e => { const f = e.target.files[0]; if (f) { setImage(f); setImageName(f.name) } }} />
                    <Upload className="w-6 h-6 text-purple-300 mb-2" />
                    {imageName ? (
                        <span className="text-sm text-green-500 font-medium">📎 {imageName}</span>
                    ) : (
                        <span className="text-sm text-gray-400">Drop image here or <span className="text-purple-500 font-semibold">browse</span></span>
                    )}
                </label>

                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="btn-gradient w-full py-3">
                    Save Menu 💾
                </motion.button>
                {statusMsg && (
                    <p className={`text-sm text-center font-medium ${statusOk ? 'text-green-500' : 'text-red-400'}`}>{statusMsg}</p>
                )}
            </form>

            {/* Preview */}
            <div>
                <h4 className="font-semibold text-gray-600 text-sm mb-4">
                    Preview — {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h4>
                {loading ? (
                    <div className="flex items-center justify-center gap-3 py-10 text-gray-400">
                        <svg className="animate-spin w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                        </svg> Loading…
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => {
                            const menu = menus.find(m => m.mealType === meal)
                            if (!menu) return null
                            return (
                                <motion.div key={meal} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(139,92,246,0.2)' }}
                                    className={`glass-card-sm p-4 bg-gradient-to-br ${MEAL_GRADS[meal]} flex gap-3 items-start`}>
                                    {menu.imageUrl ? (
                                        <img src={`http://localhost:5001${menu.imageUrl}`} alt={meal}
                                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-xl bg-white/60 flex items-center justify-center text-3xl flex-shrink-0">{MEAL_ICONS[meal]}</div>
                                    )}
                                    <div>
                                        <div className="text-xs font-bold text-purple-500 uppercase tracking-wide mb-1">{meal}</div>
                                        <div className="text-sm text-gray-600 leading-relaxed">{menu.items}</div>
                                    </div>
                                </motion.div>
                            )
                        })}
                        {menus.length === 0 && (
                            <div className="glass-card col-span-2 p-12 text-center text-gray-400">
                                <div className="text-4xl mb-3">📋</div>No menus uploaded for this date.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// inline ChefHat placeholder icon
const ChefHatIcon = () => (
    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4zm0 0V3m0 11v7" />
    </svg>
)

export default MenuManager
