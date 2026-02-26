const router = require("express").Router();
const Feedback = require("../models/Feedback");
const User = require("../models/User");

// Middleware: Check if user is a Vendor
const checkVendor = async (req, res, next) => {
    const { userId } = req.query;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user || user.role !== "vendor") {
        return res.status(403).json({ message: "Access Denied: Vendors Only" });
    }
    req.vendorUser = user; // Attach vendor user to request
    next();
};

// ============================================
// GET /api/vendor/my-analytics
// Returns aggregated stats for the vendor's OWN mess only
// ============================================
router.get("/my-analytics", checkVendor, async (req, res) => {
    try {
        const vendorName = req.vendorUser.assignedVendor;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);

        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        const stats = await Feedback.aggregate([
            {
                $match: {
                    vendorId: vendorName, // Only THIS vendor's data
                    date: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: "$mealType",
                    count: { $sum: 1 },
                    avgQuality: { $avg: "$ratings.quality" },
                    avgHygiene: { $avg: "$ratings.hygiene" },
                    avgTaste: { $avg: "$ratings.taste" },
                    avgQuantity: { $avg: "$ratings.quantity" },
                    avgOverall: { $avg: "$ratings.overall" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            vendor: vendorName,
            dateRange: { start: start.toDateString(), end: end.toDateString() },
            stats,
        });
    } catch (error) {
        console.error("Vendor Analytics Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ============================================
// GET /api/vendor/my-suggestions
// Returns all suggestions for the vendor's OWN mess only
// ============================================
router.get("/my-suggestions", checkVendor, async (req, res) => {
    try {
        const vendorName = req.vendorUser.assignedVendor;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);

        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        const suggestions = await Feedback.find({
            vendorId: vendorName,
            date: { $gte: start, $lte: end },
            suggestion: { $exists: true, $ne: "" },
        })
            .select("mealType suggestion date")
            .sort({ date: -1 });

        res.json({
            vendor: vendorName,
            suggestions,
        });
    } catch (error) {
        console.error("Vendor Suggestions Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
