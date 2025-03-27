/**
 * API client module for communicating with the backend server.
 * Handles sending requests and processing responses for AI operations.
 */

import { Notice } from "obsidian";
import { RigAugmentedCanvasSettings } from "./settings";
import { LoadingIndicator } from "./ui/loading_indicator";

/**
 * Response from the backend for a prompt request.
 */
export interface PromptResponse {
    response: string;
}

/**
 * Response from the backend for a questions generation request.
 */
export interface QuestionsResponse {
    questions: string[];
}

/**
 * Represents a single flashcard with front (question) and back (answer) sides.
 */
export interface Flashcard {
    front: string;
    back: string;
}

/**
 * Response from the backend for a flashcards generation request.
 */
export interface FlashcardsResponse {
    filename: string;
    flashcards: Flashcard[];
}

/**
 * Request to the backend for a multi-node prompt.
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
 * Client for communicating with the Rig Augmented Canvas backend.
 * Provides methods for sending prompts, generating questions, and creating flashcards.
 */
export class RigApiClient {
    settings: RigAugmentedCanvasSettings;
    loadingIndicator?: LoadingIndicator;
    
    /**
     * Creates a new API client with the specified settings.
     * 
     * @param settings The plugin settings
     */
    constructor(settings: RigAugmentedCanvasSettings) {
        this.settings = settings;
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
     * Performs a fetch request with a timeout.
     * Aborts the request if it takes longer than the specified timeout.
     * 
     * @param url The URL to fetch
     * @param options The fetch options
     * @param timeout The timeout in milliseconds
     * @return The fetch response
     */
    private async fetchWithTimeout(url: string, options: RequestInit, timeout = 30000): Promise<Response> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }
    
    /**
     * Sends a prompt to the backend and returns the AI-generated response.
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
            const response = await this.fetchWithTimeout(`${this.settings.backendUrl}/api/prompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-OpenAI-Key': this.settings.openaiApiKey || '',
                },
                body: JSON.stringify({ 
                    content,
                    system_prompt: systemPrompt 
                }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const data = await response.json() as PromptResponse;
            this.logDebug("Received response", data);
            
            // Hide loading indicator
            this.loadingIndicator?.hide();
            
            return data.response;
        } catch (error) {
            // Hide loading indicator on error
            this.loadingIndicator?.hide();
            this.logDebug("Error sending prompt", error);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. The backend service might be unavailable.');
            }
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
            const response = await this.fetchWithTimeout(`${this.settings.backendUrl}/api/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-OpenAI-Key': this.settings.openaiApiKey || '',
                },
                body: JSON.stringify({ 
                    content,
                    count
                }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const data = await response.json() as QuestionsResponse;
            this.logDebug("Received questions", data);
            
            // Hide loading indicator
            this.loadingIndicator?.hide();
            
            return data.questions;
        } catch (error) {
            // Hide loading indicator on error
            this.loadingIndicator?.hide();
            this.logDebug("Error generating questions", error);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. The backend service might be unavailable.');
            }
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
            const response = await this.fetchWithTimeout(`${this.settings.backendUrl}/api/flashcards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-OpenAI-Key': this.settings.openaiApiKey || '',
                },
                body: JSON.stringify({ 
                    content,
                    title
                }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const data = await response.json() as FlashcardsResponse;
            this.logDebug("Received flashcards", data);
            
            // Hide loading indicator
            this.loadingIndicator?.hide();
            
            return data;
        } catch (error) {
            // Hide loading indicator on error
            this.loadingIndicator?.hide();
            this.logDebug("Error creating flashcards", error);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. The backend service might be unavailable.');
            }
            throw error;
        }
    }
    
    /**
     * Sends a multi-node prompt to the backend.
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
            const response = await this.fetchWithTimeout(`${this.settings.backendUrl}/api/prompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-OpenAI-Key': this.settings.openaiApiKey || '',
                },
                body: JSON.stringify({ 
                    nodes: nodeContents,
                    prompt,
                    system_prompt: systemPrompt 
                } as MultiNodePromptRequest),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const data = await response.json() as PromptResponse;
            this.logDebug("Received response", data);
            
            // Hide loading indicator
            this.loadingIndicator?.hide();
            
            return data.response;
        } catch (error) {
            // Hide loading indicator on error
            this.loadingIndicator?.hide();
            this.logDebug("Error sending multi-node prompt", error);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. The backend service might be unavailable.');
            }
            throw error;
        }
    }
}
