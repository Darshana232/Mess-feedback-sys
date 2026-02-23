import { useState, useEffect } from "react";

const FeedbackForm = ({ user }) => {
    const [mealType, setMealType] = useState("Lunch"); // Default to Lunch
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

    // Check if already rated when Meal Type changes
    useEffect(() => {
        if (!user) return;

        const checkStatus = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5001/api/feedback/status?userId=${user._id}&mealType=${mealType}`
                );
                const data = await response.json();
                setHasRated(data.hasRated);
            } catch (error) {
                console.error("Error checking status:", error);
            }
        };

        checkStatus();
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
            <h3>Rate Your Meal 🍲</h3>

            <div className="form-group">
                <label>Select Meal:</label>
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                </select>
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

                <button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Feedback 🚀"}
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;
