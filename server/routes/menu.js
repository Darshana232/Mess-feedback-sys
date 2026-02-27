const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Menu = require("../models/Menu");
const User = require("../models/User");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save files to 'uploads' folder
    },
    filename: function (req, file, cb) {
        // Unique filename: fieldname-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware: Check if user is Admin or Vendor
const checkAdminOrVendor = async (req, res, next) => {
    try {
        const { userId } = req.body.userId ? req.body : req.query; // Could be in body or query depending on FormData vs JSON
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const user = await User.findById(userId);
        if (!user || (user.role !== "admin" && user.role !== "vendor")) {
            return res.status(403).json({ message: "Access Denied: Admins/Vendors Only" });
        }
        req.authorizedUser = user;
        next();
    } catch (error) {
        res.status(500).json({ message: "Auth Error" });
    }
};

// ============================================
// GET /api/menu
// Fetch today's menu for a specific vendor
// ============================================
router.get("/", async (req, res) => {
    try {
        const { vendorId, date } = req.query;
        if (!vendorId) return res.status(400).json({ message: "Vendor ID is required" });

        const queryDate = date ? new Date(date) : new Date();
        const start = new Date(queryDate.setHours(0, 0, 0, 0));
        const end = new Date(queryDate.setHours(23, 59, 59, 999));

        const menus = await Menu.find({
            vendorId,
            date: { $gte: start, $lte: end },
        });

        res.json({ menus });
    } catch (error) {
        console.error("Menu GET Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ============================================
// POST /api/menu
// Create or Update a menu
// Uses multer for 'image' field
// ============================================
router.post("/", upload.single("image"), checkAdminOrVendor, async (req, res) => {
    try {
        const { vendorId, date, mealType, items } = req.body;

        // If the user is a vendor, they can only upload to their own vendorId
        if (req.authorizedUser.role === "vendor" && req.authorizedUser.assignedVendor !== vendorId) {
            return res.status(403).json({ message: "You can only update your own Menu" });
        }

        const menuDate = new Date(date);
        menuDate.setHours(0, 0, 0, 0);

        // Prepare the menu payload
        const updateData = { items };

        // If an image was uploaded, create the URL path
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Upsert: update if it exists, insert if it doesn't
        const menu = await Menu.findOneAndUpdate(
            { vendorId, date: menuDate, mealType }, // Find condition
            { $set: updateData }, // What to update
            { new: true, upsert: true } // Return new doc, create if missing
        );

        res.json({ message: "Menu saved successfully!", menu });
    } catch (error) {
        console.error("Menu POST Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
