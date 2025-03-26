const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

// Path to the testUserModel.js file
const testFilePath = path.join(__dirname, 'testUserModel.js');

// Check if testUserModel.js exists
if (!fs.existsSync(testFilePath)) {
    console.log("❌ testUserModel.js not found! Creating the file...");

    // Create the testUserModel.js file
    const fileContent = `
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/userModel");

const uri = \`mongodb+srv://\${process.env.MONGO_USERNAME}:\${process.env.MONGO_PASSWORD}@\${process.env.MONGO_CLUSTER}/\${process.env.MONGO_DBNAME}?retryWrites=true&w=majority\`;

async function testUserModel() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ Connected to MongoDB");

        const newUser = new User({
            name: "John Doe",
            email: "john.doe@example.com",
            password: "password123",
        });

        await newUser.save();
        console.log("✅ User created:", newUser);

        const user = await User.findOne({ email: "john.doe@example.com" });
        console.log("✅ User found:", user);

        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testUserModel();
    `;

    // Create the file with the above content
    fs.writeFileSync(testFilePath, fileContent);
    console.log("✅ Created testUserModel.js file.");
} else {
    console.log("✅ testUserModel.js file already exists.");
}

// Install missing dependencies automatically if they are not installed
try {
    require('dotenv');
    require('mongoose');
    require('./models/userModel');  // Ensure the userModel is also required for testing
    console.log("✅ All required modules are installed.");
} catch (err) {
    console.log("❌ Missing required modules. Installing now...");

    try {
        // Install missing modules using npm
        execSync('npm install dotenv mongoose', { stdio: 'inherit' });
        console.log("✅ Installed required modules.");
    } catch (installErr) {
        console.error("❌ Error installing modules:", installErr);
    }
}

// Finally, run the script if everything is in order
console.log("Running testUserModel.js...");
execSync('node testUserModel.js', { stdio: 'inherit' });
