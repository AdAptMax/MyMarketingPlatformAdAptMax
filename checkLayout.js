const fs = require('fs');
const path = require('path');

// Define the required file/folder structure
const requiredStructure = [
    'aiIntegration.js',
    'models',  // Check if the 'models' folder exists
    'routes',  // Check if the 'routes' folder exists
    'server.js',
    'package.json'
];

// Check each required file/folder
const checkStructure = () => {
    let allFilesExist = true;

    requiredStructure.forEach(item => {
        const itemPath = path.join(__dirname, item);

        if (fs.existsSync(itemPath)) {
            console.log(`✅ Found: ${item}`);
        } else {
            console.log(`❌ Missing: ${item}`);
            allFilesExist = false;
        }
    });

    if (allFilesExist) {
        console.log("\nAll required files and folders are present.");
    } else {
        console.log("\nSome files or folders are missing. Please check the above logs.");
    }
};

// Run the check
checkStructure();
