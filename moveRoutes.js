const fs = require('fs');
const path = require('path');

// Define paths
const currentPath = path.join(__dirname, 'paymentRoutes.js'); // Adjust the path if your file is elsewhere
const referralPath = path.join(__dirname, 'referralRoutes.js'); // Same here for referralRoutes.js
const routesFolderPath = path.join(__dirname, 'routes');

// Function to move files
const moveFile = (sourcePath, destinationPath) => {
  fs.rename(sourcePath, destinationPath, (err) => {
    if (err) {
      console.error(`Error moving file ${sourcePath}: ${err.message}`);
    } else {
      console.log(`Successfully moved ${sourcePath} to ${destinationPath}`);
    }
  });
};

// Check if routes folder exists
if (!fs.existsSync(routesFolderPath)) {
  console.log(`Routes folder not found. Creating 'routes' folder...`);
  fs.mkdirSync(routesFolderPath);
}

// Move the paymentRoutes.js to routes folder
moveFile(currentPath, path.join(routesFolderPath, 'paymentRoutes.js'));

// Move the referralRoutes.js to routes folder
moveFile(referralPath, path.join(routesFolderPath, 'referralRoutes.js'));
