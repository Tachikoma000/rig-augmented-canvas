import { App, Modal, Setting } from "obsidian";
import { CanvasNode } from "../canvas_utils";

export class MultiNodePromptModal extends Modal {
    onSubmit: (prompt: string) => void;
    promptInput: HTMLTextAreaElement;
    sourceNodes: CanvasNode[];
    
    constructor(app: App, sourceNodes: CanvasNode[], onSubmit: (prompt: string) => void) {
        super(app);
        this.sourceNodes = sourceNodes;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass("rig-augmented-canvas-modal-container");
        
        contentEl.createEl("h2", { text: "Ask AI About Selected Nodes" });
        
        // Show a summary of the selected nodes
        const summaryEl = contentEl.createEl("div", { cls: "rig-augmented-canvas-modal-summary" });
        summaryEl.createEl("p", { 
            text: `You've selected ${this.sourceNodes.length} node${this.sourceNodes.length > 1 ? 's' : ''}.` 
        });
        
        // Create the prompt input
        const promptContainer = contentEl.createEl("div");
        promptContainer.createEl("p", { 
            text: "Enter your prompt below. The content from all selected nodes will be included as context." 
        });
        
        this.promptInput = contentEl.createEl("textarea");
        this.promptInput.addClass("rig-augmented-canvas-modal-textarea");
        this.promptInput.placeholder = "Enter your prompt here...";
        
        // Add keydown event listener for Ctrl+Enter
        this.promptInput.addEventListener("keydown", (event) => {
            if (event.ctrlKey && event.key === "Enter") {
                event.preventDefault();
                this.submit();
            }
        });
        
        // Add buttons
        new Setting(contentEl)
            .addButton(button => button
                .setButtonText("Submit")
                .setCta()
                .onClick(() => {
                    this.submit();
                }))
            .addButton(button => button
                .setButtonText("Cancel")
                .onClick(() => {
                    this.close();
                }));
    }
    
    submit() {
        const prompt = this.promptInput.value.trim();
        if (prompt) {
            this.onSubmit(prompt);
            this.close();
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
