const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    vendorId: {
        type: String,
        enum: ["The Craving Brew", "GSR", "Uniworld"],
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    mealType: {
        type: String,
        enum: ["Breakfast", "Lunch", "Snacks", "Dinner"],
        required: true,
    },
    items: {
        type: String, // Comma separated items or a descriptive paragraph
        required: true,
    },
    imageUrl: {
        type: String,
        default: "", // URL to the uploaded image
    }
});

// A unique index to ensure only one menu per vendor per meal per day
menuSchema.index({ vendorId: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model("Menu", menuSchema);
