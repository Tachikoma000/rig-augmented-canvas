import { App, Menu, Notice, setIcon, setTooltip } from "obsidian";
import { around } from "monkey-around";
import RigAugmentedCanvasPlugin from "./main";
import { 
    getActiveCanvas, 
    getSelectedNode, 
    getSelectedNodes, 
    getNodeContent, 
    createResponseNode, 
    createQuestionNode, 
    createPromptNode,
    updateNodeContent,
    getConnectedNodes,
    CanvasView, 
    CanvasNode 
} from "./canvas_utils";
import { QuestionsModal } from "./ui/questions_modal";
import { CustomQuestionModal } from "./ui/custom_question_modal";
import { MultiNodePromptModal } from "./ui/multi_node_prompt_modal";

// Define types for Obsidian Canvas internals
interface ObsidianCanvas {
    Canvas: {
        prototype: {
            showNodeContextMenu: (node: any, event: MouseEvent) => void;
            showSelectionMenu: (event: MouseEvent) => void;
            menu: Menu;
        }
    }
}

// Patch the canvas menu to add our custom menu items
export function patchCanvasMenu(app: App, plugin: RigAugmentedCanvasPlugin) {
    // Use monkey-around to patch the Canvas class
    // Access ObsidianCanvas from the window object with type assertion
    const obsidianCanvas = (window as any).ObsidianCanvas as ObsidianCanvas | undefined;
    
    if (!obsidianCanvas?.Canvas?.prototype) {
        console.log("Could not find ObsidianCanvas.Canvas.prototype, context menu patching skipped");
        return;
    }
    
    const uninstaller = around(obsidianCanvas.Canvas.prototype, {
        // Patch the showNodeContextMenu method
        showNodeContextMenu(old: (node: any, event: MouseEvent) => void) {
            return function(node: any, event: MouseEvent) {
                // Call the original method first
                const result = old.call(this, node, event);
                
                // Get the menu instance from the result
                const menu = this.menu as Menu;
                
                // Add our custom menu items
                menu.addSeparator();
                // Add a disabled item as a section header with improved styling
                menu.addItem((item: any) => {
                    item.setTitle("Rig Augmented Canvas")
                        .setDisabled(true)
                        .setClass("rig-menu-section-header");
                });
                
                // Add "Ask AI" option
                menu.addItem((item: any) => {
                    item.setTitle("Ask AI")
                        .setIcon("message-square")
                        .onClick(() => {
                            plugin.askAI();
                        });
                });
                
                // Add "Ask AI using connected nodes" option
                menu.addItem((item: any) => {
                    item.setTitle("Ask AI using connected nodes")
                        .setIcon("link")
                        .onClick(() => {
                            plugin.connectedNodesPrompt();
                        });
                });
                
                // Add "Generate Questions" option
                menu.addItem((item: any) => {
                    item.setTitle("Generate Questions")
                        .setIcon("help-circle")
                        .onClick(() => {
                            plugin.generateQuestions();
                        });
                });
                
                // Add "Ask Custom Question" option
                menu.addItem((item: any) => {
                    item.setTitle("Ask Custom Question")
                        .setIcon("edit-3")
                        .onClick(() => {
                            plugin.askCustomQuestion();
                        });
                });
                
                // Add "Create Flashcards" option
                menu.addItem((item: any) => {
                    item.setTitle("Create Flashcards")
                        .setIcon("layers")
                        .onClick(() => {
                            plugin.createFlashcards();
                        });
                });
                
                // Add "User Guide" option
                menu.addItem((item: any) => {
                    item.setTitle("User Guide")
                        .setIcon("book")
                        .onClick(() => {
                            plugin.openUserGuide();
                        });
                });
                
                return result;
            };
        },
        
        // Also patch the showSelectionMenu method for multi-node selection
        showSelectionMenu(old: (event: MouseEvent) => void) {
            return function(event: MouseEvent) {
                // Call the original method first
                const result = old.call(this, event);
                
                // Get the menu instance
                const menu = this.menu as Menu;
                
                // Add our custom menu items for multi-node selection
                menu.addSeparator();
                // Add a disabled item as a section header with improved styling
                menu.addItem((item: any) => {
                    item.setTitle("Rig Augmented Canvas")
                        .setDisabled(true)
                        .setClass("rig-menu-section-header");
                });
                
                // Add "Connect and Ask AI" option
                menu.addItem((item: any) => {
                    item.setTitle("Connect and Ask AI")
                        .setIcon("git-merge")
                        .onClick(() => {
                            plugin.multiNodePrompt();
                        });
                });
                
                // Add "User Guide" option
                menu.addItem((item: any) => {
                    item.setTitle("User Guide")
                        .setIcon("book")
                        .onClick(() => {
                            plugin.openUserGuide();
                        });
                });
                
                return result;
            };
        }
    });
    
    // Store the uninstaller for cleanup
    plugin.register(() => uninstaller());
    
    console.log("Rig Augmented Canvas plugin is ready to use via commands and context menu");
}

