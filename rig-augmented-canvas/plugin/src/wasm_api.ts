/**
 * WASM API client module for communicating with the Rig backend via WebAssembly.
 * Handles sending requests and processing responses for AI operations without requiring a local HTTP server.
 */

import { Notice } from "obsidian";
import { RigAugmentedCanvasSettings } from "./settings";
import { LoadingIndicator } from "./ui/loading_indicator";
import { PromptResponse, QuestionsResponse, Flashcard, FlashcardsResponse, MultiNodePromptRequest } from "./api";
import type { WasmRigService } from "worker";

/**
 * Client for communicating with the Rig Augmented Canvas backend via WebAssembly.
 * Provides methods for sending prompts, generating questions, and creating flashcards.
 */
export class WasmApiClient {
    settings: RigAugmentedCanvasSettings;
    loadingIndicator?: LoadingIndicator;
    wasmModule: any;
    rigService?: WasmRigService;
    isInitialized: boolean = false;
    
    /**
     * Creates a new WASM API client with the specified settings.
     * 
     * @param settings The plugin settings
     */
    constructor(settings: RigAugmentedCanvasSettings) {
        this.settings = settings;
    }
    
    /**
     * Initializes the WASM module.
     * This must be called before any other methods.
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;
        
        try {
            this.logDebug("Initializing WASM module");
            
            // In Obsidian, we need to use a more direct approach
            // First, check if the global window object has our module
            if (!(window as any).workerWasm) {
                this.logDebug("Loading worker WASM module via script tag");
                
                // Create a promise that will resolve when the script is loaded and the module is ready
                const loadPromise = new Promise<void>((resolve, reject) => {
                    // Listen for the custom event that signals the module is loaded
                    window.addEventListener('wasm-module-loaded', () => {
                        this.logDebug("Received wasm-module-loaded event");
                        resolve();
                    }, { once: true });
                    
                    // Create a script element
                    const script = document.createElement('script');
                    script.src = 'worker.js';
                    script.type = 'text/javascript';
                    script.onload = () => {
                        this.logDebug("Worker script loaded successfully");
                        console.log("Worker script loaded successfully");
                        // Note: We don't resolve here, we wait for the wasm-module-loaded event
                    };
                    script.onerror = (e) => {
                        this.logDebug("Error loading worker script", e);
                        console.error("Error loading worker script", e);
                        reject(new Error("Failed to load worker.js script"));
                    };
                    
                    // Add the script to the document
                    document.head.appendChild(script);
                    
                    // Set a timeout in case the event never fires
                    setTimeout(() => {
                        if (!(window as any).workerWasm) {
                            reject(new Error("Timed out waiting for WASM module to load"));
                        } else {
                            resolve(); // Module is available but event didn't fire
                        }
                    }, 30000); // 30 second timeout
                });
                
                // Wait for the script to load and the module to be ready
                await loadPromise;
            }
            
            // Check if the module is now available
            if (!(window as any).workerWasm) {
                throw new Error("Worker WASM module not found after loading script");
            }
            
            // Use the globally loaded module
            this.wasmModule = (window as any).workerWasm;
            
            // Initialize the WASM module
            this.logDebug("Initializing WASM module default function");
            console.log("Initializing WASM module default function");
            await this.wasmModule.default();
            this.logDebug("WASM module default function initialized");
            console.log("WASM module default function initialized");
            
            // Create a new RigService instance
            this.logDebug("Creating WasmRigService instance");
            console.log("Creating WasmRigService instance");
            this.rigService = new this.wasmModule.WasmRigService();
            this.logDebug("WasmRigService instance created");
            console.log("WasmRigService instance created");
            
            this.isInitialized = true;
            this.logDebug("WASM module initialized successfully");
        } catch (error) {
            this.logDebug("Error initializing WASM module", error);
            throw new Error(`Failed to initialize WASM module: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Sets the loading indicator to show during API requests.
     * 
     * @param indicator The loading indicator instance
     */
    setLoadingIndicator(indicator: LoadingIndicator) {
        this.loadingIndicator = indicator;
    }
    
    /**
     * Logs debug messages if debug mode is enabled in settings.
     * 
     * @param message The message to log
     * @param data Optional data to log
     */
    private logDebug(message: string, data?: any): void {
        if (this.settings.debug) {
            console.log(`[Rig WASM API] ${message}`, data);
        }
    }
    
