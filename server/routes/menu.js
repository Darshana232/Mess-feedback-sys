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

// File filter to validate only image files are uploaded
const fileFilter = (req, file, cb) => {
    // Only allow image MIME types
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Only image files are allowed. Received: ${file.mimetype}`), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
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
    // Handle multer file validation errors
    if (req.fileValidationError) {
        return res.status(400).json({
            status: "error",
            message: req.fileValidationError,
            errorCode: "FILE_VALIDATION_ERROR"
        });
    }

    try {
        const { vendorId, date, mealType, items } = req.body;

        // If the user is a vendor, they can only upload to their own vendorId
        if (req.authorizedUser.role === "vendor" && req.authorizedUser.assignedVendor !== vendorId) {
            return res.status(403).json({
                status: "error",
                message: "You can only update your own Menu",
                errorCode: "UNAUTHORIZED_VENDOR"
            });
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

        res.json({
            status: "success",
            message: "Menu saved successfully!",
            menu
        });
    } catch (error) {
        console.error("Menu POST Error:", error);
        res.status(500).json({
            status: "error",
            message: "Server Error",
            errorCode: "MENU_SAVE_ERROR"
        });
    }
}, (error, req, res, next) => {
    // Multer error handler middleware
    if (error instanceof multer.MulterError) {
        if (error.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({
                status: "error",
                message: "File size exceeds 5MB limit",
                errorCode: "FILE_TOO_LARGE"
            });
        }
    } else if (error) {
        return res.status(400).json({
            status: "error",
            message: error.message || "File upload validation failed",
            errorCode: "FILE_VALIDATION_ERROR"
        });
    }
    next(error);
});

module.exports = router;
