# Rig Augmented Canvas

A powerful Obsidian plugin that enhances the Canvas experience with AI capabilities, allowing users to analyze content, generate questions, create flashcards, and more.

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

## Table of Contents

- [Requirements](#requirements)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Components](#components)
  - [Rust WebAssembly Core](#rust-webassembly-core)
  - [TypeScript Plugin](#typescript-plugin)
  - [Backend Service](#backend-service)
- [Building the Project](#building-the-project)
- [Installation](#installation)
  - [Backend Installation](#backend-installation)
  - [Plugin Installation](#plugin-installation)
  - [Installing in Obsidian](#installing-in-obsidian)
- [Running the Backend](#running-the-backend)
- [Configuration](#configuration)
- [Features](#features)
  - [Ask AI](#ask-ai)
  - [Generate Questions](#generate-questions)
  - [Ask Custom Question](#ask-custom-question)
  - [Create Flashcards](#create-flashcards)
  - [Connect Multiple Nodes](#connect-multiple-nodes)
  - [Ask AI using Connected Nodes](#ask-ai-using-connected-nodes)
- [User Interface](#user-interface)
- [Development Guide](#development-guide)
- [API Reference](#api-reference)
- [Tips and Best Practices](#tips-and-best-practices)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Requirements

- Obsidian v1.0.0 or higher
- OpenAI API key
- Rig Augmented Canvas backend server (included in the repository)

## Architecture Overview

Rig Augmented Canvas is built using a hybrid architecture that combines:

1. **Rust WebAssembly Core**: Handles AI model interactions and complex processing
2. **TypeScript Plugin**: Provides the Obsidian integration and user interface
3. **Optional Backend Service**: Can be used for additional processing or as a fallback

The plugin uses a client-side WebAssembly module compiled from Rust to interact with AI models (primarily OpenAI). This approach provides several benefits:

- **Performance**: Rust's performance characteristics make it ideal for complex operations
- **Security**: API keys are handled locally without sending them to external servers
- **Flexibility**: The architecture supports both local processing and backend service integration

Communication between the TypeScript plugin and Rust core happens through WebAssembly bindings, allowing seamless integration while maintaining type safety.

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

## Project Structure

```
rig-augmented-canvas/
├── src/                  # Rust WebAssembly core
│   ├── lib.rs            # Main WebAssembly entry point
│   ├── models.rs         # AI model interfaces and implementations
│   ├── obsidian.rs       # Obsidian API bindings for Rust
│   └── utils.rs          # Utility functions
├── plugin/               # TypeScript Obsidian plugin
│   ├── src/              # Plugin source code
│   │   ├── api.ts        # API client for WebAssembly module
│   │   ├── main.ts       # Plugin entry point
│   │   ├── canvas_utils.ts # Canvas-specific utilities
│   │   ├── settings.ts   # Plugin settings
│   │   ├── types.ts      # TypeScript type definitions
│   │   └── ui/           # UI components
│   ├── manifest.json     # Plugin manifest
│   ├── package.json      # NPM package configuration
│   └── styles.css        # Plugin styles
├── backend/              # Optional Rust backend service
│   ├── src/              # Backend source code
│   │   ├── main.rs       # Backend entry point
│   │   ├── models.rs     # Shared model definitions
│   │   └── rig_service.rs # Service implementation
│   └── Cargo.toml        # Rust dependencies
├── worker/               # Web worker for background processing
│   └── src/              # Worker source code
├── pkg/                  # Compiled WebAssembly output
├── Cargo.toml            # Rust project configuration
└── README.md             # This file
```

## Components

### Rust WebAssembly Core

The core functionality is implemented in Rust and compiled to WebAssembly. This component:

- Handles communication with AI models (OpenAI)
- Processes prompts and responses
- Manages API keys and configuration
- Provides a type-safe interface for the TypeScript plugin

Key files:

- `src/lib.rs`: Defines the WebAssembly interface and exports functions
- `src/models.rs`: Implements the AI model interfaces and agent wrappers
- `src/obsidian.rs`: Provides bindings to Obsidian's JavaScript API

The WebAssembly module exposes several key functions:

- `generate_response`: Sends a prompt to the AI model and returns the response
- `generate_questions`: Creates questions based on content
- `generate_flashcards`: Creates flashcards based on content

### TypeScript Plugin

The TypeScript plugin integrates with Obsidian and provides the user interface. It:

- Adds commands to the Obsidian interface
- Handles user interactions with the Canvas
- Manages plugin settings
- Communicates with the Rust WebAssembly core

Key files:

- `plugin/src/main.ts`: Plugin entry point and initialization
- `plugin/src/api.ts`: Client for communicating with the WebAssembly module
- `plugin/src/canvas_utils.ts`: Utilities for working with Obsidian Canvas
- `plugin/src/ui/`: UI components for modals, buttons, etc.

### Backend Service

An optional backend service implemented in Rust that can:

- Provide additional processing capabilities
- Serve as a fallback if client-side processing fails
- Handle operations that require server-side resources

The backend server runs on `localhost:3000` by default.

## Building the Project

### Prerequisites

- Rust (1.60+)
- wasm-pack (0.10+)
- Node.js (14+)
- npm (7+)

### Building the WebAssembly Module

```bash
# Install wasm-pack if not already installed
cargo install wasm-pack

# Build the WebAssembly module
wasm-pack build --target web
```

This will compile the Rust code to WebAssembly and generate the necessary JavaScript bindings in the `pkg/` directory.

### Building the Plugin

```bash
# Navigate to the plugin directory
cd plugin

# Install dependencies
npm install

# Build the plugin
npm run build
```

This will compile the TypeScript code and bundle it with the WebAssembly module into the `plugin/main.js` file.

### Building the Backend

```bash
# Navigate to the backend directory
cd backend

# Build the backend
cargo build --release
```

The compiled binary will be available at `target/release/rig-augmented-canvas-backend`.

## Installation

### Backend Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tachikoma000/rig-augmented-canvas.git
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

### Installing in Obsidian

1. Create a directory for the plugin in your Obsidian vault:
   ```
   <vault>/.obsidian/plugins/rig-augmented-canvas/
   ```

2. Copy the following files to the plugin directory:
   - `plugin/main.js`
   - `plugin/manifest.json`
   - `plugin/styles.css`
   - `pkg/rig_augmented_canvas.js`
   - `pkg/rig_augmented_canvas_bg.wasm`

3. Enable the plugin in Obsidian's settings

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

1. Open the plugin settings in Obsidian
2. Enter your OpenAI API key
3. Configure other settings as needed:
   - System prompt
   - Backend URL (if using the backend service)
   - Flashcards folder
   - Debug Mode
   - Max Depth
   - Keyboard shortcuts

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

## Development Guide

### Architecture Details

The plugin uses a layered architecture:

1. **UI Layer**: Obsidian integration and user interface
2. **API Layer**: Communication with the WebAssembly module
3. **Core Layer**: Rust implementation of AI functionality
4. **Model Layer**: Interaction with AI models

#### Communication Flow

1. User interacts with the Obsidian Canvas
2. Plugin captures the interaction and extracts relevant content
3. Content is passed to the API client
4. API client sends the content to the WebAssembly module
5. WebAssembly module processes the content and communicates with the AI model
6. Response is returned through the WebAssembly module to the API client
7. API client passes the response to the UI layer
8. UI layer displays the response in Obsidian

### Key Interfaces

#### WebAssembly Interface

The WebAssembly module exposes several key functions:

```typescript
// Initialize the WebAssembly module
function init(): Promise<void>;

// Generate a response from the AI model
function generate_response(
  content: string,
  system_prompt?: string,
  api_key?: string
): Promise<string>;

// Generate questions based on content
function generate_questions(
  content: string,
  count: number,
  api_key?: string
): Promise<string[]>;

// Generate flashcards based on content
function generate_flashcards(
  content: string,
  title?: string,
  api_key?: string
): Promise<FlashcardsResponse>;
```

#### API Client Interface

The API client provides a TypeScript interface for the WebAssembly module:

```typescript
class RigApiClient {
  // Send a prompt to the AI model
  async sendPrompt(content: string, systemPrompt?: string): Promise<string>;
  
  // Generate questions about content
  async generateQuestions(content: string, count?: number): Promise<string[]>;
  
  // Create flashcards from content
  async createFlashcards(content: string, title?: string): Promise<FlashcardsResponse>;
  
  // Process multiple nodes with a custom prompt
  async sendMultiNodePrompt(
    nodeContents: { id: string; content: string }[],
    prompt: string,
    systemPrompt?: string
  ): Promise<string>;
}
```

### Adding New Features

To add a new feature:

1. Implement the core functionality in Rust
2. Expose the functionality through the WebAssembly interface
3. Add a method to the API client
4. Create UI components as needed
5. Add commands to the main plugin class

### Testing

The project includes several types of tests:

- **Rust Unit Tests**: Test the core functionality
- **WebAssembly Tests**: Test the WebAssembly bindings
- **TypeScript Tests**: Test the plugin functionality

To run the tests:

```bash
# Run Rust tests
cargo test

# Run WebAssembly tests
cd worker && wasm-pack test --headless --firefox

# Run TypeScript tests
cd plugin && npm test
```

## API Reference

### Rust API

#### `WasmRigService`

The main service class that handles AI interactions.

```rust
pub struct WasmRigService {
    agent: Option<AgentWrapper>,
    config: ModelConfig,
}

impl WasmRigService {
    pub fn new() -> Result<Self, js_sys::Error>;
    pub fn get_config(&self) -> ModelConfig;
    pub fn update_model_config(&mut self, config_json: String) -> Result<(), JsValue>;
    pub async fn handle_prompt(
        &self,
        api_key: Option<String>,
        prompt: JsValue,
    ) -> Result<PromptResponse, js_sys::Error>;
    pub async fn generate_response(
        &self,
        content: String,
        system_prompt: Option<String>,
        api_key: Option<String>,
    ) -> Result<String, js_sys::Error>;
    pub async fn generate_questions(
        &self,
        content: String,
        count: usize,
        api_key: Option<String>,
    ) -> Result<Vec<String>, JsValue>;
    pub async fn generate_flashcards(
        &self,
        content: &str,
        title: Option<String>,
        api_key: Option<String>,
    ) -> Result<JsValue, JsValue>;
}
```

#### `AgentWrapper`

Wraps an AI agent and provides a consistent interface.

```rust
pub struct AgentWrapper {
    agent: Box<dyn Agent>,
}

impl AgentWrapper {
    pub async fn prompt(&self, prompt: &str) -> Result<String, AgentError>;
}
```

### TypeScript API

#### `RigApiClient`

Client for communicating with the WebAssembly module.

```typescript
export class RigApiClient {
    constructor(settings: RigAugmentedCanvasSettings);
    
    setLoadingIndicator(indicator: LoadingIndicator): void;
    
    async sendPrompt(content: string, systemPrompt?: string): Promise<string>;
    
    async generateQuestions(content: string, count?: number): Promise<string[]>;
    
    async createFlashcards(content: string, title?: string): Promise<FlashcardsResponse>;
    
    async sendMultiNodePrompt(
        nodeContents: { id: string; content: string }[],
        prompt: string,
        systemPrompt?: string
    ): Promise<string>;
}
```

#### `RigAugmentedCanvasPlugin`

Main plugin class that integrates with Obsidian.

```typescript
export default class RigAugmentedCanvasPlugin extends Plugin {
    settings: RigAugmentedCanvasSettings;
    apiClient: RigApiClient;
    
    async onload(): Promise<void>;
    
    async saveSettings(): Promise<void>;
    
    async askAI(canvas: Canvas, nodes: CanvasNode[]): Promise<void>;
    
    async generateQuestions(canvas: Canvas, nodes: CanvasNode[]): Promise<void>;
    
    async askCustomQuestion(canvas: Canvas, nodes: CanvasNode[]): Promise<void>;
    
    async createFlashcards(canvas: Canvas, nodes: CanvasNode[]): Promise<void>;
    
    async multiNodePrompt(canvas: Canvas, nodes: CanvasNode[]): Promise<void>;
}
```

## Tips and Best Practices

- Start with clear, concise notes for better AI responses
- Use "Connect Multiple Nodes" to provide more context for complex questions
- Organize your canvas with AI-generated nodes to create knowledge maps
- Use the "Ask AI using Connected Nodes" feature to analyze relationships between concepts
- Create flashcards from important concepts for later review

## Troubleshooting

### Common Issues

#### "Invalid response from AI service"

This error occurs when the WebAssembly module returns a response that can't be properly processed. Possible causes:

- Invalid or missing OpenAI API key
- Network connectivity issues
- Incompatible WebAssembly module

**Solution**: Check your API key in the plugin settings and ensure you have an internet connection.

#### "WebAssembly module not initialized"

This error occurs when the WebAssembly module fails to initialize. Possible causes:

- Missing WebAssembly files
- Incompatible browser
- Memory constraints

**Solution**: Ensure all required files are in the plugin directory and restart Obsidian.

#### Empty Response Cards

If you see empty response cards, it could be due to:

- Failed API requests
- Errors in processing the response
- Issues with the WebAssembly module

**Solution**: Enable debug logging in the plugin settings to see detailed error messages.

#### Backend Connection Problems

- Ensure the backend server is running
- Check that the Backend URL in plugin settings is correct
- Verify your network connection

#### API Key Issues

- Verify your OpenAI API key is valid
- Check that it's properly set in the environment or plugin settings

#### No Response from AI

- Ensure the selected node contains valid content
- Check the console for error messages (enable Debug Mode in settings)
- Verify the backend server logs for any errors

#### Plugin Not Working

- Restart Obsidian
- Disable and re-enable the plugin
- Check for plugin updates

### Debugging

To enable debug logging:

1. Open the plugin settings
2. Enable the "Debug output" option
3. Open the browser console (Developer Tools)
4. Look for logs with the prefix `[Rig API]`

### Getting Help

If you encounter issues not covered in this documentation:

1. Check the console logs for error messages
2. Look for similar issues in the GitHub repository
3. Create a new issue with detailed information about the problem

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Obsidian](https://obsidian.md/) for the amazing knowledge management platform
- [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) for making Rust and JavaScript interoperability possible
- [OpenAI](https://openai.com/) for providing the AI models used in this project
- [Rig](https://github.com/0xPlaygrounds/rig) library for powerful AI interactions