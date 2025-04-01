declare module "worker" {
    export enum ModelProvider {
        OpenAI = 0,
    }

    export class ModelConfig {
        free(): void;
        constructor();
        provider: ModelProvider;
        model_name: string;
        api_key_env?: string;
        base_url?: string;
    }

    export class PromptResponse {
        private constructor();
        free(): void;
        response: string;
    }

    export class WasmFlashcard {
        private constructor();
        free(): void;
        front: string;
        back: string;
    }

    export class WasmRigService {
        free(): void;
        constructor();
        get_config(): ModelConfig;
        update_model_config(config_json: string): void;
        handle_prompt(api_key: string | null | undefined, prompt: any): Promise<PromptResponse>;
        generate_response(content: string, system_prompt?: string | null, api_key?: string | null): Promise<string>;
        generate_questions(content: string, count: number, api_key?: string | null): Promise<string[]>;
        generate_flashcards(content: string, title?: string | null, api_key?: string | null): Promise<any>;
    }

    export default function init(): Promise<void>;
}
