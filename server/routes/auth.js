const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

// Initialize the Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Allowed college email domain
const ALLOWED_DOMAIN = "sst.scaler.com";

router.post("/google", async (req, res) => {
    try {
        const { token } = req.body;

        // 1. Verify the token with Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const { sub: googleId, email, name, picture } = payload;

        // 2. Check if email belongs to the college
        const emailDomain = email.split("@")[1];
        if (emailDomain !== ALLOWED_DOMAIN) {
            return res.status(403).json({
                message: `Access Denied: Only @${ALLOWED_DOMAIN} emails are allowed.`,
            });
        }

        // 3. Check if user exists in our DB
        let user = await User.findOne({ googleId });

        if (!user) {
            // 4. If not, create a new user
            user = new User({
                googleId,
                name,
                email,
                picture,
                assignedVendor: "The Craving Brew", // Default. Can be changed by admin later.
                role: "student",
            });
            await user.save();
        }

        // 5. Send success response
        res.status(200).json({
            message: "Login Successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                assignedVendor: user.assignedVendor,
                picture: picture, // Always send latest picture from Google
            },
        });
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ message: "Authentication Failed" });
    }
});

module.exports = router;
