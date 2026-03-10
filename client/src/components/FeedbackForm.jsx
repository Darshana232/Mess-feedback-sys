import { useState, useEffect } from "react";

const MEAL_ICONS = {
    Breakfast: "🌅",
    Lunch: "☀️",
    Snacks: "🍿",
    Dinner: "🌙",
};

const RATING_EMOJIS = ["😞", "😕", "😐", "😊", "🤩"];

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

    useEffect(() => {
        if (!user) return;

        const checkStatusAndMenu = async () => {
            try {
                const statusRes = await fetch(
                    `http://localhost:5001/api/feedback/status?userId=${user._id}&mealType=${mealType}`
                );
                const statusData = await statusRes.json();
                setHasRated(statusData.hasRated);

                const dateString = new Date().toISOString().split("T")[0];
                const menuRes = await fetch(
                    `http://localhost:5001/api/menu?vendorId=${user.assignedVendor}&date=${dateString}`
                );
                const menuData = await menuRes.json();
                const mealMenu = menuData.menus?.find((m) => m.mealType === mealType);
                setCurrentMenu(mealMenu || null);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        checkStatusAndMenu();
    }, [mealType, user]);

    const handleRatingChange = (category, value) => {
        setRatings((prev) => ({ ...prev, [category]: value }));
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
            <div className="feedback-success animate-scale">
                <div className="success-icon">🎉</div>
                <h3>Feedback Submitted!</h3>
                <p>
                    You've rated <strong>{mealType}</strong> today.
                    <br />
                    Thanks for helping improve the mess!
                </p>
                <button className="btn-secondary btn-sm" onClick={() => setHasRated(false)}>
                    Check other meals →
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <h2>Rate Your Meal</h2>
                <p>Your feedback helps improve the mess experience for everyone.</p>
            </div>

            <div className="feedback-form">
                {/* Meal Selector */}
                <div>
                    <div className="section-title">
                        <span className="title-dot"></span>
                        Select Meal
                    </div>
                    <div className="meal-pills">
                        {["Breakfast", "Lunch", "Snacks", "Dinner"].map((m) => (
                            <button
                                key={m}
                                className={`meal-pill ${mealType === m ? "active" : ""}`}
                                onClick={() => setMealType(m)}
                                type="button"
                            >
                                {MEAL_ICONS[m]} {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Today's Menu */}
                <div className="menu-display">
                    {currentMenu?.imageUrl && (
                        <img
                            className="menu-display-img"
                            src={`http://localhost:5001${currentMenu.imageUrl}`}
                            alt={`${mealType} Menu`}
                        />
                    )}
                    <div>
                        <div className="menu-display-title">
                            Today's {mealType} menu
                        </div>
                        {currentMenu ? (
                            <div className="menu-display-items">{currentMenu.items}</div>
                        ) : (
                            <div className="menu-display-empty">Menu not uploaded yet.</div>
                        )}
                    </div>
                </div>

                {/* Ratings */}
                <div>
                    <div className="section-title">
                        <span className="title-dot"></span>
                        Rate Each Aspect
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                            {Object.keys(ratings).map((category) => (
                                <div key={category} className="rating-category">
                                    <span className="rating-category-label">
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </span>
                                    <div className="star-row">
                                        {[1, 2, 3, 4, 5].map((val) => (
                                            <button
                                                key={val}
                                                type="button"
                                                className={`star-btn ${ratings[category] >= val ? "active" : ""}`}
                                                onClick={() => handleRatingChange(category, val)}
                                                title={`${val} star`}
                                            >
                                                {ratings[category] >= val ? "⭐" : "☆"}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="rating-value-badge">
                                        {ratings[category] > 0
                                            ? RATING_EMOJIS[ratings[category] - 1]
                                            : "—"}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Suggestion */}
                        <div className="section-title" style={{ marginBottom: "10px" }}>
                            <span className="title-dot"></span>
                            Suggestion
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>
                                (optional)
                            </span>
                        </div>
                        <div className="suggestion-wrap" style={{ marginBottom: "20px" }}>
                            <textarea
                                value={suggestion}
                                onChange={(e) => setSuggestion(e.target.value)}
                                placeholder="What could be improved? Any specific requests?"
                                maxLength={500}
                            />
                            <span className="char-count">{suggestion.length}/500</span>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || Object.values(ratings).some((r) => r === 0)}
                        >
                            {loading ? "Submitting..." : "Submit Feedback 🚀"}
                        </button>
                        {Object.values(ratings).some((r) => r === 0) && (
                            <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px" }}>
                                Please rate all categories
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeedbackForm;