function addAskAIButton(app: App, plugin: RigAugmentedCanvasPlugin, menuEl: HTMLElement) {
    const buttonEl = createEl("button", "clickable-icon rig-menu-item");
    setTooltip(buttonEl, "Ask AI", {
        placement: "top",
    });
    setIcon(buttonEl, "message-square");
    menuEl.appendChild(buttonEl);
    
    buttonEl.addEventListener("click", async () => {
        await plugin.askAI();
    });
}

function addGenerateQuestionsButton(app: App, plugin: RigAugmentedCanvasPlugin, menuEl: HTMLElement) {
    const buttonEl = createEl("button", "clickable-icon rig-menu-item");
    setTooltip(buttonEl, "Generate Questions", {
        placement: "top",
    });
    setIcon(buttonEl, "help-circle");
    menuEl.appendChild(buttonEl);
    
    buttonEl.addEventListener("click", async () => {
        await plugin.generateQuestions();
    });
}

function addCreateFlashcardsButton(app: App, plugin: RigAugmentedCanvasPlugin, menuEl: HTMLElement) {
    const buttonEl = createEl("button", "clickable-icon rig-menu-item");
    setTooltip(buttonEl, "Create Flashcards", {
        placement: "top",
    });
    setIcon(buttonEl, "layers");
    menuEl.appendChild(buttonEl);
    
    buttonEl.addEventListener("click", async () => {
        await plugin.createFlashcards();
    });
}

