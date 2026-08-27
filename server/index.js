const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const cors = require("cors");
const authRoutes = require("./routes/auth");
const feedbackRoutes = require("./routes/feedback");
const adminRoutes = require("./routes/admin");
const vendorRoutes = require("./routes/vendor");
const menuRoutes = require("./routes/menu"); // NEW

// Middleware to parse JSON & Allow Frontend to talk to Backend
app.use(express.json());

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ["http://localhost:5173", "http://localhost:5175", "http://localhost:5174"];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve the 'uploads' folder statically so images can be loaded by the frontend
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/menu", menuRoutes); // NEW

// Global Error Handler Middleware - Must be defined AFTER all routes
app.use((error, req, res, next) => {
    console.error("Global Error Handler:", error);

    // Default error response
    const status = error.status || error.statusCode || 500;
    const message = error.message || "An unexpected error occurred";
    const errorCode = error.errorCode || "INTERNAL_SERVER_ERROR";

    res.status(status).json({
        status: "error",
        message: message,
        errorCode: errorCode
    });
});

// 1. Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected!"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 2. The "Home Page" Route
app.get("/", (req, res) => {
    res.send("Hello! The Mess Feedback Server is running. 🚀");
});

// 2. Start the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});