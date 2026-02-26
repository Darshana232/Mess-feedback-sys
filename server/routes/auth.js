const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const COLLEGE_DOMAIN = "sst.scaler.com";

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

        // 2. Check if user exists — by googleId first, then by email (for invited users)
        let user = await User.findOne({ googleId });

        if (!user) {
            // Check if they were INVITED (pre-registered by admin with a placeholder googleId)
            user = await User.findOne({ email });

            if (user) {
                // Invited user logging in for the first time! Update their record.
                user.googleId = googleId;
                user.name = name; // Replace placeholder name with real Google name
                await user.save();
            }
        }

        if (user) {
            // EXISTING or INVITED user → Allow login
            return res.status(200).json({
                message: "Login Successful",
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    assignedVendor: user.assignedVendor,
                    picture: picture,
                },
            });
        }

        // 3. NEW USER → Only allow college emails to self-register
        const emailDomain = email.split("@")[1];
        if (emailDomain !== COLLEGE_DOMAIN) {
            return res.status(403).json({
                message: `Access Denied. Only @${COLLEGE_DOMAIN} students can self-register. If you're a vendor or admin, ask an existing admin to invite you.`,
            });
        }

        // 4. Create new student
        user = new User({
            googleId,
            name,
            email,
            assignedVendor: "The Craving Brew", // Default
            role: "student",
        });
        await user.save();

        res.status(200).json({
            message: "Login Successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                assignedVendor: user.assignedVendor,
                picture: picture,
            },
        });
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ message: "Authentication Failed" });
    }
});

module.exports = router;
