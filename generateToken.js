require("dotenv").config();
const jwt = require("jsonwebtoken");

const payload = {
    id: 1,
    name: "Test User",
    email: "testuser@example.com"
};

const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

console.log("Your new JWT token:", token);
