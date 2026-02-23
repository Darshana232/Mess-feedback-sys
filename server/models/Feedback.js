const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Links this feedback to a specific student
        required: true,
    },
    vendorId: {
        type: String,
        required: true,
    },
    mealType: {
        type: String,
        enum: ["Breakfast", "Lunch", "Dinner"],
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    ratings: {
        quality: { type: Number, required: true, min: 1, max: 5 },
        hygiene: { type: Number, required: true, min: 1, max: 5 },
        quantity: { type: Number, required: true, min: 1, max: 5 },
        taste: { type: Number, required: true, min: 1, max: 5 },
        overall: { type: Number, required: true, min: 1, max: 5 },
    },
    suggestion: {
        type: String,
        maxlength: 500, // Limit suggestions to 500 characters
    },
});

// Compound Index: A user can only rate ONCE per meal per day
// This prevents spam! 🛑
FeedbackSchema.index({ userId: 1, mealType: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", FeedbackSchema);
