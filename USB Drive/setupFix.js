const { execSync } = require("child_process");
const fs = require("fs");

const runCommand = (command) => {
    try {
        console.log(`Executing: ${command}`);
        return execSync(command, { stdio: "inherit" });
    } catch (error) {
        console.error(`❌ Error executing: ${command}`);
    }
};

// Ensure node_modules exists
if (!fs.existsSync("./node_modules")) {
    console.log("⚠️ node_modules missing. Reinstalling dependencies...");
    runCommand("npm install");
}

// Ensure .env file exists
if (!fs.existsSync(".env")) {
    console.log("❌ .env file is missing! Create it.");
} else {
    console.log("✅ .env file found.");
}

// Check if MongoDB is running
runCommand("net start MongoDB");

// Restart server
console.log("🔄 Restarting server...");
runCommand("node server.js");
