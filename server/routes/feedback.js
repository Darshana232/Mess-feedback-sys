const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const User = require("../models/User");

// GET /api/feedback/status
// Check if a user has ALREADY rated a specific meal on a specific date
router.get("/status", async (req, res) => {
    try {
        const { userId, mealType, date } = req.query;

        if (!userId || !mealType) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Convert date string to a Date object range (start of day to end of day)
        // For simplicity in this learning step, we'll just check if a record exists for this User + Meal combination
        // In production, we'd filter by Date properly.

        // Simple check: Has this user rated this meal?
        // We are relying on the unique index we created in the Model to eventually handle day-by-day stuff,
        // but for now, let's just see if ANY record exists for today.

        // Note: To make this robust for "Today", we need date logic.
        // Let's keep it simple: The frontend will ask "Has User X rated Lunch today?"

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const existingFeedback = await Feedback.findOne({
            userId: userId,
            mealType: mealType,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingFeedback) {
            return res.json({ hasRated: true });
        } else {
            return res.json({ hasRated: false });
        }

    } catch (error) {
        console.error("Error checking status:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST /api/feedback/submit
// Save a new rating
router.post("/submit", async (req, res) => {
    try {
        const { userId, vendorId, mealType, ratings, suggestion } = req.body;

        // 1. Double Check: Did they already rate? (Backend validation is crucial!)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const existing = await Feedback.findOne({
            userId,
            mealType,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existing) {
            return res.status(400).json({ message: "You have already rated this meal today!" });
        }

        // 2. Create the Feedback
        const newFeedback = new Feedback({
            userId,
            vendorId,
            mealType,
            ratings,
            suggestion,
            date: new Date() // Sets to "now"
        });

        await newFeedback.save();

        res.status(201).json({ message: "Feedback submitted successfully! 🌟" });

    } catch (error) {
        console.error("Submit Error:", error);
        res.status(500).json({ message: "Failed to submit feedback" });
    }
});

module.exports = router;
