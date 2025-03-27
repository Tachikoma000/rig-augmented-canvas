declare module "obsidian" {
    export class Plugin {
        app: App;
        manifest: PluginManifest;
        
        constructor(app: App, manifest: PluginManifest);
        
        onload(): void;
        onunload(): void;
        
        loadData(): Promise<any>;
        saveData(data: any): Promise<void>;
        
        addSettingTab(tab: PluginSettingTab): void;
        registerEvent(evt: any): void;
        register(cb: () => void): void;
        
        addCommand(command: {
            id: string;
            name: string;
            checkCallback?: (checking: boolean) => boolean | void;
            callback?: () => void;
            hotkeys?: Array<{
                modifiers: string[];
                key: string;
            }>;
        }): void;
    }
    
    export class PluginSettingTab {
        app: App;
        containerEl: HTMLElement;
        
        constructor(app: App, plugin: Plugin);
        
        display(): void;
        hide(): void;
    }
    
    export class App {
        workspace: Workspace;
        vault: Vault;
        metadataCache: MetadataCache;
    }
    
export class Workspace {
    on(name: string, callback: (...args: any[]) => any, ctx?: any): EventRef;
    offref(ref: EventRef): void;
    getActiveViewOfType<T>(type: string): T | null;
    getViewType(type: string): any;
    onLayoutReady(callback: () => any): void;
    trigger(name: string, ...args: any[]): void;
    activeLeaf: WorkspaceLeaf | null;
}

export interface WorkspaceLeaf {
    view: View;
}

export interface View {
    getViewType(): string;
}
    
    export class Vault {
        adapter: DataAdapter;
        
        getAbstractFileByPath(path: string): TAbstractFile | null;
        read(file: TFile): Promise<string>;
        create(path: string, data: string): Promise<TFile>;
        createFolder(path: string): Promise<void>;
    }
    
    export class MetadataCache {
        getFileCache(file: TFile): CachedMetadata | null;
        getFirstLinkpathDest(linkpath: string, sourcePath: string): TFile | null;
    }
    
    export interface CachedMetadata {
        frontmatter: any;
        headings: Array<{
            level: number;
            heading: string;
            position: {
                start: { line: number; col: number; offset: number };
                end: { line: number; col: number; offset: number };
            };
        }>;
    }
    
    export class TAbstractFile {
        path: string;
        name: string;
        vault: Vault;
    }
    
    export class TFile extends TAbstractFile {
        extension: string;
        basename: string;
        stat: {
            mtime: number;
            ctime: number;
            size: number;
        };
    }
    
    export class TFolder extends TAbstractFile {
        children: TAbstractFile[];
    }
    
    export interface DataAdapter {
        write(path: string, data: string): Promise<void>;
        writeBinary(path: string, data: ArrayBuffer): Promise<void>;
    }
    
    export interface PluginManifest {
        id: string;
        name: string;
        version: string;
        minAppVersion: string;
        description: string;
        author: string;
        authorUrl: string;
        isDesktopOnly: boolean;
    }
    
    export interface EventRef {}
    
    export class Modal {
        app: App;
        contentEl: HTMLElement;
        
        constructor(app: App);
        
        open(): void;
        close(): void;
        onOpen(): void;
        onClose(): void;
    }
    
    export class Setting {
        settingEl: HTMLElement;
        
        constructor(containerEl: HTMLElement);
        
        setName(name: string): this;
        setDesc(desc: string): this;
        setClass(cls: string): this;
        
        addText(cb: (text: TextComponent) => any): this;
        addTextArea(cb: (text: TextAreaComponent) => any): this;
        addToggle(cb: (toggle: ToggleComponent) => any): this;
        addButton(cb: (button: ButtonComponent) => any): this;
        addDropdown(cb: (dropdown: DropdownComponent) => any): this;
    }
    
    export class TextComponent {
        inputEl: HTMLInputElement;
        
        constructor(containerEl: HTMLElement);
        
        getValue(): string;
        setValue(value: string): this;
        setPlaceholder(placeholder: string): this;
        onChange(callback: (value: string) => any): this;
    }
    
    export class TextAreaComponent {
        inputEl: HTMLTextAreaElement;
        
        constructor(containerEl: HTMLElement);
        
        getValue(): string;
        setValue(value: string): this;
        setPlaceholder(placeholder: string): this;
        onChange(callback: (value: string) => any): this;
    }
    
    export class ToggleComponent {
        toggleEl: HTMLElement;
        
        constructor(containerEl: HTMLElement);
        
        getValue(): boolean;
        setValue(value: boolean): this;
        onChange(callback: (value: boolean) => any): this;
    }
    
    export class ButtonComponent {
        buttonEl: HTMLElement;
        
        constructor(containerEl: HTMLElement);
        
        setButtonText(text: string): this;
        setIcon(icon: string): this;
        setCta(): this;
        onClick(callback: () => any): this;
    }
    
    export class DropdownComponent {
        selectEl: HTMLSelectElement;
        
        constructor(containerEl: HTMLElement);
        
        addOption(value: string, display: string): this;
        getValue(): string;
        setValue(value: string): this;
        onChange(callback: (value: string) => any): this;
    }
    
    export class Menu {
        constructor();
        
        addItem(cb: (item: MenuItem) => any): this;
        addSeparator(): this;
        setParentElement(parent: HTMLElement): this;
        showAtPosition(position: { x: number; y: number; width?: number; height?: number; overlap?: boolean }): this;
        hide(): this;
    }
    
    export class MenuItem {
        constructor();
        
        setTitle(title: string): this;
        setIcon(icon: string): this;
        onClick(callback: () => any): this;
    }
    
    export function setIcon(el: HTMLElement, icon: string): void;
    export function setTooltip(el: HTMLElement, tooltip: string, options?: { placement?: string }): void;
    
    export class Notice {
        constructor(message: string, timeout?: number);
    }
}
