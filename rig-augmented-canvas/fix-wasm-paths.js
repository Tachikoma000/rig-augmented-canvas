/**
 * This script modifies the main.js file to use the correct paths for WebAssembly files
 * when the plugin is installed via BRAT.
 * 
 * It replaces all occurrences of "../../pkg/" with "./pkg/" in the main.js file.
 */

const fs = require('fs');
const path = require('path');

// Path to the main.js file
const mainJsPath = path.join(__dirname, 'main.js');

// Read the main.js file
fs.readFile(mainJsPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading main.js:', err);
    return;
  }

  // Replace all occurrences of "../../pkg/" with "./pkg/"
  const modifiedData = data.replace(/\.\.\/\.\.\/pkg\//g, './pkg/');

  // Write the modified content back to the file
  fs.writeFile(mainJsPath, modifiedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing main.js:', err);
      return;
    }
    console.log('Successfully updated WebAssembly paths in main.js');
  });
});
