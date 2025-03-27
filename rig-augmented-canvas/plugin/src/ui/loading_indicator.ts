import { setIcon } from "obsidian";

/**
 * A simple loading indicator that can be shown and hidden.
 * It appears as a small overlay in the bottom right corner of the screen.
 */
export class LoadingIndicator {
    private element: HTMLElement;
    private spinnerElement: HTMLElement;
    private textElement: HTMLElement;
    
    constructor() {
        // Create the main container
        this.element = document.createElement('div');
        this.element.className = 'rig-loading-indicator';
        this.element.style.display = 'none';
        
        // Create the spinner
        this.spinnerElement = document.createElement('div');
        this.spinnerElement.className = 'rig-spinner';
        setIcon(this.spinnerElement, 'loader');
        
        // Create the text element
        this.textElement = document.createElement('div');
        this.textElement.className = 'rig-status-text';
        
        // Assemble the elements
        this.element.appendChild(this.spinnerElement);
        this.element.appendChild(this.textElement);
        
        // Add to the document
        document.body.appendChild(this.element);
    }
    
    /**
     * Show the loading indicator with the specified message.
     * @param message The message to display
     */
    public show(message: string = 'Loading...'): void {
        this.textElement.textContent = message;
        this.element.style.display = 'flex';
    }
    
    /**
     * Hide the loading indicator.
     */
    public hide(): void {
        this.element.style.display = 'none';
    }
    
    /**
     * Remove the loading indicator from the DOM.
     * Call this when the plugin is unloaded.
     */
    public remove(): void {
        this.element.remove();
    }
}
