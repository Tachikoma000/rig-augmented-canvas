/**
 * API client module for communicating with the WebAssembly module.
 * Handles sending requests and processing responses for AI operations.
 */

import { Notice } from "obsidian";
import { RigAugmentedCanvasSettings } from "./types";
import { LoadingIndicator } from "./ui/loading_indicator";

// Import the WebAssembly module
// These imports will be resolved after building the WebAssembly module
// @ts-ignore
import * as wasm from "../../pkg/rig_augmented_canvas";
// @ts-ignore
import wasmbin from "../../pkg/rig_augmented_canvas_bg.wasm";

/**
 * Response from the WebAssembly module for a prompt request.
 */
export interface PromptResponse {
    response: string;
}

/**
 * Represents a single flashcard with front (question) and back (answer) sides.
 */
export interface Flashcard {
    front: string;
    back: string;
}

/**
 * Response from the WebAssembly module for a flashcards generation request.
 */
export interface FlashcardsResponse {
    filename: string;
    flashcards: Flashcard[];
}

/**
 * Request to the WebAssembly module for a multi-node prompt.
 * Includes content from multiple nodes and a custom prompt.
 */
export interface MultiNodePromptRequest {
    nodes: {
        id: string;
        content: string;
    }[];
    prompt: string;
    system_prompt?: string;
}

/**
 * Client for communicating with the Rig Augmented Canvas WebAssembly module.
 * Provides methods for sending prompts, generating questions, and creating flashcards.
 */
export class RigApiClient {
    settings: RigAugmentedCanvasSettings;
    loadingIndicator?: LoadingIndicator;
    // @ts-ignore - This will be resolved after building the WebAssembly module
    wasmModule: any = null;
    wasmInitialized: boolean = false;
    
    /**
     * Creates a new API client with the specified settings.
     * 
     * @param settings The plugin settings
     */
    constructor(settings: RigAugmentedCanvasSettings) {
        this.settings = settings;
        this.initWasm();
    }
    
    /**
     * Initializes the WebAssembly module.
     */
    private async initWasm() {
        try {
            // Initialize the WebAssembly module
            await wasm.default(Promise.resolve(wasmbin));
            
            // Create a new instance of the WasmRigService
            this.wasmModule = new wasm.WasmRigService();
            
            // Update the model configuration with the user's settings
            if (this.settings.openaiApiKey) {
                const config = this.wasmModule.get_config();
                // Use a default model name since it's not in the settings
                config.model_name = "o3-mini";
                
                // Update the configuration in the WebAssembly module
                await this.wasmModule.update_model_config(JSON.stringify(config));
            }
            
            this.wasmInitialized = true;
            this.logDebug("WebAssembly module initialized");
        } catch (error) {
            console.error("Failed to initialize WebAssembly module:", error);
            new Notice("Failed to initialize AI module. Some features may not work.");
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
            console.log(`[Rig API] ${message}`, data);
        }
    }
    
    /**
     * Ensures the WebAssembly module is initialized before using it.
     * Throws an error if initialization fails.
     */
    private async ensureWasmInitialized(): Promise<void> {
        if (!this.wasmInitialized) {
            // Try to initialize again
            await this.initWasm();
            
            // Check if initialization succeeded
            if (!this.wasmInitialized || !this.wasmModule) {
                throw new Error("WebAssembly module not initialized. Please check your settings and try again.");
            }
        }
    }
    
    /**
     * Sends a prompt to the WebAssembly module and returns the AI-generated response.
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
            // Ensure WebAssembly module is initialized
            await this.ensureWasmInitialized();
            
            // Use the generate_response method directly instead of handle_prompt
            console.log("Using generate_response method directly");
            
            // Send the prompt to the WebAssembly module
            const response = await this.wasmModule.generate_response(
                content,
                systemPrompt,
                this.settings.openaiApiKey
            );
            
            // Log the response for debugging
            console.log("Received response from generate_response:", response);
            
            // Hide loading indicator
            this.loadingIndicator?.hide();
            
            return response;
        } catch (error) {
            // Hide loading indicator on error
            this.loadingIndicator?.hide();
            this.logDebug("Error sending prompt", error);
            
            // Show error notification
            new Notice(`Error: ${error.message || "Failed to generate response"}`);
            
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
            // Ensure WebAssembly module is initialized
            await this.ensureWasmInitialized();
            
            // Generate questions using the WebAssembly module
            const questions = await this.wasmModule.generate_questions(
                content,
                count,
                this.settings.openaiApiKey
            );
            
            this.logDebug("Received questions", questions);
            
            // Hide loading indicator
            this.loadingIndicator?.hide();
            
            return questions;
        } catch (error) {
            // Hide loading indicator on error
            this.loadingIndicator?.hide();
            this.logDebug("Error generating questions", error);
            
            // Show error notification
            new Notice(`Error: ${error.message || "Failed to generate questions"}`);
            
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
            // Ensure WebAssembly module is initialized
            await this.ensureWasmInitialized();
            
            // Generate flashcards using the WebAssembly module
            const flashcardsResponse = await this.wasmModule.generate_flashcards(
                content,
                title,
                this.settings.openaiApiKey
            );
            
            // Convert the response to a FlashcardsResponse
            const flashcards = flashcardsResponse as unknown as FlashcardsResponse;
            
            this.logDebug("Received flashcards", flashcards);
            
            // Hide loading indicator
            this.loadingIndicator?.hide();
            
            return flashcards;
        } catch (error) {
            // Hide loading indicator on error
            this.loadingIndicator?.hide();
            this.logDebug("Error creating flashcards", error);
            
            // Show error notification
            new Notice(`Error: ${error.message || "Failed to create flashcards"}`);
            
            throw error;
        }
    }
    
    /**
     * Sends a multi-node prompt to the WebAssembly module.
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
            // Ensure WebAssembly module is initialized
            await this.ensureWasmInitialized();
            
            // Combine all node contents with the prompt
            let combinedContent = "";
            
            // Add each node's content
            for (let i = 0; i < nodeContents.length; i++) {
                combinedContent += `Node ${i + 1}: ${nodeContents[i].content}\n\n`;
            }
            
            // Add the user's prompt
            combinedContent += `Prompt: ${prompt}`;
            
            console.log("Using generate_response method for multi-node prompt");
            
            // Send the combined content to the WebAssembly module
            const response = await this.wasmModule.generate_response(
                combinedContent,
                systemPrompt,
                this.settings.openaiApiKey
            );
            
            // Log the response for debugging
            console.log("Received multi-node response from generate_response:", response);
            
            // Hide loading indicator
            this.loadingIndicator?.hide();
            
            return response;
        } catch (error) {
            // Hide loading indicator on error
            this.loadingIndicator?.hide();
            this.logDebug("Error sending multi-node prompt", error);
            
            // Show error notification
            new Notice(`Error: ${error.message || "Failed to process multiple nodes"}`);
            
            throw error;
        }
    }
}
