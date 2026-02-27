import { useState, useEffect } from "react";
import MenuManager from "./MenuManager";

const AdminDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Invite form state
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("vendor");
    const [inviteVendor, setInviteVendor] = useState("The Craving Brew");
    const [inviteMsg, setInviteMsg] = useState("");

    // Admin menu management state
    const [adminMenuVendor, setAdminMenuVendor] = useState("The Craving Brew");

    const API = "http://localhost:5001/api/admin";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, suggestionsRes, usersRes] = await Promise.all([
                fetch(`${API}/analytics?userId=${user._id}`),
                fetch(`${API}/suggestions?userId=${user._id}`),
                fetch(`${API}/users?userId=${user._id}`),
            ]);

            const statsData = await statsRes.json();
            const suggestionsData = await suggestionsRes.json();
            const usersData = await usersRes.json();

            setStats(statsData.stats || []);
            setSuggestions(suggestionsData.suggestions || []);
            setUsers(usersData.users || []);
        } catch (error) {
            console.error("Dashboard Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (targetUserId, newRole) => {
        try {
            const res = await fetch(`${API}/update-user?userId=${user._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId, newRole }),
            });
            const data = await res.json();
            if (res.ok) {
                fetchData();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Role Update Error:", error);
        }
    };

    const handleVendorChange = async (targetUserId, newVendor) => {
        try {
            await fetch(`${API}/update-user?userId=${user._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId, newVendor }),
            });
            fetchData();
        } catch (error) {
            console.error("Vendor Update Error:", error);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviteMsg("");
        try {
            const res = await fetch(`${API}/invite-user?userId=${user._id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: inviteEmail,
                    role: inviteRole,
                    assignedVendor: inviteVendor,
                }),
            });
            const data = await res.json();
            setInviteMsg(data.message);
            if (res.ok) {
                setInviteEmail("");
                fetchData(); // Refresh user list
            }
        } catch (error) {
            setInviteMsg("Failed to invite user");
        }
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;

    const totalFeedbacks = stats.reduce((sum, s) => sum + s.count, 0);
    const avgOverall = stats.length > 0
        ? (stats.reduce((sum, s) => sum + s.avgOverall, 0) / stats.length).toFixed(1)
        : "–";

    return (
        <div>
            {/* Tabs */}
            <div className="tab-bar">
                <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
                <button className={`tab-btn ${activeTab === "suggestions" ? "active" : ""}`} onClick={() => setActiveTab("suggestions")}>Suggestions</button>
                <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>Users</button>
                <button className={`tab-btn ${activeTab === "menu" ? "active" : ""}`} onClick={() => setActiveTab("menu")}>Daily Menu</button>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
                <div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{totalFeedbacks}</div>
                            <div className="stat-label">Total Ratings Today</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{avgOverall}</div>
                            <div className="stat-label">Avg Overall Score</div>
                        </div>
                    </div>

                    {stats.length === 0 ? (
                        <div className="empty-state">No feedback data for today yet.</div>
                    ) : (
                        stats.map((s, i) => (
                            <div key={i} className="meal-section">
                                <h4>{s._id.mealType} — {s._id.vendorId} ({s.count} ratings)</h4>
                                <div className="rating-bar"><span className="rating-bar-label">Quality</span><span className="rating-bar-value">{s.avgQuality.toFixed(1)} / 5</span></div>
                                <div className="rating-bar"><span className="rating-bar-label">Hygiene</span><span className="rating-bar-value">{s.avgHygiene.toFixed(1)} / 5</span></div>
                                <div className="rating-bar"><span className="rating-bar-label">Taste</span><span className="rating-bar-value">{s.avgTaste.toFixed(1)} / 5</span></div>
                                <div className="rating-bar"><span className="rating-bar-label">Quantity</span><span className="rating-bar-value">{s.avgQuantity.toFixed(1)} / 5</span></div>
                                <div className="rating-bar"><span className="rating-bar-label">Overall</span><span className="rating-bar-value">{s.avgOverall.toFixed(1)} / 5</span></div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === "suggestions" && (
                <div>
                    <h3 className="section-title">Student Suggestions</h3>
                    {suggestions.length === 0 ? (
                        <div className="empty-state">No suggestions yet.</div>
                    ) : (
                        suggestions.map((s, i) => (
                            <div key={i} className="suggestion-item">
                                "{s.suggestion}"
                                <div className="suggestion-meta">{s.mealType} · {s.vendorId} · {new Date(s.date).toLocaleDateString()}</div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <div>
                    {/* Invite Form */}
                    <div style={{ marginBottom: "20px", padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                        <h3 className="section-title">Invite User</h3>
                        <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <input
                                type="text"
                                placeholder="Email address"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                            />
                            <div style={{ display: "flex", gap: "8px" }}>
                                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                                    <option value="vendor">Vendor</option>
                                    <option value="admin">Admin</option>
                                    <option value="student">Student</option>
                                </select>
                                <select value={inviteVendor} onChange={(e) => setInviteVendor(e.target.value)}>
                                    <option value="The Craving Brew">The Craving Brew</option>
                                    <option value="GSR">GSR</option>
                                    <option value="Uniworld">Uniworld</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary">Invite</button>
                            {inviteMsg && <p style={{ fontSize: "0.85rem", color: "var(--accent)" }}>{inviteMsg}</p>}
                        </form>
                    </div>

                    {/* User List */}
                    <h3 className="section-title">All Users ({users.length})</h3>
                    {users.map((u) => (
                        <div key={u._id} className="user-row">
                            <div className="user-row-info">
                                <div className="user-name">{u.name}</div>
                                <div className="user-email">{u.email}</div>
                            </div>
                            <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            >
                                <option value="student">Student</option>
                                <option value="admin">Admin</option>
                                <option value="vendor">Vendor</option>
                            </select>
                        </div>
                    ))}
                </div>
            )}

            {/* Menu Tab */}
            {activeTab === "menu" && (
                <div>
                    <div style={{ marginBottom: "16px", padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginRight: "8px" }}>Select Vendor to Manage:</label>
                        <select value={adminMenuVendor} onChange={(e) => setAdminMenuVendor(e.target.value)} style={{ width: "auto" }}>
                            <option value="The Craving Brew">The Craving Brew</option>
                            <option value="GSR">GSR</option>
                            <option value="Uniworld">Uniworld</option>
                        </select>
                    </div>
                    <MenuManager user={user} adminSelectedVendor={adminMenuVendor} />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
