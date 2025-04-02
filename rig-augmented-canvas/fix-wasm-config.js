/**
 * This script modifies the main.js file to:
 * 1. Use the correct paths for WebAssembly files when the plugin is installed via BRAT
 * 2. Fix the ModelConfig serialization issue by ensuring the provider field is included
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
  let modifiedData = data.replace(/\.\.\/\.\.\/pkg\//g, './pkg/');

  // Fix the ModelConfig serialization issue
  // Look for the update_model_config call and ensure the provider field is included
  modifiedData = modifiedData.replace(
    /await this\.wasmModule\.update_model_config\(JSON\.stringify\(config\)\)/g,
    `// Ensure provider field is included in the config
    if (!config.provider) {
      config.provider = 0; // 0 corresponds to ModelProvider.OpenAI
    }
    await this.wasmModule.update_model_config(JSON.stringify(config))`
  );

  // Write the modified content back to the file
  fs.writeFile(mainJsPath, modifiedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing main.js:', err);
      return;
    }
    console.log('Successfully updated WebAssembly paths and fixed ModelConfig serialization in main.js');
  });
});
