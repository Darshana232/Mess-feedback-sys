/**
 * Seed Script - Development Helper 🌱
 * 
 * Usage:
 *   node seed.js make-admin <email>       → Promotes a user to admin
 *   node seed.js add-test-data            → Inserts sample feedback for today
 * 
 * Example:
 *   node seed.js make-admin darshana@sst.scaler.com
 *   node seed.js add-test-data
 */

const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Feedback = require("./models/Feedback");

// 1. Connect to the database
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
        console.error("❌ Connection Error:", err.message);
        process.exit(1);
    });

// --- Command: make-admin ---
async function makeAdmin(email) {
    const user = await User.findOne({ email });
    if (!user) {
        console.log(`❌ No user found with email: ${email}`);
        console.log("   (They need to log in at least once first!)");
        return;
    }

    user.role = "admin";
    await user.save();
    console.log(`✅ ${user.name} (${user.email}) is now an ADMIN!`);
}

// --- Command: add-test-data ---
async function addTestData() {
    const users = await User.find({});
    if (users.length === 0) {
        console.log("❌ No users in the database. Log in first!");
        return;
    }

    const testUser = users[0];
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const meals = ["Breakfast", "Lunch", "Dinner"];
    const vendors = ["The Craving Brew", "GSR", "Uniworld"];

    let count = 0;

    for (const meal of meals) {
        for (const vendor of vendors) {
            try {
                const feedback = new Feedback({
                    userId: testUser._id,
                    vendorId: vendor,
                    mealType: meal,
                    date: today,
                    ratings: {
                        quality: Math.floor(Math.random() * 5) + 1,
                        hygiene: Math.floor(Math.random() * 5) + 1,
                        quantity: Math.floor(Math.random() * 5) + 1,
                        taste: Math.floor(Math.random() * 5) + 1,
                        overall: Math.floor(Math.random() * 5) + 1,
                    },
                    suggestion: `Test suggestion for ${meal} at ${vendor}`,
                });
                await feedback.save();
                count++;
                console.log(`  ✅ Added: ${meal} → ${vendor}`);
            } catch (err) {
                console.log(`  ⚠️  Skipped: ${meal} → ${vendor} (already exists)`);
            }
        }
    }

    console.log(`\n🎉 Done! Added ${count} test feedback entries.`);
}

// --- Main ---
async function main() {
    const command = process.argv[2];
    const arg = process.argv[3];

    switch (command) {
        case "make-admin":
            if (!arg) {
                console.log("Usage: node seed.js make-admin <email>");
                break;
            }
            await makeAdmin(arg);
            break;

        case "add-test-data":
            await addTestData();
            break;

        default:
            console.log("🌱 Seed Script - Available Commands:");
            console.log("   node seed.js make-admin <email>");
            console.log("   node seed.js add-test-data");
    }

    mongoose.disconnect();
}

main();
