import { setIcon, WorkspaceLeaf } from "obsidian";

/**
 * A floating action button that can be used to trigger actions.
 * It appears as a circular button in the bottom left corner of the screen.
 * When clicked, it expands upward to show a menu of actions.
 */
export class FloatingActionButton {
    private containerEl: HTMLElement;
    private buttonEl: HTMLElement;
    private menuEl: HTMLElement;
    private isMenuOpen: boolean = false;
    
    /**
     * Create a new floating action button.
     * @param actions An array of actions to display in the menu.
     */
    constructor(
        private actions: Array<{
            icon: string;
            label: string;
            onClick: () => void;
        }>,
        private app?: any
    ) {
        // Create container
        this.containerEl = document.createElement('div');
        this.containerEl.className = 'rig-floating-button-container';
        
        // Position at bottom left (shifted 20px to the right)
        this.containerEl.style.position = 'absolute'; // Use absolute instead of fixed
        this.containerEl.style.bottom = '20px';
        this.containerEl.style.left = '40px'; // Increased from 20px to 40px
        this.containerEl.style.transform = 'none';
        this.containerEl.style.zIndex = '1000';
        
        // Create main button
        this.buttonEl = document.createElement('button');
        this.buttonEl.className = 'rig-floating-button';
        this.buttonEl.setAttribute('aria-label', 'Rig Augmented Canvas');
        
        // Create a simplified version of the logo as SVG
        const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgIcon.setAttribute('viewBox', '0 0 100 100');
        svgIcon.setAttribute('width', '30');
        svgIcon.setAttribute('height', '30');
        
        // Create a simplified version of the logo
        // Black background circle
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', '50');
        bgCircle.setAttribute('cy', '50');
        bgCircle.setAttribute('r', '50');
        bgCircle.setAttribute('fill', '#000000');
        
        // Mint green dot
        const greenDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        greenDot.setAttribute('cx', '50');
        greenDot.setAttribute('cy', '50');
        greenDot.setAttribute('r', '15');
        greenDot.setAttribute('fill', '#97FE97');
        greenDot.classList.add('rig-pulsing-dot');
        
        svgIcon.appendChild(bgCircle);
        svgIcon.appendChild(greenDot);
        
        this.buttonEl.appendChild(svgIcon);
        this.containerEl.appendChild(this.buttonEl);
        
        // Create menu
        this.menuEl = document.createElement('div');
        this.menuEl.className = 'rig-floating-menu';
        this.menuEl.style.display = 'none'; // Start hidden
        this.menuEl.style.flexDirection = 'column'; // Vertical layout
        this.menuEl.style.marginLeft = '0'; // Remove horizontal margin
        this.menuEl.style.bottom = '60px'; // Position above the button
        this.menuEl.style.left = '5px'; // Slight offset to center with the button
        this.menuEl.style.position = 'absolute'; // Ensure it's absolutely positioned
        this.containerEl.appendChild(this.menuEl);
        
        // Add actions to menu with custom tooltips
        this.actions.forEach(action => {
            const actionEl = document.createElement('button');
            actionEl.className = 'rig-floating-action';
            setIcon(actionEl, action.icon);
            
            // Create custom tooltip instead of using title attribute
            const tooltip = document.createElement('div');
            tooltip.className = 'rig-tooltip';
            tooltip.textContent = action.label;
            actionEl.appendChild(tooltip);
            
            actionEl.addEventListener('click', (e) => {
                e.stopPropagation();
                action.onClick();
                this.toggleMenu();
            });
            
            this.menuEl.appendChild(actionEl);
        });
        
        // Toggle menu on button click
        this.buttonEl.addEventListener('click', () => {
            this.toggleMenu();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.containerEl.contains(e.target as Node)) {
                this.toggleMenu(false);
            }
        });
        
        // Add to canvas view container instead of document body
        this.addToCanvasContainer();
        
        // Listen for workspace layout changes to reposition the button
        if (this.app) {
            this.app.workspace.onLayoutChange(() => {
                this.updatePosition();
            });
        }
    }
    
    /**
     * Toggle the menu open or closed.
     * @param force If provided, force the menu to be open or closed.
     */
    toggleMenu(force?: boolean) {
        const newState = force !== undefined ? force : !this.isMenuOpen;
        
        // Update state
        this.isMenuOpen = newState;
        
        // Update display without moving the button
        this.menuEl.style.display = this.isMenuOpen ? 'flex' : 'none';
        
        // Only rotate the button, don't change its position
        if (this.isMenuOpen) {
            this.buttonEl.classList.add('active');
        } else {
            this.buttonEl.classList.remove('active');
        }
    }
    
    /**
     * Add the button to the canvas container
     */
    private addToCanvasContainer() {
        // Find the canvas view container
        const canvasView = this.findCanvasViewContainer();
        if (canvasView) {
            canvasView.appendChild(this.containerEl);
        } else {
            // Fallback to document body if canvas view not found
            document.body.appendChild(this.containerEl);
        }
    }
    
    /**
     * Find the canvas view container element
     */
    private findCanvasViewContainer(): HTMLElement | null {
        // Try to find the canvas view container
        const canvasView = document.querySelector('.canvas-wrapper');
        return canvasView as HTMLElement;
    }
    
    /**
     * Update the button position based on the canvas view
     */
    updatePosition() {
        // Remove from current parent
        if (this.containerEl.parentElement) {
            this.containerEl.parentElement.removeChild(this.containerEl);
        }
        
        // Re-add to canvas container
        this.addToCanvasContainer();
    }
    
    /**
     * Show the floating action button.
     */
    show() {
        this.containerEl.style.display = 'block';
        // Update position when showing
        this.updatePosition();
        // Ensure menu is closed when shown
        this.toggleMenu(false);
    }
    
    /**
     * Hide the floating action button.
     */
    hide() {
        this.containerEl.style.display = 'none';
        this.toggleMenu(false);
    }
    
    /**
     * Remove the floating action button from the DOM.
     * Call this when the plugin is unloaded.
     */
    remove() {
        this.containerEl.remove();
    }
}
