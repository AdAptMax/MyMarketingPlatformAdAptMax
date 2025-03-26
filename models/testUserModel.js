require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/userModel");

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DBNAME}?retryWrites=true&w=majority`;

async function testUserModel() {
    try {
        // Connect to MongoDB
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log("✅ Connected to MongoDB");

        // Test creating a new user
        const newUser = new User({
            name: "John Doe",
            email: "john.doe@example.com",
            password: "password123",
        });

        // Save the user
        await newUser.save();

        console.log("✅ User created:", newUser);

        // Fetch the user to verify
        const user = await User.findOne({ email: "john.doe@example.com" });
        console.log("✅ User found:", user);

        // Disconnect after test
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// Run the test
testUserModel();
