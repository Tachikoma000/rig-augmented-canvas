/**
 * Main entry point for the Rig Augmented Canvas plugin.
 * This plugin enhances Obsidian's Canvas with AI capabilities.
 */

import { Plugin, Notice, setIcon, WorkspaceLeaf } from "obsidian";
import { DEFAULT_SETTINGS, RigAugmentedCanvasSettings } from "./types";
import { SettingsTab } from "./settings";
import { RigApiClient } from "./api";
import { LoadingIndicator } from "./ui/loading_indicator";
import { FloatingActionButton } from "./ui/floating_action_button";
import { UserGuideModal } from "./ui/user_guide_modal";
import { 
    patchCanvasMenu, 
    handleAskAI, 
    handleGenerateQuestions, 
    handleAskCustomQuestion, 
    handleCreateFlashcards,
    handleMultiNodePrompt,
    handleConnectedNodesPrompt
} from "./canvas_patches";

// Import the WebAssembly module
// @ts-ignore - This will be resolved after building the WebAssembly module
import * as wasm from "../../pkg/rig_augmented_canvas";
// @ts-ignore - This will be resolved after building the WebAssembly module
import wasmbin from "../../pkg/rig_augmented_canvas_bg.wasm";

/**
 * Main plugin class that handles initialization, commands, and UI elements.
 */
export default class RigAugmentedCanvasPlugin extends Plugin {
    settings: RigAugmentedCanvasSettings;  // Plugin settings
    apiClient: RigApiClient;               // Client for communicating with the WebAssembly module
    loadingIndicator: LoadingIndicator;    // UI element for showing loading state
    floatingButton: FloatingActionButton | null = null; // Floating action button for quick access

    /**
     * Called when the plugin is loaded.
     * Initializes settings, API client, UI elements, and registers commands.
     */
    async onload() {
        console.log("Loading Rig Augmented Canvas plugin");
        
        // Initialize WebAssembly module
        try {
            // Initialize the WebAssembly module
            await wasm.default(Promise.resolve(wasmbin));
            
            // Register the onload function with the plugin
            wasm.onload(this);
            
            console.log("WebAssembly module initialized");
        } catch (error) {
            console.error("Failed to initialize WebAssembly module:", error);
        }
        
        await this.loadSettings();
        
        // Initialize API client for WebAssembly communication
        this.apiClient = new RigApiClient(this.settings);
        
        // Initialize loading indicator for async operations
        this.loadingIndicator = new LoadingIndicator();
        
        // Connect loading indicator to API client
        this.apiClient.setLoadingIndicator(this.loadingIndicator);
        
        // Load custom CSS styles for the plugin
        this.loadStyles();
        
        // Add settings tab to Obsidian settings
        this.addSettingTab(new SettingsTab(this.app, this));
        
        // Register plugin commands in Obsidian command palette
        this.addCommand({
            id: "ask-ai",
            name: "Ask AI about selected note",
            checkCallback: (checking) => {
                try {
                    // Check if we're in a canvas view
                    const activeLeaf = this.app.workspace.activeLeaf;
                    if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
                        return false;
                    }
                    
                    if (!checking) {
                        this.askAI();
                    }
                    
                    return true;
                } catch (error) {
                    console.error("Error in ask-ai command:", error);
                    return false;
                }
            }
        });
        
