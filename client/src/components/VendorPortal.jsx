import { useState, useEffect } from "react";

const VendorPortal = ({ user }) => {
    const [activeTab, setActiveTab] = useState("scores");
    const [stats, setStats] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const API = "http://localhost:5001/api/vendor";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsRes, suggestionsRes] = await Promise.all([
                    fetch(`${API}/my-analytics?userId=${user._id}`),
                    fetch(`${API}/my-suggestions?userId=${user._id}`),
                ]);

                const statsData = await statsRes.json();
                const suggestionsData = await suggestionsRes.json();

                setStats(statsData.stats || []);
                setSuggestions(suggestionsData.suggestions || []);
            } catch (error) {
                console.error("Vendor Portal Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="loading">Loading your data...</div>;

    const totalFeedbacks = stats.reduce((sum, s) => sum + s.count, 0);

    return (
        <div>
            {/* Tabs */}
            <div className="tab-bar">
                <button className={`tab-btn ${activeTab === "scores" ? "active" : ""}`} onClick={() => setActiveTab("scores")}>Scores</button>
                <button className={`tab-btn ${activeTab === "suggestions" ? "active" : ""}`} onClick={() => setActiveTab("suggestions")}>Suggestions</button>
            </div>

            {/* Scores Tab */}
            {activeTab === "scores" && (
                <div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{totalFeedbacks}</div>
                            <div className="stat-label">Ratings Today</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.length}</div>
                            <div className="stat-label">Meals Rated</div>
                        </div>
                    </div>

                    {stats.length === 0 ? (
                        <div className="empty-state">No ratings for your mess today.</div>
                    ) : (
                        stats.map((s, i) => (
                            <div key={i} className="meal-section">
                                <h4>{s._id} ({s.count} ratings)</h4>
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
                                <div className="suggestion-meta">{s.mealType} · {new Date(s.date).toLocaleDateString()}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default VendorPortal;
