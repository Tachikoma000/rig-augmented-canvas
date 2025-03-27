import { App, PluginSettingTab, Setting } from "obsidian";
import RigAugmentedCanvasPlugin from "./main";

export interface RigAugmentedCanvasSettings {
    backendUrl: string;
    systemPrompt: string;
    maxDepth: number;
    flashcardsFolder: string;
    debug: boolean;
    openaiApiKey: string;
    keyboardShortcuts: {
        askAI: string;
        generateQuestions: string;
        askCustomQuestion: string;
        createFlashcards: string;
        multiNodePrompt: string;
    };
}

export const DEFAULT_SETTINGS: RigAugmentedCanvasSettings = {
    backendUrl: "http://localhost:3000",
    systemPrompt: "You are a helpful assistant. Respond in markdown format.",
    maxDepth: 3,
    flashcardsFolder: "Flashcards",
    debug: false,
    openaiApiKey: "",
    keyboardShortcuts: {
        askAI: "Alt+A",
        generateQuestions: "Alt+Q",
        askCustomQuestion: "Alt+C",
        createFlashcards: "Alt+F",
        multiNodePrompt: "Alt+M"
    }
};

export class SettingsTab extends PluginSettingTab {
    plugin: RigAugmentedCanvasPlugin;

    constructor(app: App, plugin: RigAugmentedCanvasPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Backend URL")
            .setDesc("The URL of the Rig-Augmented Canvas backend service")
            .addText(text => text
                .setPlaceholder("http://localhost:3000")
                .setValue(this.plugin.settings.backendUrl)
                .onChange(async (value) => {
                    this.plugin.settings.backendUrl = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("OpenAI API Key")
            .setDesc("Your OpenAI API key for accessing AI services")
            .addText(text => text
                .setPlaceholder("sk-...")
                .setValue(this.plugin.settings.openaiApiKey)
                .onChange(async (value) => {
                    this.plugin.settings.openaiApiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Default system prompt")
            .setDesc("The system prompt sent with each request to the API")
            .addTextArea(component => {
                component.inputEl.rows = 6;
                component.inputEl.addClass("rig-augmented-canvas-settings-prompt");
                component.setValue(this.plugin.settings.systemPrompt);
                component.onChange(async (value) => {
                    this.plugin.settings.systemPrompt = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Max depth")
            .setDesc("The maximum depth of ancestor notes to include. 0 means no limit.")
            .addText(text => text
                .setValue(this.plugin.settings.maxDepth.toString())
                .onChange(async (value) => {
                    const parsed = parseInt(value);
                    if (!isNaN(parsed)) {
                        this.plugin.settings.maxDepth = parsed;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl)
            .setName("Flashcards folder")
            .setDesc("The folder where flashcards will be saved")
            .addText(text => text
                .setValue(this.plugin.settings.flashcardsFolder)
                .onChange(async (value) => {
                    this.plugin.settings.flashcardsFolder = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Debug output")
            .setDesc("Enable debug output in the console")
            .addToggle(component => {
                component
                    .setValue(this.plugin.settings.debug)
                    .onChange(async (value) => {
                        this.plugin.settings.debug = value;
                        await this.plugin.saveSettings();
                    });
            });
            
        // Add keyboard shortcuts section
        containerEl.createEl('h3', {text: 'Keyboard Shortcuts'});
        
        new Setting(containerEl)
            .setName("Ask AI")
            .setDesc("Keyboard shortcut for Ask AI command")
            .addText(text => text
                .setValue(this.plugin.settings.keyboardShortcuts.askAI)
                .onChange(async (value) => {
                    this.plugin.settings.keyboardShortcuts.askAI = value;
                    await this.plugin.saveSettings();
                }));
                
        new Setting(containerEl)
            .setName("Generate Questions")
            .setDesc("Keyboard shortcut for Generate Questions command")
            .addText(text => text
                .setValue(this.plugin.settings.keyboardShortcuts.generateQuestions)
                .onChange(async (value) => {
                    this.plugin.settings.keyboardShortcuts.generateQuestions = value;
                    await this.plugin.saveSettings();
                }));
                
        new Setting(containerEl)
            .setName("Ask Custom Question")
            .setDesc("Keyboard shortcut for Ask Custom Question command")
            .addText(text => text
                .setValue(this.plugin.settings.keyboardShortcuts.askCustomQuestion)
                .onChange(async (value) => {
                    this.plugin.settings.keyboardShortcuts.askCustomQuestion = value;
                    await this.plugin.saveSettings();
                }));
                
        new Setting(containerEl)
            .setName("Create Flashcards")
            .setDesc("Keyboard shortcut for Create Flashcards command")
            .addText(text => text
                .setValue(this.plugin.settings.keyboardShortcuts.createFlashcards)
                .onChange(async (value) => {
                    this.plugin.settings.keyboardShortcuts.createFlashcards = value;
                    await this.plugin.saveSettings();
                }));
                
        new Setting(containerEl)
            .setName("Multi-Node Prompt")
            .setDesc("Keyboard shortcut for Multi-Node Prompt command")
            .addText(text => text
                .setValue(this.plugin.settings.keyboardShortcuts.multiNodePrompt)
                .onChange(async (value) => {
                    this.plugin.settings.keyboardShortcuts.multiNodePrompt = value;
                    await this.plugin.saveSettings();
                }));
    }
}