    /**
     * Ensures the WASM module is initialized before making any requests.
     * Throws an error if initialization fails.
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        if (!this.rigService) {
            throw new Error("WASM module not initialized");
        }
    }
    
    /**
     * Sends a prompt to the WASM backend and returns the AI-generated response.
     * 
     * @param content The text content to send
     * @param systemPrompt Optional system prompt to guide the AI
     * @return The AI-generated response
     */
    async sendPrompt(content: string, systemPrompt?: string): Promise<string> {
        this.logDebug("Sending prompt", { content, systemPrompt });
        
        // Show loading indicator
        this.loadingIndicator?.show("Generating response...");
        
        try {
            await this.ensureInitialized();
            
            // Create the prompt request
            const promptRequest = {
                content,
                system_prompt: systemPrompt
            };
            
            // Send the prompt to the WASM module
            const response = await this.rigService!.generate_response(
                content,
                systemPrompt || null,
                this.settings.openaiApiKey || null
            );
            
            this.logDebug("Received response", response);
            
            // Hide loading indicator
            this.loadingIndicator?.hide();
            
            return response;
        } catch (error) {
            // Hide loading indicator on error
            this.loadingIndicator?.hide();
            this.logDebug("Error sending prompt", error);
            throw error;
        }
    }
    
    /**
     * Generates questions about the given content.
     * 
     * @param content The text content to generate questions about
     * @param count The number of questions to generate (default: 5)
     * @return An array of AI-generated questions
     */
    async generateQuestions(content: string, count: number = 5): Promise<string[]> {
        this.logDebug("Generating questions", { content, count });
        
        // Show loading indicator
        this.loadingIndicator?.show("Generating questions...");
        
        try {
            await this.ensureInitialized();
            
            // Generate questions using the WASM module
            const questions = await this.rigService!.generate_questions(
                content,
                count,
                this.settings.openaiApiKey || null
            );
            
            this.logDebug("Received questions", questions);
            
            // Hide loading indicator
            this.loadingIndicator?.hide();
            
            return questions;
        } catch (error) {
            // Hide loading indicator on error
            this.loadingIndicator?.hide();
            this.logDebug("Error generating questions", error);
            throw error;
        }
    }
    
    /**
     * Creates flashcards based on the given content.
     * 
     * @param content The text content to create flashcards from
     * @param title Optional title for the flashcards
     * @return The flashcards response with filename and flashcards array
     */
    async createFlashcards(content: string, title?: string): Promise<FlashcardsResponse> {
        this.logDebug("Creating flashcards", { content, title });
        
        // Show loading indicator
        this.loadingIndicator?.show("Creating flashcards...");
        
        try {
            await this.ensureInitialized();
            
            // Generate flashcards using the WASM module
            const flashcardsResult = await this.rigService!.generate_flashcards(
                content,
                title || null,
                this.settings.openaiApiKey || null
            );
            
            this.logDebug("Received flashcards", flashcardsResult);
            
            // Hide loading indicator
            this.loadingIndicator?.hide();
            
            return flashcardsResult;
        } catch (error) {
            // Hide loading indicator on error
            this.loadingIndicator?.hide();
            this.logDebug("Error creating flashcards", error);
            throw error;
        }
    }
    
    /**
     * Sends a multi-node prompt to the WASM backend.
     * Combines content from multiple nodes with a custom prompt.
     * 
     * @param nodeContents Array of node contents with IDs
     * @param prompt The custom prompt to use
     * @param systemPrompt Optional system prompt to guide the AI
     * @return The AI-generated response
     */
    async sendMultiNodePrompt(nodeContents: { id: string; content: string }[], prompt: string, systemPrompt?: string): Promise<string> {
        this.logDebug("Sending multi-node prompt", { nodeContents, prompt, systemPrompt });
        
        // Show loading indicator
        this.loadingIndicator?.show("Processing multiple nodes...");
        
        try {
            await this.ensureInitialized();
            
            // Create the multi-node prompt request
            const promptRequest = {
                nodes: nodeContents,
                prompt,
                system_prompt: systemPrompt
            };
            
            // Combine all node contents with the prompt
            let combinedContent = "";
            
            // Add each node's content
            for (let i = 0; i < nodeContents.length; i++) {
                combinedContent += `Node ${i + 1}: ${nodeContents[i].content}\n\n`;
            }
            
            // Add the user's prompt
            combinedContent += `Prompt: ${prompt}`;
            
            // Send the prompt to the WASM module
            const response = await this.rigService!.generate_response(
                combinedContent,
                systemPrompt || null,
                this.settings.openaiApiKey || null
            );
            
            this.logDebug("Received response", response);
            
            // Hide loading indicator
            this.loadingIndicator?.hide();
            
            return response;
        } catch (error) {
            // Hide loading indicator on error
            this.loadingIndicator?.hide();
            this.logDebug("Error sending multi-node prompt", error);
            throw error;
        }
    }
}
