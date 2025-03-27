# Rig Augmented Canvas Backend

This is the backend server for the Rig Augmented Canvas Obsidian plugin. It provides the AI capabilities that power the plugin's features by leveraging the [Rig](https://github.com/0xPlaygrounds/rig) library.

## Overview

The backend is a Rust-based HTTP server that provides API endpoints for the Obsidian plugin to interact with AI models. It handles:

- Processing prompts and generating AI responses
- Generating questions based on content
- Creating flashcards from content
- Managing model configuration

## Architecture

### Main Components

1. **HTTP Server (main.rs)**: Sets up the Axum-based HTTP server, defines API routes, and handles incoming requests.
2. **Rig Service (rig_service.rs)**: Manages interactions with the Rig library, including creating agents, generating responses, questions, and flashcards.
3. **Models (models.rs)**: Defines data structures for model configuration and provides utilities for creating AI agents.

### API Endpoints

The backend exposes the following API endpoints:

- `GET /health`: Health check endpoint
- `POST /api/prompt`: Process a prompt and generate an AI response
- `POST /api/questions`: Generate questions based on content
- `POST /api/flashcards`: Generate flashcards from content
- `GET /api/model-config`: Get the current model configuration
- `POST /api/model-config`: Update the model configuration

## How Rig is Used

The backend uses the [Rig](https://github.com/0xPlaygrounds/rig) library to interact with AI models. Rig provides a simple but powerful abstraction over various AI providers (like OpenAI).

### Agent Creation

The backend creates Rig agents to handle different types of AI interactions:

```rust
// Create a default agent for handling prompts
let agent = create_agent(&config, api_key)?;

// Create an agent with a specific system prompt
let agent = create_agent_with_system_prompt(&config, system_prompt, api_key)?;
```

### Generating Responses

The backend uses Rig to generate responses to prompts:

```rust
// Generate a response to a prompt
let response = agent.prompt(content).await?;
```

### Generating Questions

The backend uses Rig to generate questions about content:

```rust
// Generate questions about content
let prompt = format!(
    "Based on the following content, generate {} thoughtful questions...",
    count, content
);
let response_str = self.generate_response(&prompt, None, api_key).await?;
```

### Generating Flashcards

The backend uses Rig to generate flashcards from content:

```rust
// Generate flashcards from content
let prompt = format!(
    "Create flashcards for studying {}. Each flashcard should have...",
    title_prompt, content
);
let response_str = self.generate_response(&prompt, None, api_key).await?;
```

## Connection with the Plugin

The plugin communicates with the backend through HTTP requests. The backend processes these requests and returns responses that the plugin can use to update the UI.

### Request Flow

1. The user interacts with the plugin in Obsidian
2. The plugin sends an HTTP request to the backend
3. The backend processes the request using Rig
4. The backend returns a response to the plugin
5. The plugin updates the UI based on the response

### Authentication

The backend supports two methods for providing an OpenAI API key:

1. Environment variable (`OPENAI_API_KEY`)
2. Request header (`x-openai-key`)

This allows users to either set the API key globally for the backend or provide it on a per-request basis through the plugin settings.

## Running the Backend

The backend server runs on `localhost:3000` by default. It can be started with:

```bash
cargo run
```

Or in release mode:

```bash
cargo run --release
```

## Building the Backend

To build the backend in release mode:

```bash
cargo build --release
```

The compiled binary will be available at `target/release/rig-augmented-canvas-backend`.
