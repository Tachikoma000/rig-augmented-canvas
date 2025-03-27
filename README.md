# Rig Augmented Canvas

Enhance Obsidian Canvas with AI capabilities powered by Rig.

![Rig Augmented Canvas](rig-augmented-canvas/plugin/src/assets/arc_logo_mintgreen_on_black.png)

## Overview

Rig Augmented Canvas is an Obsidian plugin that adds AI capabilities to the Canvas feature, allowing you to:

- Ask AI about selected notes
- Generate questions about content
- Ask custom questions
- Create flashcards automatically
- Connect multiple nodes for complex AI analysis
- Use connected nodes as context for AI prompts
- And more!

The plugin leverages the [Rig](https://github.com/0xPlaygrounds/rig) library to provide powerful AI interactions directly within your Obsidian Canvas.

## Requirements

- Obsidian v1.0.0 or higher
- OpenAI API key
- Rig Augmented Canvas backend server (included in the repository)

## Installation

### Backend Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/rig-augmented-canvas.git
   cd rig-augmented-canvas
   ```

2. **Build the backend**:
   ```bash
   cd rig-augmented-canvas/backend
   cargo build --release
   ```
   The compiled binary will be available at `target/release/rig-augmented-canvas-backend`.

   Alternatively, you can use pre-built binaries from the releases section if available.

3. **Set up your OpenAI API key**:
   
   Either set it as an environment variable:
   ```bash
   export OPENAI_API_KEY=your-api-key
   ```
   
   Or provide it through the plugin settings (see Configuration section).

### Plugin Installation

1. **Build the plugin** (if not using a pre-built release):
   ```bash
   cd rig-augmented-canvas/plugin
   npm install
   npm run build
   ```

2. **Install the plugin in Obsidian**:
   - Open Obsidian
   - Go to Settings > Community Plugins
   - Turn off Restricted Mode
   - Click "Browse" and find the plugin, or
   - Use "Install plugin from manifest" and select the `manifest.json` file from the plugin directory

3. **Enable the plugin**:
   - After installation, enable the plugin in the Community Plugins section
   - Configure the plugin settings (see Configuration section)

## Running the Backend

The backend server runs on `localhost:3000` by default. Start it with:

```bash
cd rig-augmented-canvas/backend
cargo run --release
```

Or directly run the compiled binary:

```bash
./target/release/rig-augmented-canvas-backend
```

The backend must be running for the plugin to function properly.

## Configuration

### Plugin Settings

Access the plugin settings through Obsidian's settings menu:

1. Go to Settings > Community Plugins
2. Find "Rig Augmented Canvas" and click the gear icon

Available settings:

| Setting | Description |
|---------|-------------|
| Backend URL | The URL of the backend service (default: http://localhost:3000) |
| System Prompt | The system prompt to use when generating responses |
| Flashcards Folder | The folder to save flashcards in (relative to the Obsidian vault root) |
| Debug Mode | Enable debug output in the console |
| Max Depth | The maximum depth of ancestor notes to include |
| OpenAI API Key | Your OpenAI API key (can be left empty to use the backend's default key) |
| Keyboard Shortcuts | Customize the keyboard shortcuts for plugin commands |

## Features

### Ask AI

Sends the content of a selected node to AI and creates a response node with AI's analysis.

**How to use**:
1. Select a node on the canvas
2. Click the "Ask AI" button in the floating menu (speech bubble icon)
3. The plugin will create a prompt node and an AI response node connected to your selected node

**Keyboard shortcut**: Alt+A (customizable)

### Generate Questions

Creates AI-generated questions about the selected node's content.

**How to use**:
1. Select a node on the canvas
2. Click the "Generate Questions" button in the floating menu (question mark icon)
3. A modal will appear with a list of AI-generated questions
4. Click on any question to have the AI answer it
5. The plugin will create a question node and an answer node connected to your selected node

**Keyboard shortcut**: Alt+Q (customizable)

### Ask Custom Question

Allows you to ask a specific question about the selected node's content.

**How to use**:
1. Select a node on the canvas
2. Click the "Ask Custom Question" button in the floating menu (pencil icon)
3. Enter your question in the modal that appears
4. Click "Ask" to submit your question
5. The plugin will create a question node with your question and an answer node with the AI's response

**Keyboard shortcut**: Alt+C (customizable)

### Create Flashcards

Generates flashcards from the selected node's content and saves them to a file.

**How to use**:
1. Select a node on the canvas
2. Click the "Create Flashcards" button in the floating menu (layers icon)
3. The plugin will generate flashcards and save them to the configured folder
4. A notification will appear when the flashcards are created

**Keyboard shortcut**: Alt+F (customizable)

### Connect Multiple Nodes

Allows you to use multiple selected nodes as context for an AI prompt.

**How to use**:
1. Select multiple nodes on the canvas (hold Shift or Ctrl/Cmd while clicking)
2. Click the "Connect Multiple Nodes" button in the floating menu (git merge icon)
3. Enter your prompt in the modal that appears
4. Click "Submit" to send your prompt
5. The plugin will create a prompt node connected to all selected nodes and an AI response node

**Keyboard shortcut**: Alt+M (customizable)

### Ask AI using Connected Nodes

Uses nodes connected to the selected node as context for an AI prompt.

**How to use**:
1. Create a node that will serve as your prompt
2. Connect other nodes to this prompt node (these will be used as context)
3. Select the prompt node
4. Click the "Ask AI using Connected Nodes" button in the floating menu (link icon)
5. The plugin will use the content of all connected nodes as context and create an AI response node

## User Interface

### Floating Action Button

The floating action button appears in the bottom-left corner of your canvas. Click it to reveal the following options:

- 💬 Ask AI
- ❓ Generate Questions
- ✏️ Ask Custom Question
- 📚 Create Flashcards
- 🔀 Connect Multiple Nodes
- 🔗 Ask AI using Connected Nodes
- 📖 User Guide

### Context Menu

You can also access the plugin's features by right-clicking on a node or a selection of nodes:

1. Right-click on a single node to see options for that node
2. Right-click after selecting multiple nodes to see multi-node options

### Node Types

The plugin creates different types of nodes on your canvas:

- **Prompt Nodes**: Contain your prompt or question to the AI (green left border)
- **Question Nodes**: Contain the question being asked (blue left border)
- **Response Nodes**: Contain the AI's response (purple left border)

All AI-generated nodes have a small AI indicator icon in the top-right corner.

## Tips and Best Practices

- Start with clear, concise notes for better AI responses
- Use "Connect Multiple Nodes" to provide more context for complex questions
- Organize your canvas with AI-generated nodes to create knowledge maps
- Use the "Ask AI using Connected Nodes" feature to analyze relationships between concepts
- Create flashcards from important concepts for later review

## Troubleshooting

If you encounter issues:

1. **Backend Connection Problems**:
   - Ensure the backend server is running
   - Check that the Backend URL in plugin settings is correct
   - Verify your network connection

2. **API Key Issues**:
   - Verify your OpenAI API key is valid
   - Check that it's properly set in the environment or plugin settings

3. **No Response from AI**:
   - Ensure the selected node contains valid content
   - Check the console for error messages (enable Debug Mode in settings)
   - Verify the backend server logs for any errors

4. **Plugin Not Working**:
   - Restart Obsidian
   - Disable and re-enable the plugin
   - Check for plugin updates

## Architecture

The project consists of two main components:

1. **Backend Server**: A Rust-based HTTP server that provides API endpoints for the Obsidian plugin to interact with AI models.
2. **Obsidian Plugin**: A TypeScript-based plugin that integrates with Obsidian's Canvas feature.

### Backend Architecture

The backend handles:
- Processing prompts and generating AI responses
- Generating questions based on content
- Creating flashcards from content
- Managing model configuration

### Plugin Architecture

The plugin integrates with Obsidian by:
- Patching Canvas menus
- Creating custom nodes
- Managing node connections
- Handling node content

## License

[MIT License](LICENSE)

## Support

If you encounter any issues or have questions:

1. Check the Troubleshooting section above
2. Submit an issue on GitHub
3. Contact the developers at [your-email@example.com]
