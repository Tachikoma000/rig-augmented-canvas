# Rig Augmented Canvas Plugin

This Obsidian plugin enhances the Canvas feature with AI capabilities powered by the [Rig](https://github.com/0xPlaygrounds/rig) library. It allows users to interact with AI models directly within Obsidian's Canvas interface.

## Overview

The Rig Augmented Canvas plugin adds AI-powered features to Obsidian's Canvas, enabling users to:

- Ask AI about selected nodes
- Generate questions about content
- Ask custom questions
- Create flashcards
- Connect multiple nodes for complex AI prompts
- Use connected nodes as context for AI prompts

## Architecture

### Main Components

1. **Main Plugin Class (`main.ts`)**: The entry point that initializes the plugin, registers commands, and sets up event listeners.

2. **API Client (`api.ts`)**: Handles communication with the backend server, sending requests and processing responses.

3. **Canvas Patches (`canvas_patches.ts`)**: Extends Obsidian's Canvas functionality with AI features by patching the Canvas UI and handling AI operations.

4. **Canvas Utilities (`canvas_utils.ts`)**: Provides utility functions for interacting with Canvas nodes, edges, and content.

5. **UI Components (`ui/` directory)**: Contains modal dialogs and UI elements for user interaction.

6. **Settings (`settings.ts` & `types.ts`)**: Manages plugin configuration and defines data structures.

### Component Interactions

```
┌─────────────────────────────────────────────────────────────┐
│                      Obsidian Canvas                         │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Rig Augmented Canvas Plugin                 │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │   Main.ts   │◄──►│Canvas Patches│◄──►│  Canvas Utils   │  │
│  └──────┬──────┘    └──────┬──────┘    └─────────────────┘  │
│         │                  │                                 │
│         ▼                  ▼                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │  API Client │    │ UI Components│    │    Settings     │  │
│  └──────┬──────┘    └─────────────┘    └─────────────────┘  │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Server                           │
│                  (Rig AI Integration)                        │
└─────────────────────────────────────────────────────────────┘
```

## Connection to Backend

The plugin communicates with a Rust-based backend server that uses the Rig library to interact with AI models. The connection is handled by the `RigApiClient` class in `api.ts`.

### API Endpoints Used

- `/api/prompt`: Sends content to the AI and receives a response
- `/api/questions`: Generates questions about content
- `/api/flashcards`: Creates flashcards from content

### Authentication

The plugin supports two methods for providing an OpenAI API key:

1. Environment variable on the backend (`OPENAI_API_KEY`)
2. Plugin settings (`openaiApiKey`), sent via the `X-OpenAI-Key` header

## Canvas Integration

The plugin integrates with Obsidian's Canvas by:

1. **Patching Canvas Menus**: Adds custom menu items to the Canvas context menu
2. **Creating Custom Nodes**: Adds AI-generated nodes with special styling
3. **Managing Node Connections**: Creates and manages connections between nodes
4. **Handling Node Content**: Extracts and processes content from different node types

### Node Types

The plugin creates three types of AI-related nodes:

1. **Prompt Nodes**: Contain user prompts or questions
2. **Response Nodes**: Contain AI-generated responses
3. **Question Nodes**: Contain AI-generated questions

Each node type has distinct styling and metadata to indicate its purpose.

## User Interface

### Floating Action Button

The plugin adds a floating action button to Canvas views, providing quick access to AI features:

- Ask AI
- Generate Questions
- Ask Custom Question
- Create Flashcards
- Connect Multiple Nodes
- User Guide

### Modal Dialogs

Several modal dialogs facilitate user interaction:

- **Questions Modal**: Displays AI-generated questions
- **Custom Question Modal**: Allows users to enter custom questions
- **Multi-Node Prompt Modal**: Facilitates prompts using multiple nodes as context
- **User Guide Modal**: Provides comprehensive documentation

## Data Flow

1. **User Interaction**: User selects node(s) and triggers an AI action
2. **Content Extraction**: Plugin extracts content from selected node(s)
3. **API Request**: Content is sent to the backend server
4. **AI Processing**: Backend processes the request using Rig and AI models
5. **Response Handling**: Plugin receives the response and creates new nodes
6. **Visual Feedback**: AI-generated nodes are styled distinctly and connected to source nodes

## Settings

The plugin provides several configurable options:

- Backend URL
- System prompt for AI guidance
- Flashcards folder location
- Debug mode
- Maximum depth for node connections
- OpenAI API key
- Keyboard shortcuts for commands

## Development

### Project Structure

```
plugin/
├── src/
│   ├── main.ts                 # Main plugin class
│   ├── api.ts                  # Backend API client
│   ├── canvas_patches.ts       # Canvas UI extensions
│   ├── canvas_utils.ts         # Canvas utility functions
│   ├── settings.ts             # Settings tab UI
│   ├── types.ts                # Type definitions
│   ├── ui/                     # UI components
│   │   ├── custom_question_modal.ts
│   │   ├── floating_action_button.ts
│   │   ├── loading_indicator.ts
│   │   ├── multi_node_prompt_modal.ts
│   │   ├── questions_modal.ts
│   │   └── user_guide_modal.ts
│   └── assets/                 # Static assets
├── styles.css                  # Plugin styles
├── manifest.json               # Plugin manifest
├── package.json                # NPM package definition
└── tsconfig.json               # TypeScript configuration
```

### Building the Plugin

The plugin uses TypeScript and is built with esbuild:

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch for changes during development
npm run dev
```

## Installation

1. Build the plugin or download a release
2. Copy the built files to your Obsidian plugins folder
3. Enable the plugin in Obsidian settings
4. Configure the backend URL and API key in plugin settings
5. Ensure the backend server is running

## Usage

1. Open a Canvas in Obsidian
2. Select a node with content
3. Use the context menu, floating button, or keyboard shortcuts to access AI features
4. View AI-generated content in new nodes connected to your selection

## Troubleshooting

- Ensure the backend server is running at the configured URL
- Check that a valid OpenAI API key is provided
- Enable debug mode in settings for detailed logging
- Verify that the selected nodes contain valid content
