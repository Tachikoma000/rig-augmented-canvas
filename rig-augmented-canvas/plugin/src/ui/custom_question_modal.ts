import { App, Modal, Setting } from "obsidian";

export class CustomQuestionModal extends Modal {
    onSubmit: (question: string) => void;
    questionInput: HTMLTextAreaElement;

    constructor(app: App, onSubmit: (question: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass("rig-augmented-canvas-modal-container");
        
        contentEl.createEl("h2", { text: "Ask a Custom Question" });
        
        this.questionInput = contentEl.createEl("textarea");
        this.questionInput.addClass("rig-augmented-canvas-modal-textarea");
        this.questionInput.placeholder = "Enter your question here...";
        
        // Add keydown event listener for Ctrl+Enter
        this.questionInput.addEventListener("keydown", (event) => {
            if (event.ctrlKey && event.key === "Enter") {
                event.preventDefault();
                this.submit();
            }
        });
        
        new Setting(contentEl)
            .addButton(button => button
                .setButtonText("Ask")
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
        const question = this.questionInput.value.trim();
        if (question) {
            this.onSubmit(question);
            this.close();
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
