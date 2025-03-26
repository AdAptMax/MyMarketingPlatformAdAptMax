const { execSync } = require("child_process");
const fs = require("fs");
const nodemailer = require("nodemailer");
const os = require("os");
const path = require("path");

// Configuration
const LOG_FILE = "healthCheck.log";
const ADMIN_EMAIL = "crcdot@gmail.com"; // Your email for reports
const BASE_URL = process.env.BASE_URL || "http://adaptmax.net";

// Execute terminal commands
const runCommand = (command) => {
    try {
        console.log(`Executing: ${command}`);
        return execSync(command, { stdio: "pipe" }).toString().trim();
    } catch (error) {
        logError(`Error executing: ${command} - ${error.message}`);
        return null;
    }
};

// Log errors to a file
const logError = (message) => {
    fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - ERROR: ${message}\n`);
};

// Check and fix system setup
const checkSystem = () => {
    console.log("🔍 Checking system health...");

    // Check Node.js
    const nodeVersion = runCommand("node -v");
    console.log(`✅ Node.js Version: ${nodeVersion}`);

    // Check npm
    const npmVersion = runCommand("npm -v");
    console.log(`✅ npm Version: ${npmVersion}`);

    // Check MongoDB Connection
    try {
        const mongoStatus = runCommand("netstat -ano | findstr :27017");
        if (!mongoStatus) {
            logError("❌ MongoDB is not running!");
            console.log("🚀 Starting MongoDB...");
            runCommand(`"C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe" --dbpath C:\\data\\db`);
        } else {
            console.log("✅ MongoDB is running.");
        }
    } catch (error) {
        logError("❌ MongoDB check failed!");
    }

    // Check for missing node_modules
    if (!fs.existsSync("./node_modules")) {
        console.log("⚠️ node_modules missing. Reinstalling dependencies...");
        runCommand("npm install");
    }

    // Check .env file
    if (!fs.existsSync(".env")) {
        logError("❌ .env file missing! Please create it.");
    } else {
        console.log("✅ .env file found.");
    }

    // Check server.js exists
    if (!fs.existsSync("server.js")) {
        logError("❌ server.js missing! The server cannot run without it.");
        process.exit(1);
    }

    console.log("✅ All essential components checked.");
};

// Send email report
const sendReport = async () => {
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "crcdot@gmail.com", // Your business email
            pass: "your-email-password", // Use an app-specific password if using Gmail
        },
    });

    let message = {
        from: "AdAptMax <crcdot@gmail.com>",
        to: ADMIN_EMAIL,
        subject: "📊 AdAptMax System Health Report",
        text: fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, "utf8") : "✅ No errors detected.",
    };

    try {
        await transporter.sendMail(message);
        console.log("✅ System health report sent successfully.");
    } catch (error) {
        logError("❌ Failed to send email report!");
    }
};

// Execute system checks and fixes
checkSystem();

// Restart the server
console.log("🔄 Restarting the server...");
runCommand("node server.js");

// Send system health report
sendReport();