export async function handleAskAI(app: App, plugin: RigAugmentedCanvasPlugin) {
    try {
        // Get the active leaf and check if it's a canvas
        const activeLeaf = app.workspace.activeLeaf;
        if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
            new Notice("Please open a canvas view first");
            return;
        }
        
        const canvasView = activeLeaf.view as unknown as CanvasView;
        
        // Get the selected node
        const selectedNode = getSelectedNode(canvasView.canvas);
        if (!selectedNode) {
            new Notice("No node selected. Please select a node in the canvas.");
            return;
        }
        
        // Get the content of the selected node
        const content = await getNodeContent(app, selectedNode);
        if (!content) {
            new Notice("No content to process");
            return;
        }
        
        // Create a prompt node
        const promptNode = createPromptNode(canvasView.canvas, [selectedNode]);
        if (!promptNode) {
            new Notice("Failed to create prompt node");
            return;
        }
        
        // Update the prompt node with a default prompt
        const prompt = "Analyze and explain this content";
        updateNodeContent(canvasView.canvas, promptNode, prompt);
        
        // Send the content to the AI
        new Notice("Asking AI...");
        const response = await plugin.apiClient.sendPrompt(content, plugin.settings.systemPrompt);
        
        // Create a response node connected to the prompt node
        createResponseNode(canvasView.canvas, promptNode, response);
        new Notice("AI response received");
    } catch (error) {
        console.error("Error in handleAskAI:", error);
        new Notice(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function handleGenerateQuestions(app: App, plugin: RigAugmentedCanvasPlugin) {
    try {
        // Get the active leaf and check if it's a canvas
        const activeLeaf = app.workspace.activeLeaf;
        if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
            new Notice("Please open a canvas view first");
            return;
        }
        
        const canvasView = activeLeaf.view as unknown as CanvasView;
        
        // Get the selected node
        const selectedNode = getSelectedNode(canvasView.canvas);
        if (!selectedNode) {
            new Notice("No node selected. Please select a node in the canvas.");
            return;
        }
        
        // Get the content of the selected node
        const content = await getNodeContent(app, selectedNode);
        if (!content) {
            new Notice("No content to process");
            return;
        }
        
        // Generate questions
        new Notice("Generating questions...");
        const questions = await plugin.apiClient.generateQuestions(content);
        
        // Show the questions modal
        new QuestionsModal(app, questions, async (question) => {
            if (!question) return;
            
            new Notice("Asking AI about the question...");
            const answer = await plugin.apiClient.sendPrompt(
                `${content}\n\nQuestion: ${question}`, 
                plugin.settings.systemPrompt
            );
            
            createQuestionNode(canvasView.canvas, selectedNode, question, answer);
            new Notice("AI response received");
        }).open();
    } catch (error) {
        console.error("Error in handleGenerateQuestions:", error);
        new Notice(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function handleAskCustomQuestion(app: App, plugin: RigAugmentedCanvasPlugin) {
    try {
        // Get the active leaf and check if it's a canvas
        const activeLeaf = app.workspace.activeLeaf;
        if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
            new Notice("Please open a canvas view first");
            return;
        }
        
        const canvasView = activeLeaf.view as unknown as CanvasView;
        
        // Get the selected node
        const selectedNode = getSelectedNode(canvasView.canvas);
        if (!selectedNode) {
            new Notice("No node selected. Please select a node in the canvas.");
            return;
        }
        
        // Get the content of the selected node
        const content = await getNodeContent(app, selectedNode);
        if (!content) {
            new Notice("No content to process");
            return;
        }
        
        // Show the custom question modal
        new CustomQuestionModal(app, async (question) => {
            if (!question) return;
            
            try {
                new Notice("Asking AI about the question...");
                const answer = await plugin.apiClient.sendPrompt(
                    `${content}\n\nQuestion: ${question}`, 
                    plugin.settings.systemPrompt
                );
                
                createQuestionNode(canvasView.canvas, selectedNode, question, answer);
                new Notice("AI response received");
            } catch (error) {
                console.error("Error in custom question handler:", error);
                new Notice(`Error: ${error instanceof Error ? error.message : String(error)}`);
            }
        }).open();
    } catch (error) {
        console.error("Error in handleAskCustomQuestion:", error);
        new Notice(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function handleCreateFlashcards(app: App, plugin: RigAugmentedCanvasPlugin) {
    try {
        // Get the active leaf and check if it's a canvas
        const activeLeaf = app.workspace.activeLeaf;
        if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
            new Notice("Please open a canvas view first");
            return;
        }
        
        const canvasView = activeLeaf.view as unknown as CanvasView;
        
        // Get the selected node
        const selectedNode = getSelectedNode(canvasView.canvas);
        if (!selectedNode) {
            new Notice("No node selected. Please select a node in the canvas.");
            return;
        }
        
        // Get the content of the selected node
        const content = await getNodeContent(app, selectedNode);
        if (!content) {
            new Notice("No content to process");
            return;
        }
        
        // Create flashcards
        new Notice("Creating flashcards...");
        const result = await plugin.apiClient.createFlashcards(content);
        
        // Create the flashcards folder if it doesn't exist
        const folderPath = plugin.settings.flashcardsFolder;
        try {
            await app.vault.createFolder(folderPath);
        } catch (e) {
            // Folder might already exist
        }
        
        // Create the flashcards file
        const filePath = `${folderPath}/${result.filename}.md`;
        const fileContent = result.flashcards
            .map(card => `${card.front}::${card.back}`)
            .join("\n\n");
        
        await app.vault.create(filePath, fileContent);
        
        new Notice(`Flashcards created: ${result.filename}`);
    } catch (error) {
        console.error("Error in handleCreateFlashcards:", error);
        new Notice(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function handleConnectedNodesPrompt(app: App, plugin: RigAugmentedCanvasPlugin) {
    try {
        // Get the active leaf and check if it's a canvas
        const activeLeaf = app.workspace.activeLeaf;
        if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
            new Notice("Please open a canvas view first");
            return;
        }
        
        const canvasView = activeLeaf.view as unknown as CanvasView;
        
        // Get the selected node (the prompt node)
        const selectedNode = getSelectedNode(canvasView.canvas);
        if (!selectedNode) {
            new Notice("No node selected. Please select a node in the canvas.");
            return;
        }
        
        // Get the content of the selected node (this will be the prompt)
        const promptContent = await getNodeContent(app, selectedNode);
        if (!promptContent) {
            new Notice("No prompt content found. Please add text to the selected node.");
            return;
        }
        
        // Get all nodes connected to the selected node
        const connectedNodes = getConnectedNodes(canvasView.canvas, selectedNode);
        if (connectedNodes.length === 0) {
            new Notice("No connected nodes found. Please connect nodes to this node first.");
            return;
        }
        
        // Get the content of each connected node
        new Notice(`Processing ${connectedNodes.length} connected nodes...`);
        const nodeContents = await Promise.all(
            connectedNodes.map(async (node) => {
                const content = await getNodeContent(app, node);
                return { id: node.id, content };
            })
        );
        
        // Send the prompt and node contents to the backend
        new Notice("Sending to AI...");
        const response = await plugin.apiClient.sendMultiNodePrompt(
            nodeContents,
            promptContent,
            plugin.settings.systemPrompt
        );
        
        // Create a response node connected to the prompt node
        createResponseNode(canvasView.canvas, selectedNode, response);
        new Notice("AI response received");
    } catch (error) {
        console.error("Error in handleConnectedNodesPrompt:", error);
        new Notice(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function handleMultiNodePrompt(app: App, plugin: RigAugmentedCanvasPlugin) {
    try {
        // Get the active leaf and check if it's a canvas
        const activeLeaf = app.workspace.activeLeaf;
        if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).canvas) {
            new Notice("Please open a canvas view first");
            return;
        }
        
        const canvasView = activeLeaf.view as unknown as CanvasView;
        
        // Get the selected nodes
        const selectedNodes = getSelectedNodes(canvasView.canvas);
        if (selectedNodes.length === 0) {
            new Notice("No nodes selected. Please select at least one node in the canvas.");
            return;
        }
        
        // Create a new prompt node connected to the selected nodes
        const promptNode = createPromptNode(canvasView.canvas, selectedNodes);
        if (!promptNode) {
            new Notice("Failed to create prompt node");
            return;
        }
        
        // Show the multi-node prompt modal
        new MultiNodePromptModal(app, selectedNodes, async (prompt) => {
            if (!prompt) return;
            
            try {
                // Update the prompt node with the user's prompt
                updateNodeContent(canvasView.canvas, promptNode, prompt);
                
                // Get the content of each selected node
                new Notice("Processing nodes and sending to AI...");
                const nodeContents = await Promise.all(
                    selectedNodes.map(async (node) => {
                        const content = await getNodeContent(app, node);
                        return { id: node.id, content };
                    })
                );
                
                // Send the prompt and node contents to the backend
                const response = await plugin.apiClient.sendMultiNodePrompt(
                    nodeContents,
                    prompt,
                    plugin.settings.systemPrompt
                );
                
                // Create a response node connected to the prompt node
                createResponseNode(canvasView.canvas, promptNode, response);
                new Notice("AI response received");
            } catch (error) {
                console.error("Error in multi-node prompt handler:", error);
                new Notice(`Error: ${error instanceof Error ? error.message : String(error)}`);
                
                // Update the prompt node to indicate the error
                updateNodeContent(
                    canvasView.canvas, 
                    promptNode, 
                    `${prompt}\n\nError: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }).open();
    } catch (error) {
        console.error("Error in handleMultiNodePrompt:", error);
        new Notice(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
