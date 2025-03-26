const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Function to execute terminal commands
const runCommand = (command) => {
    try {
        console.log(`Executing: ${command}`);
        execSync(command, { stdio: "inherit" });
    } catch (error) {
        console.error(`❌ Error executing: ${command}`);
    }
};

// ✅ 1. Check if Node.js is installed
try {
    const nodeVersion = execSync("node -v").toString().trim();
    console.log(`✅ Node.js Version Installed: ${nodeVersion}`);
} catch (error) {
    console.error("❌ Node.js is not installed. Please install it from https://nodejs.org/");
    process.exit(1);
}

// ✅ 2. Check if npm is installed
try {
    const npmVersion = execSync("npm -v").toString().trim();
    console.log(`✅ npm Version Installed: ${npmVersion}`);
} catch (error) {
    console.error("❌ npm is not installed. Please install it from https://nodejs.org/");
    process.exit(1);
}

// ✅ 3. Check for node_modules and reinstall if missing
if (!fs.existsSync("./node_modules")) {
    console.log("⚠️ node_modules missing. Reinstalling dependencies...");
    runCommand("npm install");
}

// ✅ 4. Ensure MongoDB is running
try {
    execSync("netstat -ano | findstr :27017", { stdio: "pipe" });
    console.log("✅ MongoDB is running.");
} catch (error) {
    console.error("❌ MongoDB is not running! Start MongoDB and try again.");
}

// ✅ 5. Check if .env file exists
if (!fs.existsSync(".env")) {
    console.error("❌ .env file missing! Please create it.");
} else {
    console.log("✅ .env file found.");
}

// ✅ 6. Check if server.js file exists
if (!fs.existsSync("server.js")) {
    console.error("❌ server.js not found!");
    process.exit(1);
}

// ✅ 7. Check for syntax errors in server.js
try {
    execSync("node --check server.js");
    console.log("✅ No syntax errors in server.js");
} catch (error) {
    console.error("❌ Syntax errors detected in server.js! Fix them and try again.");
    process.exit(1);
}

// ✅ 8. Restart the server
console.log("🔄 Restarting the server...");
runCommand("node server.js");
