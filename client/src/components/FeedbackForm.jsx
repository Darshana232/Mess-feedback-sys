import { useState, useEffect } from "react";

const FeedbackForm = ({ user }) => {
    const [mealType, setMealType] = useState("Breakfast");
    const [ratings, setRatings] = useState({
        quality: 0,
        hygiene: 0,
        quantity: 0,
        taste: 0,
        overall: 0,
    });
    const [suggestion, setSuggestion] = useState("");
    const [hasRated, setHasRated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentMenu, setCurrentMenu] = useState(null);

    // Check if already rated and fetch menu when Meal Type changes
    useEffect(() => {
        if (!user) return;

        const checkStatusAndMenu = async () => {
            try {
                // 1. Check if rated
                const statusRes = await fetch(
                    `http://localhost:5001/api/feedback/status?userId=${user._id}&mealType=${mealType}`
                );
                const statusData = await statusRes.json();
                setHasRated(statusData.hasRated);

                // 2. Fetch today's menu for this vendor
                const dateString = new Date().toISOString().split('T')[0];
                const menuRes = await fetch(
                    `http://localhost:5001/api/menu?vendorId=${user.assignedVendor}&date=${dateString}`
                );
                const menuData = await menuRes.json();

                // Find the specific menu for the selected mealType
                const mealMenu = menuData.menus?.find(m => m.mealType === mealType);
                setCurrentMenu(mealMenu || null);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        checkStatusAndMenu();
    }, [mealType, user]);

    const handleRatingChange = (category, value) => {
        setRatings((prev) => ({ ...prev, [category]: Number(value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5001/api/feedback/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user._id,
                    vendorId: user.assignedVendor,
                    mealType,
                    ratings,
                    suggestion,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Feedback Submitted! 🌟");
                setHasRated(true);
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Submit Error:", error);
            alert("Failed to submit.");
        } finally {
            setLoading(false);
        }
    };

    if (hasRated) {
        return (
            <div className="feedback-form submitted">
                <h3>✅ Feedback Submitted!</h3>
                <p>You have already rated <strong>{mealType}</strong> today.</p>
                <p>Thanks for helping improving the mess!</p>
                <button onClick={() => setHasRated(false)}>Check other meals</button>
            </div>
        );
    }

    return (
        <div className="feedback-form">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Rate Your Meal 🍲</h3>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                    {user.assignedVendor}
                </span>
            </div>

            <div className="form-group">
                <label>Select Meal:</label>
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Dinner">Dinner</option>
                </select>
            </div>

            {/* Menu Display Section */}
            <div style={{
                background: "var(--bg)",
                padding: "16px",
                borderRadius: "var(--radius-sm)",
                marginBottom: "8px",
                border: "1px solid var(--border)"
            }}>
                <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                    Today's {mealType} Menu
                </h4>
                {currentMenu ? (
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        {currentMenu.imageUrl && (
                            <img
                                src={`http://localhost:5001${currentMenu.imageUrl}`}
                                alt={`${mealType} Menu`}
                                style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                            />
                        )}
                        <p style={{ fontSize: "0.95rem", lineHeight: "1.5", margin: 0 }}>
                            {currentMenu.items}
                        </p>
                    </div>
                ) : (
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic", margin: 0 }}>
                        Menu not uploaded yet.
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                {Object.keys(ratings).map((category) => (
                    <div key={category} className="rating-row">
                        <label>{category.charAt(0).toUpperCase() + category.slice(1)}:</label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={ratings[category]}
                            onChange={(e) => handleRatingChange(category, e.target.value)}
                        />
                        <span>{ratings[category]} ⭐</span>
                    </div>
                ))}

                <div className="form-group">
                    <label>Suggestion (Optional):</label>
                    <textarea
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        placeholder="Any specific feedback?"
                        maxLength="500"
                    />
                </div>

                <div style={{ marginTop: "16px" }}>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Feedback 🚀"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FeedbackForm;