        this.addCommand({
            id: "generate-questions",
            name: "Generate questions about selected note",
            checkCallback: (checking) => {
                try {
                    // Check if we're in a canvas view
                    const activeLeaf = this.app.workspace.activeLeaf;
                    if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
                        return false;
                    }
                    
                    if (!checking) {
                        this.generateQuestions();
                    }
                    
                    return true;
                } catch (error) {
                    console.error("Error in generate-questions command:", error);
                    return false;
                }
            }
        });
        
        this.addCommand({
            id: "ask-custom-question",
            name: "Ask a custom question about selected note",
            checkCallback: (checking) => {
                try {
                    // Check if we're in a canvas view
                    const activeLeaf = this.app.workspace.activeLeaf;
                    if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
                        return false;
                    }
                    
                    if (!checking) {
                        this.askCustomQuestion();
                    }
                    
                    return true;
                } catch (error) {
                    console.error("Error in ask-custom-question command:", error);
                    return false;
                }
            }
        });
        
        this.addCommand({
            id: "create-flashcards",
            name: "Create flashcards from selected note",
            checkCallback: (checking) => {
                try {
                    // Check if we're in a canvas view
                    const activeLeaf = this.app.workspace.activeLeaf;
                    if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
                        return false;
                    }
                    
                    if (!checking) {
                        this.createFlashcards();
                    }
                    
                    return true;
                } catch (error) {
                    console.error("Error in create-flashcards command:", error);
                    return false;
                }
            }
        });
        
        this.addCommand({
            id: "multi-node-prompt",
            name: "Connect multiple nodes and ask AI",
            checkCallback: (checking) => {
                try {
                    // Check if we're in a canvas view
                    const activeLeaf = this.app.workspace.activeLeaf;
                    if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
                        return false;
                    }
                    
                    if (!checking) {
                        this.multiNodePrompt();
                    }
                    
                    return true;
                } catch (error) {
                    console.error("Error in multi-node-prompt command:", error);
                    return false;
                }
            }
        });
        
        this.addCommand({
            id: "connected-nodes-prompt",
            name: "Ask AI using connected nodes",
            checkCallback: (checking) => {
                try {
                    // Check if we're in a canvas view
                    const activeLeaf = this.app.workspace.activeLeaf;
                    if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
                        return false;
                    }
                    
                    if (!checking) {
                        this.connectedNodesPrompt();
                    }
                    
                    return true;
                } catch (error) {
                    console.error("Error in connected-nodes-prompt command:", error);
                    return false;
                }
            }
        });
        
        this.addCommand({
            id: "open-user-guide",
            name: "Open User Guide",
            callback: () => {
                this.openUserGuide();
            }
        });
        
        // Patch canvas UI and initialize floating button when Obsidian is ready
        this.app.workspace.onLayoutReady(() => {
            this.patchCanvas();
            
            // Initialize floating button for the current view
            if (this.app.workspace.activeLeaf) {
                this.updateFloatingButton(this.app.workspace.activeLeaf);
            }
        });
        
        console.log("Rig Augmented Canvas plugin loaded");
    }
    
    /**
     * Handles the "Ask AI" command.
     * Sends the selected node's content to the AI and creates a response node.
     */
    async askAI() {
        await handleAskAI(this.app, this);
    }
    
    /**
     * Handles the "Generate Questions" command.
     * Creates AI-generated questions about the selected node's content.
     */
    async generateQuestions() {
        await handleGenerateQuestions(this.app, this);
    }
    
    /**
     * Handles the "Ask Custom Question" command.
     * Prompts the user for a question and creates a response node.
     */
    async askCustomQuestion() {
        await handleAskCustomQuestion(this.app, this);
    }
    
    /**
     * Handles the "Create Flashcards" command.
     * Generates flashcards from the selected node's content.
     */
    async createFlashcards() {
        await handleCreateFlashcards(this.app, this);
    }
    
    /**
     * Handles the "Multi-Node Prompt" command.
     * Allows using multiple selected nodes as context for an AI prompt.
     */
    async multiNodePrompt() {
        await handleMultiNodePrompt(this.app, this);
    }
    
    /**
     * Handles the "Connected Nodes Prompt" command.
     * Uses nodes connected to the selected node as context for an AI prompt.
     */
    async connectedNodesPrompt() {
        await handleConnectedNodesPrompt(this.app, this);
    }
    
    /**
     * Opens the user guide modal.
     * Shows a comprehensive guide to using the plugin.
     */
    openUserGuide() {
        new UserGuideModal(this.app).open();
    }
    
    /**
     * Patches the Canvas UI to add custom menu items and functionality.
     * Also sets up event listeners for styling AI-generated nodes.
     */
    patchCanvas() {
        patchCanvasMenu(this.app, this);
        
        // Apply styling to AI-generated nodes
        this.registerEvent(
            this.app.workspace.on('click', () => {
                this.applyAINodeStyling();
            })
        );
        
        // Initial styling application
        this.app.workspace.onLayoutReady(() => {
            this.applyAINodeStyling();
        });
        
        // Register keyboard shortcuts
        this.registerHotkeys();
        
        // Register event to show/hide floating button based on active view
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', (leaf) => {
                this.updateFloatingButton(leaf);
            })
        );
    }
    
    /**
     * Registers keyboard shortcuts for plugin commands.
     * Uses the shortcuts defined in plugin settings.
     */
    registerHotkeys() {
        // Register keyboard event listener
        this.registerEvent(
            this.app.workspace.on('keydown', (evt: KeyboardEvent) => {
                // Only process if we're in a canvas view
                const activeLeaf = this.app.workspace.activeLeaf;
                if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
                    return;
                }
                
                // Check for each shortcut
                if (this.isHotkeyPressed(evt, this.settings.keyboardShortcuts.askAI)) {
                    evt.preventDefault();
                    this.askAI();
                }
                
                if (this.isHotkeyPressed(evt, this.settings.keyboardShortcuts.generateQuestions)) {
                    evt.preventDefault();
                    this.generateQuestions();
                }
                
                if (this.isHotkeyPressed(evt, this.settings.keyboardShortcuts.askCustomQuestion)) {
                    evt.preventDefault();
                    this.askCustomQuestion();
                }
                
                if (this.isHotkeyPressed(evt, this.settings.keyboardShortcuts.createFlashcards)) {
                    evt.preventDefault();
                    this.createFlashcards();
                }
                
                if (this.isHotkeyPressed(evt, this.settings.keyboardShortcuts.multiNodePrompt)) {
                    evt.preventDefault();
                    this.multiNodePrompt();
                }
            })
        );
    }
    
    /**
     * Checks if a keyboard event matches a hotkey string.
     * Handles modifier keys (Ctrl, Alt, Shift, Meta) and the main key.
     * 
     * @param evt The keyboard event to check
     * @param hotkey The hotkey string (e.g., "Ctrl+Alt+A")
     * @return True if the event matches the hotkey
     */
    isHotkeyPressed(evt: KeyboardEvent, hotkey: string): boolean {
        if (!hotkey) return false;
        
        const keys = hotkey.split('+');
        const mainKey = keys.pop()?.toLowerCase();
        
        // Check if the main key matches
        if (!mainKey || evt.key.toLowerCase() !== mainKey.toLowerCase()) {
            return false;
        }
        
        // Check modifiers
        const hasAlt = keys.includes('Alt');
        const hasCtrl = keys.includes('Ctrl');
        const hasShift = keys.includes('Shift');
        const hasMeta = keys.includes('Meta');
        
        return (
            (!hasAlt || evt.altKey) &&
            (!hasCtrl || evt.ctrlKey) &&
            (!hasShift || evt.shiftKey) &&
            (!hasMeta || evt.metaKey)
        );
    }
    
    /**
     * Updates the floating action button based on the active view.
     * Shows the button only in Canvas views.
     * 
     * @param leaf The active workspace leaf
     */
    updateFloatingButton(leaf: WorkspaceLeaf | null) {
        // Remove existing button if any
        if (this.floatingButton) {
            this.floatingButton.remove();
            this.floatingButton = null;
        }
        
        // Check if we're in a canvas view
        if (!leaf || !leaf.view || !(leaf.view as any).canvas) {
            return;
        }
        
        // Create new floating button with actions
        this.floatingButton = new FloatingActionButton([
            {
                icon: 'message-square',
                label: 'Ask AI',
                onClick: () => this.askAI()
            },
            {
                icon: 'help-circle',
                label: 'Generate Questions',
                onClick: () => this.generateQuestions()
            },
            {
                icon: 'edit-3',
                label: 'Ask Custom Question',
                onClick: () => this.askCustomQuestion()
            },
            {
                icon: 'layers',
                label: 'Create Flashcards',
                onClick: () => this.createFlashcards()
            },
            {
                icon: 'git-merge',
                label: 'Connect Multiple Nodes',
                onClick: () => this.multiNodePrompt()
            },
            {
                icon: 'link',
                label: 'Ask AI using connected nodes',
                onClick: () => this.connectedNodesPrompt()
            },
            {
                icon: 'book',
                label: 'User Guide',
                onClick: () => this.openUserGuide()
            }
        ], this.app); // Pass app instance to the button
    }
    
    /**
     * Applies custom styling to AI-generated nodes in all canvas views.
     * Adds CSS classes and indicators based on node metadata.
     */
    applyAINodeStyling() {
        // Get all canvas views
        // @ts-ignore - getLeavesOfType exists but TypeScript doesn't know about it
        const canvasViews = (this.app.workspace as any).getLeavesOfType('canvas');
        
        canvasViews.forEach((leaf: WorkspaceLeaf) => {
            const canvas = (leaf.view as any).canvas;
            if (!canvas) return;
            
            const data = canvas.getData();
            
            // Find all AI-generated nodes
            data.nodes.forEach((node: any) => {
                if (node.metadata?.isAIGenerated) {
                    // Find the DOM element for this node
                    const nodeEl = document.querySelector(`[data-node-id="${node.id}"]`);
                    if (!nodeEl) return;
                    
                    // Add a class based on the generation type
                    nodeEl.classList.add('rig-ai-generated');
                    if (node.metadata.generationType) {
                        nodeEl.classList.add(`rig-ai-${node.metadata.generationType}`);
                    }
                    
                    // Add a small AI icon to the node if it doesn't already have one
                    if (!nodeEl.querySelector('.rig-ai-indicator')) {
                        const indicator = document.createElement('div');
                        indicator.className = 'rig-ai-indicator';
                        indicator.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,10.5A1.5,1.5 0 0,1 13.5,12A1.5,1.5 0 0,1 12,13.5A1.5,1.5 0 0,1 10.5,12A1.5,1.5 0 0,1 12,10.5M7.5,10.5A1.5,1.5 0 0,1 9,12A1.5,1.5 0 0,1 7.5,13.5A1.5,1.5 0 0,1 6,12A1.5,1.5 0 0,1 7.5,10.5M16.5,10.5A1.5,1.5 0 0,1 18,12A1.5,1.5 0 0,1 16.5,13.5A1.5,1.5 0 0,1 15,12A1.5,1.5 0 0,1 16.5,10.5Z" /></svg>`;
                        nodeEl.appendChild(indicator);
                    }
                }
            });
        });
    }
    
    /**
     * Loads plugin settings from Obsidian's data storage.
     */
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    
    /**
     * Saves plugin settings to Obsidian's data storage.
     */
    async saveSettings() {
        await this.saveData(this.settings);
    }
    
    /**
     * Loads custom CSS styles for the plugin.
     * Creates a style element and adds it to the document head.
     */
    loadStyles() {
        // Create a style element
        const styleEl = document.createElement('style');
        styleEl.id = 'rig-augmented-canvas-styles';
        
        // Add the CSS content
        styleEl.textContent = `
/* Rig Augmented Canvas Plugin Styles */

/* Node styling */
/* User-generated node styling */
[data-node-id]:not(.rig-ai-generated) {
    border: 2px solid #f59e0b !important; /* Amber color for user content */
    border-radius: 5px !important;
}

/* AI-generated node styling */
.rig-ai-generated {
    background: linear-gradient(135deg, rgba(147, 197, 253, 0.1), rgba(196, 181, 253, 0.1)) !important;
    border: 1px solid rgba(147, 197, 253, 0.3) !important;
    border-radius: 5px !important;
}

.rig-ai-response {
    border-left: 3px solid #8b5cf6 !important;
}

.rig-ai-question {
    border-left: 3px solid #3b82f6 !important;
}

.rig-ai-prompt {
    border-left: 3px solid #10b981 !important;
}

.rig-ai-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    color: #8b5cf6;
    opacity: 0.7;
}

.theme-dark .rig-ai-indicator {
    color: #a78bfa;
}

/* Menu styling */
.rig-menu-section-header {
    font-weight: bold;
    color: var(--text-accent);
    margin-top: 4px;
    margin-bottom: 4px;
    opacity: 0.8;
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Loading indicator styles */
.rig-loading-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 5px;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rig-spinner svg {
    animation: rig-spin 1s linear infinite;
}

@keyframes rig-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.rig-status-text {
    font-size: 14px;
    color: var(--text-normal);
}

/* Floating action button styles */
.rig-floating-button-container {
    position: fixed;
    z-index: 1000;
    display: flex;
    align-items: center;
}

.rig-floating-button {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background-color 0.2s;
}

.rig-floating-button:hover {
    transform: scale(1.05);
    background-color: var(--interactive-accent-hover);
}

.rig-floating-button.active {
    transform: rotate(45deg);
}

.rig-floating-menu {
    position: relative;
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 10px;
    background-color: var(--background-primary);
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    border: 1px solid var(--background-modifier-border);
    margin-left: 10px;
}

.rig-floating-action {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background-color 0.2s;
}

.rig-floating-action:hover {
    transform: scale(1.1);
    background-color: var(--interactive-accent-hover);
}
`;
        
        // Add to document head
        document.head.appendChild(styleEl);
        
        // Register for cleanup
        this.register(() => {
            styleEl.remove();
        });
    }
    
    /**
     * Called when the plugin is unloaded.
     * Cleans up resources and UI elements.
     */
    onunload() {
        // Clean up loading indicator
        if (this.loadingIndicator) {
            this.loadingIndicator.remove();
        }
        
        // Clean up floating button
        if (this.floatingButton) {
            this.floatingButton.remove();
        }
        
        console.log("Rig Augmented Canvas plugin unloaded");
    }
}
