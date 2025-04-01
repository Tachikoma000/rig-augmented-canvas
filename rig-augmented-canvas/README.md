# Rig Augmented Canvas

An Obsidian plugin that enhances Canvas with AI capabilities powered by Rig.

## New Feature: Fully Client-Side Operation

The plugin now supports fully client-side operation using WebAssembly (WASM), eliminating the need for a local HTTP server.

### How It Works

1. **WebAssembly Integration**: The Rig backend has been compiled to WebAssembly, allowing it to run directly in the browser.
2. **Toggle Between Modes**: You can choose between the traditional HTTP backend or the new WASM implementation in the plugin settings.
3. **Same Features, No Server**: All AI features (prompts, questions, flashcards) work exactly the same, but without requiring a server.

### Benefits

- **Simplified Setup**: No need to run a separate backend server
- **Improved Portability**: Works on any device without additional setup
- **Better Privacy**: All processing happens locally in your browser
- **Reduced Dependencies**: Fewer moving parts means fewer things that can break

## Installation

### Option 1: Install from Obsidian Community Plugins

1. Open Obsidian
2. Go to Settings → Community plugins
3. Search for "Rig Augmented Canvas"
4. Click Install, then Enable

### Option 2: Manual Installation

1. Download the latest release from the GitHub repository
2. Extract the ZIP file
3. Copy the extracted folder to your Obsidian plugins folder:
   - On Windows: `%APPDATA%\Obsidian\plugins\`
   - On macOS: `~/Library/Application Support/Obsidian/plugins/`
   - On Linux: `~/.obsidian/plugins/`
4. Restart Obsidian
5. Enable the plugin in Settings → Community plugins

## Configuration

1. Open Obsidian Settings
2. Navigate to the "Rig Augmented Canvas" section
3. **Use WebAssembly**: Enable this option to use the client-side WASM implementation (recommended)
4. **OpenAI API Key**: Enter your OpenAI API key
5. **System Prompt**: Customize the system prompt for AI interactions
6. **Other Settings**: Configure additional options as needed

## Usage

The plugin adds AI capabilities to Obsidian Canvas:

1. **Ask AI**: Select a node and use the context menu to ask AI about its content
2. **Generate Questions**: Create thought-provoking questions based on node content
3. **Custom Questions**: Ask specific questions about selected content
4. **Create Flashcards**: Generate flashcards for study and review
5. **Multi-Node Prompts**: Connect multiple nodes and ask AI about their combined content

## Troubleshooting

### WASM Mode Issues

- If you encounter issues with WASM mode, try disabling it in settings to use the HTTP backend instead
- Ensure your browser supports WebAssembly (all modern browsers do)
- Check that your OpenAI API key is valid

### HTTP Backend Mode

If you prefer or need to use the HTTP backend:

1. Disable "Use WebAssembly" in the plugin settings
2. Set the Backend URL to where your Rig backend server is running (default: http://localhost:3000)
3. Run the backend server:
   ```
   cd rig-augmented-canvas/backend
   cargo run
   ```

## Development

### WASM Integration Details

The plugin now includes a WebAssembly integration that allows it to run fully client-side without requiring a local HTTP server. Here's what was implemented:

1. **WASM API Client**: Created a new `WasmApiClient` class in `plugin/src/wasm_api.ts` that interfaces with the WASM module instead of making HTTP requests.

2. **Settings Integration**: Added a "Use WebAssembly" toggle in the plugin settings to switch between HTTP and WASM backends.

3. **Build Process**: Updated the build configuration in `esbuild.config.mjs` to include WASM files in the output.

4. **Type Definitions**: Added TypeScript definitions for the WASM module to ensure proper type checking.

The integration works by dynamically loading the WASM module at runtime and using it to process AI requests locally in the browser. The API interface remains the same, so all existing functionality works without changes.

### Building the Plugin

```bash
cd rig-augmented-canvas/plugin
npm install
npm run build
```

This will:
1. Compile the TypeScript code
2. Bundle the JavaScript with esbuild
3. Copy the WASM files to the output directory

### Building the WASM Module

If you need to update the WASM implementation:

```bash
cd rig-augmented-canvas/worker
wasm-pack build --target web
```

This compiles the Rust code to WebAssembly and generates the necessary JavaScript bindings.

### Deployment

To deploy the plugin, copy the following files to your Obsidian plugins folder:
- `main.js`
- `manifest.json`
- `styles.css`
- The entire `worker` directory with all WASM files
