import { App, Modal, Setting } from "obsidian";

export class QuestionsModal extends Modal {
    questions: string[];
    onChoose: (question: string) => void;

    constructor(app: App, questions: string[], onChoose: (question: string) => void) {
        super(app);
        this.questions = questions;
        this.onChoose = onChoose;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: "Generated Questions" });

        if (this.questions.length === 0) {
            contentEl.createEl("p", { text: "No questions were generated." });
            return;
        }

        for (const question of this.questions) {
            new Setting(contentEl)
                .setName(question)
                .addButton(button => button
                    .setButtonText("Ask")
                    .onClick(() => {
                        this.onChoose(question);
                        this.close();
                    }));
        }

        new Setting(contentEl)
            .addButton(button => button
                .setButtonText("Cancel")
                .onClick(() => {
                    this.close();
                }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
