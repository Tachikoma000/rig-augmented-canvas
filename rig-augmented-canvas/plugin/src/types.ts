/**
 * Types module defines the core data structures used throughout the plugin.
 * This includes settings interfaces and default values.
 */

/**
 * Settings interface for the Rig Augmented Canvas plugin.
 * Contains all configurable options for the plugin.
 */
export interface RigAugmentedCanvasSettings {
    /**
     * Whether to use WebAssembly for AI processing instead of HTTP backend
     * When enabled, no local server is required
     */
    useWasm: boolean;
    
    /**
     * The URL of the backend service
     * Only used when useWasm is false
     * Default: http://localhost:3000
     */
    backendUrl: string;
    
    /**
     * The system prompt to use when generating responses
     * This guides the AI's behavior for all interactions
     */
    systemPrompt: string;
    
    /**
     * The folder to save flashcards in
     * Relative to the Obsidian vault root
     */
    flashcardsFolder: string;
    
    /**
     * Enable debug output in the console
     * Useful for troubleshooting API issues
     */
    debug: boolean;
    
    /**
     * The maximum depth of ancestor notes to include
     * 0 means no limit on the depth of connections
     */
    maxDepth: number;
    
    /**
     * OpenAI API key for accessing AI services
     * Can be left empty to use the backend's default key
     */
    openaiApiKey: string;
    
    /**
     * Keyboard shortcuts for plugin commands
     * Format: modifier+key (e.g., "Alt+A")
     */
    keyboardShortcuts: {
        askAI: string;
        generateQuestions: string;
        askCustomQuestion: string;
        createFlashcards: string;
        multiNodePrompt: string;
    };
}

/**
 * Default settings for the plugin.
 * Used when the plugin is first installed or reset.
 */
export const DEFAULT_SETTINGS: RigAugmentedCanvasSettings = {
    useWasm: true,
    backendUrl: "http://localhost:3000",
    systemPrompt: "You are a helpful assistant.",
    flashcardsFolder: "Flashcards",
    debug: false,
    maxDepth: 0,
    openaiApiKey: "",
    keyboardShortcuts: {
        askAI: "Alt+A",
        generateQuestions: "Alt+Q",
        askCustomQuestion: "Alt+C",
        createFlashcards: "Alt+F",
        multiNodePrompt: "Alt+M"
    }
};

/**
 * Interface for plugin functionality required by other modules.
 * Provides access to settings and event registration.
 */
export interface PluginInterface {
    settings: RigAugmentedCanvasSettings;
    saveSettings(): Promise<void>;
    register(cb: () => void): void;
    registerEvent(evt: any): void;
}
