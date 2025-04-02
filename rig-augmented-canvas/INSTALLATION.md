# Installation Guide for Rig Augmented Canvas

This guide will walk you through installing the Rig Augmented Canvas plugin for Obsidian using BRAT (Beta Reviewer's Auto-update Tool).

> **Video Guides Available**: For visual learners, we've created video tutorials that demonstrate the [installation process](guides/installing_via_brat.mp4) and [setting up your API key](guides/settings_use.mp4). You can find these videos in the README.md file.

## Installing BRAT

1. Open Obsidian
2. Click on Settings (the gear icon in the left sidebar)
3. Go to "Community plugins" tab
4. Click "Browse" to open the Community Plugins catalog
5. Search for "BRAT"
6. Find "Obsidian42 - BRAT" in the results and click on it
7. Click "Install"
8. After installation completes, click "Enable" to activate the BRAT plugin

## Installing Rig Augmented Canvas using BRAT

Once BRAT is installed and enabled, you can use it to install Rig Augmented Canvas:

1. Open Obsidian Settings again
2. Go to "Community plugins" tab
3. Find "Obsidian42 - BRAT" in your list of installed plugins and click on its settings button
4. In the BRAT settings, click on "Add Beta plugin with frozen version based on a release tag"
5. In the "Github repository for beta plugin" field, enter:
   ```
   Tachikoma000/rig-augmented-canvas
   ```
6. In the "Specify the release version tag" field, enter the latest version (e.g., `1.0.0`)
7. Make sure "Enable after installing the plugin" is checked
8. Click "Add Plugin"
9. Wait for BRAT to download and install the plugin
10. Once installation is complete, go back to the "Community plugins" tab
11. Find "Rig Augmented Canvas" in your list of installed plugins and make sure it's enabled

## Using Rig Augmented Canvas

After installation, you can use Rig Augmented Canvas to enhance your Obsidian Canvas with AI capabilities:

1. Open or create a Canvas in Obsidian
2. Look for the Rig Augmented Canvas floating action button in the bottom right corner of the Canvas
3. Click on the button to access the plugin's features
4. Follow the on-screen prompts to use the AI-powered features

## Troubleshooting

If you encounter any issues during installation:

- Make sure you have the latest version of Obsidian installed
- Check that BRAT is properly installed and enabled
- Try restarting Obsidian after installing BRAT and before installing Rig Augmented Canvas
- If the plugin doesn't appear in your Community plugins list after installation, try refreshing the list
- Check the BRAT logs for any error messages (in BRAT settings, enable logging if not already enabled)

If you continue to experience issues, please [open an issue](https://github.com/Tachikoma000/rig-augmented-canvas/issues) on the GitHub repository.

## Updating the Plugin

When new versions of Rig Augmented Canvas are released:

1. Open Obsidian Settings
2. Go to "Community plugins" tab
3. Find "Obsidian42 - BRAT" and click on its settings
4. In the BRAT settings, find Rig Augmented Canvas in the list of beta plugins
5. Click the "Check for updates" button
6. If an update is available, BRAT will download and install it automatically

## For Plugin Developers

If you're developing or building this plugin, follow these additional steps to ensure WebAssembly compatibility with BRAT:

1. Build the plugin as usual:
   ```bash
   cd plugin
   npm run build
   ```

2. Copy the necessary files to the root directory:
   ```bash
   cp plugin/main.js .
   cp plugin/styles.css .
   cp -r pkg/* pkg/
   ```

3. Fix the WebAssembly paths and configuration in the main.js file:
   ```bash
   node fix-wasm-config.js
   ```

4. Create a zip file for the release:
   ```bash
   zip -r rig-augmented-canvas.zip main.js manifest.json styles.css pkg/
   ```

5. Create a new GitHub release with the zip file as an asset

This ensures that the WebAssembly module can be properly loaded when the plugin is installed via BRAT.
