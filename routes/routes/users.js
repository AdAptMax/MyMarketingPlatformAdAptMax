const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");  // Required for JWT token
const mongoose = require("mongoose");
const User = require("../../models/models/userModel"); // Correct path to User model
const router = express.Router();

// 🔹 Create a new user (POST)
router.post("/", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 🔹 Validate input fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        // 🔹 Password strength validation using regex
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[a-z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters, include one uppercase letter, one lowercase letter, and one number."
            });
        }

        // 🔹 Check if user already exists by email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // 🔹 Hash the password before saving it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🔹 Create the new user in the database
        const newUser = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({
            message: "User created successfully!",
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error("❌ Error in POST /users:", error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
});

// 🔹 Login Route (POST /login) - Authenticates the user and generates JWT token
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 🔹 Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" });
        }

        // 🔹 Check if the user exists by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        // 🔹 Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        // 🔹 Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        // 🔹 Send back the token
        res.status(200).json({ message: "Login successful!", token });
    } catch (error) {
        console.error("❌ Error in POST /login:", error);
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
});

// 🔹 Get all users (GET)
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude password from the response
        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error in GET /users:", error);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
});

// 🔹 Delete a user (DELETE)
router.delete("/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        // ✅ Ensure ID is a valid MongoDB ObjectId before deleting
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID!" });
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
        console.error("❌ Error in DELETE /users/:id:", error);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
});

module.exports = router;
