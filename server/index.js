const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const cors = require("cors");
const authRoutes = require("./routes/auth");
const feedbackRoutes = require("./routes/feedback");
const adminRoutes = require("./routes/admin");
const vendorRoutes = require("./routes/vendor");

// Middleware to parse JSON & Allow Frontend to talk to Backend
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5175", "http://localhost:5174"] }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);

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