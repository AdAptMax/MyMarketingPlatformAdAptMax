require("dotenv").config();
const mongoose = require("mongoose");

const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DBNAME}?retryWrites=true&w=majority`;

async function testMongoConnection() {
    try {
        // Connect to MongoDB
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log("✅ MongoDB connection successful!");

        // Close the connection after the test
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
    }
}



