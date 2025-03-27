import { App, Modal, setIcon } from "obsidian";

/**
 * Modal that displays the user guide for the Rig Augmented Canvas plugin.
 * Contains detailed instructions on how to use the plugin's features.
 */
export class UserGuideModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    /**
     * Called when the modal is opened.
     * Renders the user guide content.
     */
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("rig-user-guide-modal");

        // Add title
        const titleEl = contentEl.createEl("h1", { text: "Rig Augmented Canvas User Guide" });
        titleEl.addClass("rig-user-guide-title");

        // Create a container for the guide content with scrolling
        const guideContainer = contentEl.createEl("div", { cls: "rig-user-guide-container" });

        // Create sections for better organization
        this.createIntroSection(guideContainer);
        this.createFeaturesSection(guideContainer);
        this.createNodeTypesSection(guideContainer);
        this.createDiagramsSection(guideContainer);
        this.createUISection(guideContainer);
        this.createSettingsSection(guideContainer);
        this.createTipsSection(guideContainer);

        // Add close button at the bottom
        const footerEl = contentEl.createEl("div", { cls: "rig-user-guide-footer" });
        const closeButton = footerEl.createEl("button", { text: "Close" });
        closeButton.addEventListener("click", () => {
            this.close();
        });
    }

    /**
     * Called when the modal is closed.
     * Cleans up the content element.
     */
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    /**
     * Creates the introduction section of the user guide.
     */
    private createIntroSection(container: HTMLElement) {
        const section = container.createDiv({ cls: "rig-guide-section" });
        
        // Create section header with icon
        const header = section.createEl("h2", { cls: "rig-guide-section-header" });
        const headerIcon = header.createSpan({ cls: "rig-guide-section-icon" });
        setIcon(headerIcon, "info");
        header.createSpan({ text: "Introduction" });
        
        // Create content
        const content = section.createDiv({ cls: "rig-guide-section-content" });
        
        const intro = content.createEl("p", { cls: "rig-guide-intro" });
        intro.innerHTML = "The <strong>Rig Augmented Canvas</strong> plugin enhances Obsidian's Canvas with AI capabilities, allowing you to interact with your notes in new and powerful ways. This guide will help you understand how to use all the features of the plugin.";
        
        // Getting Started subsection
        const gettingStarted = content.createDiv({ cls: "rig-guide-subsection" });
        gettingStarted.createEl("h3", { text: "Getting Started" });
        
        const steps = gettingStarted.createEl("p");
        steps.innerHTML = "The plugin adds AI capabilities to Obsidian's Canvas feature. To use the plugin:";
        
        const stepsList = gettingStarted.createEl("ol", { cls: "rig-guide-steps" });
        const steps_data = [
            "Open an Obsidian Canvas",
            "Create or select a node (note) on the canvas",
            "Use one of the plugin's commands through the floating action button, context menu, or keyboard shortcuts"
        ];
        
        steps_data.forEach(step => {
            stepsList.createEl("li", { text: step });
        });
    }
    
    /**
     * Creates the features section of the user guide.
     */
    private createFeaturesSection(container: HTMLElement) {
        const section = container.createDiv({ cls: "rig-guide-section" });
        
        // Create section header with icon
        const header = section.createEl("h2", { cls: "rig-guide-section-header" });
        const headerIcon = header.createSpan({ cls: "rig-guide-section-icon" });
        setIcon(headerIcon, "cpu");
        header.createSpan({ text: "Main Features" });
        
        // Create content
        const content = section.createDiv({ cls: "rig-guide-section-content" });
        
        // Create feature cards
        this.createFeatureCard(content, {
            title: "Ask AI",
            icon: "message-square",
            description: "Sends the content of a selected node to AI and creates a response node with AI's analysis.",
            steps: [
                "Select a node on the canvas",
                "Click the \"Ask AI\" button in the floating menu (speech bubble icon)",
                "The plugin will create a prompt node and an AI response node connected to your selected node"
            ],
            shortcut: "Alt+A"
        });
        
        this.createFeatureCard(content, {
            title: "Generate Questions",
            icon: "help-circle",
            description: "Creates AI-generated questions about the selected node's content.",
            steps: [
                "Select a node on the canvas",
                "Click the \"Generate Questions\" button in the floating menu (question mark icon)",
                "A modal will appear with a list of AI-generated questions",
                "Click on any question to have the AI answer it",
                "The plugin will create a question node and an answer node connected to your selected node"
            ],
            shortcut: "Alt+Q"
        });
        
        this.createFeatureCard(content, {
            title: "Ask Custom Question",
            icon: "edit-3",
            description: "Allows you to ask a specific question about the selected node's content.",
            steps: [
                "Select a node on the canvas",
                "Click the \"Ask Custom Question\" button in the floating menu (pencil icon)",
                "Enter your question in the modal that appears",
                "Click \"Ask\" to submit your question",
                "The plugin will create a question node with your question and an answer node with the AI's response"
            ],
            shortcut: "Alt+C"
        });
        
        this.createFeatureCard(content, {
            title: "Create Flashcards",
            icon: "layers",
            description: "Generates flashcards from the selected node's content and saves them to a file.",
            steps: [
                "Select a node on the canvas",
                "Click the \"Create Flashcards\" button in the floating menu (layers icon)",
                "The plugin will generate flashcards and save them to the configured folder",
                "A notification will appear when the flashcards are created"
            ],
            shortcut: "Alt+F"
        });
        
        this.createFeatureCard(content, {
            title: "Connect Multiple Nodes",
            icon: "git-merge",
            description: "Allows you to use multiple selected nodes as context for an AI prompt.",
            steps: [
                "Select multiple nodes on the canvas (hold Shift or Ctrl/Cmd while clicking)",
                "Click the \"Connect Multiple Nodes\" button in the floating menu (git merge icon)",
                "Enter your prompt in the modal that appears",
                "Click \"Submit\" to send your prompt",
                "The plugin will create a prompt node connected to all selected nodes and an AI response node"
            ],
            shortcut: "Alt+M"
        });
        
        this.createFeatureCard(content, {
            title: "Ask AI using Connected Nodes",
            icon: "link",
            description: "Uses nodes connected to the selected node as context for an AI prompt.",
            steps: [
                "Create a node that will serve as your prompt",
                "Connect other nodes to this prompt node (these will be used as context)",
                "Select the prompt node",
                "Click the \"Ask AI using Connected Nodes\" button in the floating menu (link icon)",
                "The plugin will use the content of all connected nodes as context and create an AI response node"
            ],
            shortcut: ""
        });
    }
    
    /**
     * Creates a feature card with title, description, steps, and shortcut.
     */
    private createFeatureCard(container: HTMLElement, feature: {
        title: string;
        icon: string;
        description: string;
        steps: string[];
        shortcut: string;
    }) {
        const card = container.createDiv({ cls: "rig-guide-feature-card" });
        
        // Create header with icon
        const header = card.createEl("h3", { cls: "rig-guide-feature-header" });
        const headerIcon = header.createSpan({ cls: "rig-guide-feature-icon" });
        setIcon(headerIcon, feature.icon);
        header.createSpan({ text: feature.title });
        
        // Create description
        const description = card.createDiv({ cls: "rig-guide-feature-description" });
        description.createEl("strong", { text: "What it does: " });
        description.createSpan({ text: feature.description });
        
        // Create steps
        const stepsContainer = card.createDiv({ cls: "rig-guide-feature-steps" });
        stepsContainer.createEl("strong", { text: "How to use it:" });
        const stepsList = stepsContainer.createEl("ol");
        feature.steps.forEach(step => {
            stepsList.createEl("li", { text: step });
        });
        
        // Create shortcut if available
        if (feature.shortcut) {
            const shortcut = card.createDiv({ cls: "rig-guide-feature-shortcut" });
            shortcut.createEl("strong", { text: "Keyboard shortcut: " });
            shortcut.createSpan({ text: `${feature.shortcut} (customizable in settings)` });
        }
    }
    
    /**
     * Creates the node types section of the user guide.
     */
    private createNodeTypesSection(container: HTMLElement) {
        const section = container.createDiv({ cls: "rig-guide-section" });
        
        // Create section header with icon
        const header = section.createEl("h2", { cls: "rig-guide-section-header" });
        const headerIcon = header.createSpan({ cls: "rig-guide-section-icon" });
        setIcon(headerIcon, "box");
        header.createSpan({ text: "Understanding Node Types" });
        
        // Create content
        const content = section.createDiv({ cls: "rig-guide-section-content" });
        content.createEl("p", { text: "The plugin creates different types of nodes on your canvas:" });
        
        // Create node type cards
        const nodeTypes = content.createDiv({ cls: "rig-guide-node-types" });
        
        // Prompt Nodes
        const promptNode = nodeTypes.createDiv({ cls: "rig-guide-node-type rig-guide-prompt-node" });
        promptNode.createEl("h3", { text: "Prompt Nodes" });
        const promptList = promptNode.createEl("ul");
        promptList.createEl("li", { text: "Created when you use \"Connect Multiple Nodes\" or as an intermediate step in other commands" });
        promptList.createEl("li", { text: "Contain your prompt or question to the AI" });
        promptList.createEl("li", { text: "Visually marked with a green left border" });
        
        // Question Nodes
        const questionNode = nodeTypes.createDiv({ cls: "rig-guide-node-type rig-guide-question-node" });
        questionNode.createEl("h3", { text: "Question Nodes" });
        const questionList = questionNode.createEl("ul");
        questionList.createEl("li", { text: "Created when you use \"Generate Questions\" or \"Ask Custom Question\"" });
        questionList.createEl("li", { text: "Contain the question being asked" });
        questionList.createEl("li", { text: "Visually marked with a blue left border" });
        
        // Response Nodes
        const responseNode = nodeTypes.createDiv({ cls: "rig-guide-node-type rig-guide-response-node" });
        responseNode.createEl("h3", { text: "Response Nodes" });
        const responseList = responseNode.createEl("ul");
        responseList.createEl("li", { text: "Contain the AI's response to your prompts or questions" });
        responseList.createEl("li", { text: "Visually marked with a purple left border" });
        responseList.createEl("li", { text: "All AI-generated nodes have a small AI indicator icon in the top-right corner" });
    }
    
    /**
     * Creates the diagrams section of the user guide with visual representations
     * of how nodes are connected for each command.
     */
    private createDiagramsSection(container: HTMLElement) {
        const section = container.createDiv({ cls: "rig-guide-section" });
        
        // Create section header with icon
        const header = section.createEl("h2", { cls: "rig-guide-section-header" });
        const headerIcon = header.createSpan({ cls: "rig-guide-section-icon" });
        setIcon(headerIcon, "git-branch");
        header.createSpan({ text: "Visual Node Connection Diagrams" });
        
        // Create content
        const content = section.createDiv({ cls: "rig-guide-section-content" });
        
        content.createEl("p", { text: "These diagrams illustrate how nodes are connected when using different commands:" });
        
        // Create a grid container for the diagrams
        const diagramsGrid = content.createDiv({ cls: "rig-guide-diagrams-grid" });
        
        // Create diagrams for each command in a 2x2 grid
        this.createDiagram(diagramsGrid, "Ask AI", 
            "Creates a prompt node and an AI response node connected to your selected note",
            this.createAskAISVG());
            
        this.createDiagram(diagramsGrid, "Generate Questions", 
            "Creates a question node and an answer node connected to your selected note",
            this.createQuestionsSVG());
            
        this.createDiagram(diagramsGrid, "Ask Custom Question", 
            "Creates a question node with your question and an answer node",
            this.createCustomQuestionSVG());
            
        this.createDiagram(diagramsGrid, "Connect Multiple Nodes", 
            "Creates a prompt node connected to all selected nodes and an AI response node",
            this.createMultiNodeSVG());
    }
    
    /**
     * Creates a diagram with caption
     */
    private createDiagram(container: HTMLElement, title: string, caption: string, svgContent: string) {
        const diagram = container.createDiv({ cls: "rig-guide-diagram" });
        
        // Add title
        diagram.createEl("h3", { text: title });
        
        // Add SVG content
        const svgContainer = diagram.createDiv();
        svgContainer.innerHTML = svgContent;
        
        // Add caption
        const captionEl = diagram.createEl("div", { cls: "rig-guide-diagram-caption" });
        captionEl.textContent = caption;
    }
    
    /**
     * Creates SVG for Ask AI diagram
     */
    private createAskAISVG(): string {
        return `<svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arrowhead1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-muted)"/>
                </marker>
            </defs>
            
            <!-- Original node -->
            <rect x="50" y="80" width="80" height="40" class="rig-diagram-node rig-diagram-node-regular" />
            <text x="90" y="100" class="rig-diagram-node-content" text-anchor="middle">Your Note</text>
            
            <!-- Prompt node -->
            <rect x="180" y="40" width="80" height="40" class="rig-diagram-node rig-diagram-node-prompt" />
            <text x="220" y="60" class="rig-diagram-node-content" text-anchor="middle">Prompt</text>
            
            <!-- Response node -->
            <rect x="180" y="120" width="80" height="40" class="rig-diagram-node rig-diagram-node-response" />
            <text x="220" y="140" class="rig-diagram-node-content" text-anchor="middle">AI Response</text>
            
            <!-- Edges -->
            <path d="M130,90 C150,90 160,60 180,60" class="rig-diagram-edge" marker-end="url(#arrowhead1)" />
            <path d="M220,80 L220,120" class="rig-diagram-edge" marker-end="url(#arrowhead1)" />
        </svg>`;
    }
    
    /**
     * Creates SVG for Generate Questions diagram
     */
    private createQuestionsSVG(): string {
        return `<svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-muted)"/>
                </marker>
            </defs>
            
            <!-- Original node -->
            <rect x="50" y="80" width="80" height="40" class="rig-diagram-node rig-diagram-node-regular" />
            <text x="90" y="100" class="rig-diagram-node-content" text-anchor="middle">Your Note</text>
            
            <!-- Question node -->
            <rect x="180" y="40" width="80" height="40" class="rig-diagram-node rig-diagram-node-question" />
            <text x="220" y="60" class="rig-diagram-node-content" text-anchor="middle">Question</text>
            
            <!-- Response node -->
            <rect x="180" y="120" width="80" height="40" class="rig-diagram-node rig-diagram-node-response" />
            <text x="220" y="140" class="rig-diagram-node-content" text-anchor="middle">AI Answer</text>
            
            <!-- Edges -->
            <path d="M130,90 C150,90 160,60 180,60" class="rig-diagram-edge" marker-end="url(#arrowhead2)" />
            <path d="M220,80 L220,120" class="rig-diagram-edge" marker-end="url(#arrowhead2)" />
        </svg>`;
    }
    
    /**
     * Creates SVG for Custom Question diagram
     */
    private createCustomQuestionSVG(): string {
        return `<svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arrowhead3" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-muted)"/>
                </marker>
            </defs>
            
            <!-- Original node -->
            <rect x="50" y="80" width="80" height="40" class="rig-diagram-node rig-diagram-node-regular" />
            <text x="90" y="100" class="rig-diagram-node-content" text-anchor="middle">Your Note</text>
            
            <!-- Question node -->
            <rect x="180" y="40" width="80" height="40" class="rig-diagram-node rig-diagram-node-question" />
            <text x="220" y="60" class="rig-diagram-node-content" text-anchor="middle">Your Question</text>
            
            <!-- Response node -->
            <rect x="180" y="120" width="80" height="40" class="rig-diagram-node rig-diagram-node-response" />
            <text x="220" y="140" class="rig-diagram-node-content" text-anchor="middle">AI Answer</text>
            
            <!-- Edges -->
            <path d="M130,90 C150,90 160,60 180,60" class="rig-diagram-edge" marker-end="url(#arrowhead3)" />
            <path d="M220,80 L220,120" class="rig-diagram-edge" marker-end="url(#arrowhead3)" />
        </svg>`;
    }
    
    /**
     * Creates SVG for Multi-Node diagram
     */
    private createMultiNodeSVG(): string {
        return `<svg width="350" height="250" viewBox="0 0 350 250" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arrowhead4" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-muted)"/>
                </marker>
            </defs>
            
            <!-- Original nodes -->
            <rect x="50" y="40" width="80" height="40" class="rig-diagram-node rig-diagram-node-regular" />
            <text x="90" y="60" class="rig-diagram-node-content" text-anchor="middle">Note 1</text>
            
            <rect x="50" y="100" width="80" height="40" class="rig-diagram-node rig-diagram-node-regular" />
            <text x="90" y="120" class="rig-diagram-node-content" text-anchor="middle">Note 2</text>
            
            <rect x="50" y="160" width="80" height="40" class="rig-diagram-node rig-diagram-node-regular" />
            <text x="90" y="180" class="rig-diagram-node-content" text-anchor="middle">Note 3</text>
            
            <!-- Prompt node -->
            <rect x="180" y="100" width="80" height="40" class="rig-diagram-node rig-diagram-node-prompt" />
            <text x="220" y="120" class="rig-diagram-node-content" text-anchor="middle">Your Prompt</text>
            
            <!-- Response node -->
            <rect x="180" y="180" width="80" height="40" class="rig-diagram-node rig-diagram-node-response" />
            <text x="220" y="200" class="rig-diagram-node-content" text-anchor="middle">AI Response</text>
            
            <!-- Edges -->
            <path d="M130,60 C160,60 160,100 180,100" class="rig-diagram-edge" marker-end="url(#arrowhead4)" />
            <path d="M130,120 L180,120" class="rig-diagram-edge" marker-end="url(#arrowhead4)" />
            <path d="M130,180 C160,180 160,140 180,140" class="rig-diagram-edge" marker-end="url(#arrowhead4)" />
            <path d="M220,140 L220,180" class="rig-diagram-edge" marker-end="url(#arrowhead4)" />
        </svg>`;
    }
    
    /**
     * Creates SVG for Connected Nodes diagram
     */
    private createConnectedNodesSVG(): string {
        return `<svg width="350" height="250" viewBox="0 0 350 250" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arrowhead5" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-muted)"/>
                </marker>
            </defs>
            
            <!-- Context nodes -->
            <rect x="50" y="40" width="80" height="40" class="rig-diagram-node rig-diagram-node-regular" />
            <text x="90" y="60" class="rig-diagram-node-content" text-anchor="middle">Context 1</text>
            
            <rect x="50" y="160" width="80" height="40" class="rig-diagram-node rig-diagram-node-regular" />
            <text x="90" y="180" class="rig-diagram-node-content" text-anchor="middle">Context 2</text>
            
            <!-- Prompt node -->
            <rect x="180" y="100" width="80" height="40" class="rig-diagram-node rig-diagram-node-prompt" />
            <text x="220" y="120" class="rig-diagram-node-content" text-anchor="middle">Your Prompt</text>
            
            <!-- Response node -->
            <rect x="180" y="180" width="80" height="40" class="rig-diagram-node rig-diagram-node-response" />
            <text x="220" y="200" class="rig-diagram-node-content" text-anchor="middle">AI Response</text>
            
            <!-- Edges -->
            <path d="M130,60 C160,60 160,100 180,100" class="rig-diagram-edge" marker-end="url(#arrowhead5)" />
            <path d="M130,180 C160,180 160,140 180,140" class="rig-diagram-edge" marker-end="url(#arrowhead5)" />
            <path d="M220,140 L220,180" class="rig-diagram-edge" marker-end="url(#arrowhead5)" stroke-dasharray="5,3" />
        </svg>`;
    }
    
    /**
     * Creates the UI section of the user guide.
     */
    private createUISection(container: HTMLElement) {
        const section = container.createDiv({ cls: "rig-guide-section" });
        
        // Create section header with icon
        const header = section.createEl("h2", { cls: "rig-guide-section-header" });
        const headerIcon = header.createSpan({ cls: "rig-guide-section-icon" });
        setIcon(headerIcon, "layout");
        header.createSpan({ text: "User Interface" });
        
        // Create content
        const content = section.createDiv({ cls: "rig-guide-section-content" });
        
        // Floating Action Button
        const floatingButton = content.createDiv({ cls: "rig-guide-subsection" });
        floatingButton.createEl("h3", { text: "Using the Floating Action Button" });
        
        floatingButton.createEl("p", { text: "The floating action button appears in the bottom-left corner of your canvas. Click it to reveal the following options:" });
        
        const buttonOptions = floatingButton.createEl("ul", { cls: "rig-guide-button-options" });
        
        const options = [
            { icon: "message-square", text: "Ask AI" },
            { icon: "help-circle", text: "Generate Questions" },
            { icon: "edit-3", text: "Ask Custom Question" },
            { icon: "layers", text: "Create Flashcards" },
            { icon: "git-merge", text: "Connect Multiple Nodes" },
            { icon: "link", text: "Ask AI using Connected Nodes" },
            { icon: "book", text: "User Guide" }
        ];
        
        options.forEach(option => {
            const item = buttonOptions.createEl("li");
            const icon = item.createSpan({ cls: "rig-guide-option-icon" });
            setIcon(icon, option.icon);
            item.createEl("strong", { text: option.text });
        });
        
        // Context Menu
        const contextMenu = content.createDiv({ cls: "rig-guide-subsection" });
        contextMenu.createEl("h3", { text: "Using the Context Menu" });
        
        contextMenu.createEl("p", { text: "You can also access the plugin's features by right-clicking on a node or a selection of nodes:" });
        
        const contextSteps = contextMenu.createEl("ol");
        contextSteps.createEl("li", { text: "Right-click on a single node to see options for that node" });
        contextSteps.createEl("li", { text: "Right-click after selecting multiple nodes to see multi-node options" });
        
        // Keyboard Shortcuts
        const shortcuts = content.createDiv({ cls: "rig-guide-subsection" });
        shortcuts.createEl("h3", { text: "Keyboard Shortcuts" });
        
        shortcuts.createEl("p", { text: "The plugin provides keyboard shortcuts for quick access to its features:" });
        
        const shortcutList = shortcuts.createEl("ul", { cls: "rig-guide-shortcuts" });
        
        const shortcutData = [
            { key: "Alt+A", action: "Ask AI" },
            { key: "Alt+Q", action: "Generate Questions" },
            { key: "Alt+C", action: "Ask Custom Question" },
            { key: "Alt+F", action: "Create Flashcards" },
            { key: "Alt+M", action: "Connect Multiple Nodes" }
        ];
        
        shortcutData.forEach(shortcut => {
            const item = shortcutList.createEl("li");
            item.createEl("kbd", { text: shortcut.key, cls: "rig-guide-shortcut-key" });
            item.createSpan({ text: ` ${shortcut.action}` });
        });
        
        shortcuts.createEl("p", { text: "These shortcuts can be customized in the plugin settings." });
    }
    
    /**
     * Creates the settings section of the user guide.
     */
    private createSettingsSection(container: HTMLElement) {
        const section = container.createDiv({ cls: "rig-guide-section" });
        
        // Create section header with icon
        const header = section.createEl("h2", { cls: "rig-guide-section-header" });
        const headerIcon = header.createSpan({ cls: "rig-guide-section-icon" });
        setIcon(headerIcon, "settings");
        header.createSpan({ text: "Plugin Settings" });
        
        // Create content
        const content = section.createDiv({ cls: "rig-guide-section-content" });
        
        content.createEl("p", { text: "To configure the plugin:" });
        
        const steps = content.createEl("ol");
        steps.createEl("li", { text: "Go to Obsidian Settings" });
        steps.createEl("li", { text: "Navigate to \"Community Plugins\"" });
        steps.createEl("li", { text: "Find \"Rig Augmented Canvas\" and click on the gear icon" });
        
        // Available Settings
        const settingsSection = content.createDiv({ cls: "rig-guide-subsection" });
        settingsSection.createEl("h3", { text: "Available Settings:" });
        
        const settingsTable = settingsSection.createEl("table", { cls: "rig-guide-settings-table" });
        const tableHead = settingsTable.createEl("thead");
        const headerRow = tableHead.createEl("tr");
        headerRow.createEl("th", { text: "Setting" });
        headerRow.createEl("th", { text: "Description" });
        
        const tableBody = settingsTable.createEl("tbody");
        
        const settings = [
            { name: "Backend URL", description: "The URL of the backend service (default: http://localhost:3000)" },
            { name: "System Prompt", description: "The system prompt to use when generating responses" },
            { name: "Flashcards Folder", description: "The folder to save flashcards in (relative to the Obsidian vault root)" },
            { name: "Debug Mode", description: "Enable debug output in the console" },
            { name: "Max Depth", description: "The maximum depth of ancestor notes to include" },
            { name: "OpenAI API Key", description: "Your OpenAI API key (can be left empty to use the backend's default key)" },
            { name: "Keyboard Shortcuts", description: "Customize the keyboard shortcuts for plugin commands" }
        ];
        
        settings.forEach(setting => {
            const row = tableBody.createEl("tr");
            row.createEl("td", { text: setting.name, cls: "rig-guide-setting-name" });
            row.createEl("td", { text: setting.description });
        });
    }
    
    /**
     * Creates the tips section of the user guide.
     */
    private createTipsSection(container: HTMLElement) {
        const section = container.createDiv({ cls: "rig-guide-section" });
        
        // Create section header with icon
        const header = section.createEl("h2", { cls: "rig-guide-section-header" });
        const headerIcon = header.createSpan({ cls: "rig-guide-section-icon" });
        setIcon(headerIcon, "lightbulb");
        header.createSpan({ text: "Tips and Best Practices" });
        
        // Create content
        const content = section.createDiv({ cls: "rig-guide-section-content" });
        
        const tipsContainer = content.createDiv({ cls: "rig-guide-tips" });
        
        const tips = [
            "Start with clear, concise notes for better AI responses",
            "Use \"Connect Multiple Nodes\" to provide more context for complex questions",
            "Organize your canvas with AI-generated nodes to create knowledge maps",
            "Use the \"Ask AI using Connected Nodes\" feature to analyze relationships between concepts",
            "Create flashcards from important concepts for later review"
        ];
        
        tips.forEach(tip => {
            const tipEl = tipsContainer.createDiv({ cls: "rig-guide-tip" });
            const icon = tipEl.createSpan({ cls: "rig-guide-tip-icon" });
            setIcon(icon, "check");
            tipEl.createSpan({ text: tip });
        });
        
        // Add a note about customization
        const note = content.createDiv({ cls: "rig-guide-note" });
        const noteIcon = note.createSpan({ cls: "rig-guide-note-icon" });
        setIcon(noteIcon, "info");
        note.createSpan({ text: "Note: You can customize the appearance of AI-generated nodes by modifying the CSS variables in your Obsidian theme." });
    }
}
