# Rig Augmented Canvas

A powerful Obsidian plugin that enhances the Canvas experience with AI capabilities, allowing users to analyze content, generate questions, create flashcards, and more.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Components](#components)
  - [Rust WebAssembly Core](#rust-webassembly-core)
  - [TypeScript Plugin](#typescript-plugin)
  - [Backend Service](#backend-service)
- [Building the Project](#building-the-project)
- [Installation](#installation)
- [Development Guide](#development-guide)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

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

### Building the Backend (Optional)

```bash
# Navigate to the backend directory
cd backend

# Build the backend
cargo build --release
```

## Installation

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

### Configuration

1. Open the plugin settings in Obsidian
2. Enter your OpenAI API key
3. Configure other settings as needed:
   - System prompt
   - Backend URL (if using the backend service)
   - Flashcards folder
   - Keyboard shortcuts

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
