const router = require("express").Router();
const Feedback = require("../models/Feedback");
const User = require("../models/User");

// Middleware: Check if user is Admin
const checkAdmin = async (req, res, next) => {
    const { userId } = req.query;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied: Admins Only" });
    }
    req.adminUser = user; // Attach admin user to request
    next();
};

// ============================================
// GET /api/admin/analytics
// Returns aggregated stats for TODAY (or a date range)
// ============================================
router.get("/analytics", checkAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Default to today if no dates provided
        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);

        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        // MongoDB Aggregation Pipeline
        const stats = await Feedback.aggregate([
            {
                $match: {
                    date: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: { mealType: "$mealType", vendorId: "$vendorId" },
                    count: { $sum: 1 },
                    avgQuality: { $avg: "$ratings.quality" },
                    avgHygiene: { $avg: "$ratings.hygiene" },
                    avgTaste: { $avg: "$ratings.taste" },
                    avgQuantity: { $avg: "$ratings.quantity" },
                    avgOverall: { $avg: "$ratings.overall" },
                },
            },
            {
                $sort: { "_id.vendorId": 1, "_id.mealType": 1 },
            },
        ]);

        res.json({
            dateRange: { start: start.toDateString(), end: end.toDateString() },
            stats,
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ============================================
// GET /api/admin/suggestions
// Returns all suggestions for a date range, grouped by meal and vendor
// ============================================
router.get("/suggestions", checkAdmin, async (req, res) => {
    try {
        const { startDate, endDate, vendorId } = req.query;

        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);

        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        const matchFilter = {
            date: { $gte: start, $lte: end },
            suggestion: { $exists: true, $ne: "" },
        };

        if (vendorId) matchFilter.vendorId = vendorId;

        const suggestions = await Feedback.find(matchFilter)
            .select("mealType vendorId suggestion date")
            .sort({ date: -1 });

        res.json({ suggestions });
    } catch (error) {
        console.error("Suggestions Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ============================================
// GET /api/admin/users
// List all users (for role management)
// ============================================
router.get("/users", checkAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select("name email role assignedVendor");
        res.json({ users });
    } catch (error) {
        console.error("Users Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ============================================
// PUT /api/admin/update-user
// Update a user's role or assignedVendor
// Admins can promote/demote other users
// ============================================
router.put("/update-user", checkAdmin, async (req, res) => {
    try {
        const { targetUserId, newRole, newVendor } = req.body;

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (newRole) {
            if (!["student", "admin", "vendor"].includes(newRole)) {
                return res.status(400).json({ message: "Invalid role" });
            }
            targetUser.role = newRole;
        }

        if (newVendor) {
            if (!["The Craving Brew", "GSR", "Uniworld"].includes(newVendor)) {
                return res.status(400).json({ message: "Invalid vendor" });
            }
            targetUser.assignedVendor = newVendor;
        }

        await targetUser.save();

        res.json({
            message: `Updated ${targetUser.name} successfully!`,
            user: targetUser,
        });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
