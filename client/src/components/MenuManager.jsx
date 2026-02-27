import { useState, useEffect } from "react";

const MenuManager = ({ user, adminSelectedVendor = null }) => {
    // If user is vendor, use their assigned vendor. If admin, use the selected one from the dropdown.
    const vendorToManage = user.role === "vendor" ? user.assignedVendor : adminSelectedVendor;

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [mealType, setMealType] = useState("Breakfast");
    const [items, setItems] = useState("");
    const [image, setImage] = useState(null);
    const [statusMsg, setStatusMsg] = useState("");

    const API = "http://localhost:5001/api/menu";

    useEffect(() => {
        if (vendorToManage) {
            fetchMenus();
        }
    }, [date, vendorToManage]);

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}?vendorId=${vendorToManage}&date=${date}`);
            const data = await res.json();
            setMenus(data.menus || []);
        } catch (error) {
            console.error("Fetch Menus Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMenu = async (e) => {
        e.preventDefault();
        setStatusMsg("Saving...");

        // We MUST use FormData when sending files
        const formData = new FormData();
        formData.append("userId", user._id); // Needed for auth
        formData.append("vendorId", vendorToManage);
        formData.append("date", date);
        formData.append("mealType", mealType);
        formData.append("items", items);
        if (image) {
            formData.append("image", image);
        }

        try {
            const res = await fetch(API, {
                method: "POST",
                body: formData, // Notice: No Content-Type header! Browser sets it automatically with boundary string for FormData
            });
            const data = await res.json();

            if (res.ok) {
                setStatusMsg("Menu saved successfully! ✅");
                setItems("");
                setImage(null);
                e.target.reset(); // clear file input
                fetchMenus(); // refresh list
            } else {
                setStatusMsg(data.message || "Failed to save");
            }
        } catch (error) {
            console.error("Save Menu Error:", error);
            setStatusMsg("Server Error");
        }
    };

    // Helper to find today's menu for a specific meal
    const getMenuForMeal = (meal) => menus.find(m => m.mealType === meal);

    if (!vendorToManage) {
        return <div className="empty-state">Please select a vendor to manage their menu.</div>;
    }

    return (
        <div className="menu-manager">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 className="section-title">Manage Menu for {vendorToManage}</h3>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ width: "auto", padding: "6px 12px" }}
                />
            </div>

            {/* Upload Form */}
            <div className="card" style={{ marginBottom: "24px", padding: "20px", background: "var(--bg)", boxShadow: "none" }}>
                <form onSubmit={handleSaveMenu} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Meal Type</label>
                            <select value={mealType} onChange={(e) => setMealType(e.target.value)} required>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Dinner">Dinner</option>
                            </select>
                        </div>
                        <div style={{ flex: 2 }}>
                            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Menu Items (comma separated)</label>
                            <input
                                type="text"
                                placeholder="e.g., Dal, Rice, Paneer, Roti"
                                value={items}
                                onChange={(e) => setItems(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                            Menu Image (Optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            style={{ padding: "8px", background: "white", borderRadius: "8px", width: "100%", border: "1px solid var(--border)" }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: "8px" }}>Save Menu</button>
                    {statusMsg && <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--accent)", marginTop: "8px", fontWeight: "600" }}>{statusMsg}</div>}
                </form>
            </div>

            {/* Preview Section */}
            <h3 className="section-title">Menu Preview for {new Date(date).toLocaleDateString()}</h3>
            {loading ? <div className="loading">Loading...</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {["Breakfast", "Lunch", "Snacks", "Dinner"].map(meal => {
                        const menu = getMenuForMeal(meal);
                        if (!menu) return null;
                        return (
                            <div key={meal} style={{ padding: "16px", background: "white", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", display: "flex", gap: "16px" }}>
                                {menu.imageUrl && (
                                    <img
                                        src={`http://localhost:5001${menu.imageUrl}`}
                                        alt={`${meal} Menu`}
                                        style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                )}
                                <div>
                                    <h4 style={{ color: "var(--text)", marginBottom: "4px", fontSize: "1rem" }}>{meal}</h4>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.4" }}>{menu.items}</p>
                                </div>
                            </div>
                        );
                    })}
                    {menus.length === 0 && <div className="empty-state">No menus uploaded for this date.</div>}
                </div>
            )}
        </div>
    );
};

export default MenuManager;
