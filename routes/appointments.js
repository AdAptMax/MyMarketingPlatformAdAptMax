
// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

// Create Express app
const app = express();

// ✅ Middleware (Place this before routes!)
app.use(cors());
app.use(express.json()); // Allows API to accept JSON requests

// ✅ MongoDB Connection
const username = encodeURIComponent("marketingbus"); // Your MongoDB username
const password = encodeURIComponent("Jesus2000"); // Your MongoDB password
const cluster = "marketingbus.jtxow.mongodb.net"; // Your MongoDB cluster address
const dbName = "MarketingBus"; // Your database name

const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Stop server if DB connection fails
  });

// ✅ Include Appointment Routes (Middleware)
const appointmentRoutes = require("./routes/appointments");
app.use("/appointments", appointmentRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running and connected to MongoDB!");
});

// ✅ Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
