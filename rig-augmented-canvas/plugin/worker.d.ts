/* tslint:disable */
/* eslint-disable */
/**
 *
 * * Supported AI model providers.
 * * Currently only OpenAI is implemented, but this enum allows for future expansion.
 * 
 */
export enum ModelProvider {
  OpenAI = 0,
}
/**
 * Configuration options for Cloudflare's image optimization feature:
 * <https://blog.cloudflare.com/introducing-polish-automatic-image-optimizati/>
 */
export enum PolishConfig {
  Off = 0,
  Lossy = 1,
  Lossless = 2,
}
export enum RequestRedirect {
  Error = 0,
  Follow = 1,
  Manual = 2,
}
/**
 * The `ReadableStreamType` enum.
 *
 * *This API requires the following crate features to be activated: `ReadableStreamType`*
 */
type ReadableStreamType = "bytes";
export class IntoUnderlyingByteSource {
  private constructor();
  free(): void;
  start(controller: ReadableByteStreamController): void;
  pull(controller: ReadableByteStreamController): Promise<any>;
  cancel(): void;
  readonly type: ReadableStreamType;
  readonly autoAllocateChunkSize: number;
}
export class IntoUnderlyingSink {
  private constructor();
  free(): void;
  write(chunk: any): Promise<any>;
  close(): Promise<any>;
  abort(reason: any): Promise<any>;
}
export class IntoUnderlyingSource {
  private constructor();
  free(): void;
  pull(controller: ReadableStreamDefaultController): Promise<any>;
  cancel(): void;
}
/**
 * Configuration options for Cloudflare's minification features:
 * <https://www.cloudflare.com/website-optimization/>
 */
export class MinifyConfig {
  private constructor();
  free(): void;
  js: boolean;
  html: boolean;
  css: boolean;
}
/**
 *
 * * Configuration for AI models.
 * * Contains settings like provider, model name, API key environment variable, etc.
 * 
 */
export class ModelConfig {
  free(): void;
  constructor();
  provider: ModelProvider;
  model_name: string;
  get api_key_env(): string | undefined;
  set api_key_env(value: string | null | undefined);
  get base_url(): string | undefined;
  set base_url(value: string | null | undefined);
}
export class PromptResponse {
  private constructor();
  free(): void;
}
export class R2Range {
  private constructor();
  free(): void;
  get offset(): number | undefined;
  set offset(value: number | null | undefined);
  get length(): number | undefined;
  set length(value: number | null | undefined);
  get suffix(): number | undefined;
  set suffix(value: number | null | undefined);
}
export class WasmFlashcard {
  private constructor();
  free(): void;
}
export class WasmRigService {
  free(): void;
  constructor();
  get_config(): ModelConfig;
  update_model_config(config_json: string): void;
  handle_prompt(api_key: string | null | undefined, prompt: any): Promise<PromptResponse>;
  /**
   *
   *     * Generates an AI response for the given content.
   *     *
   *     * @param content The text to send to the AI model
   *     * @param system_prompt Optional system prompt to guide the AI's behavior
   *     * @param api_key Optional API key to use for this specific request
   *     * @return The AI-generated response
   *     
   */
  generate_response(content: string, system_prompt?: string | null, api_key?: string | null): Promise<string>;
  generate_questions(content: string, count: number, api_key?: string | null): Promise<string[]>;
  generate_flashcards(content: string, title?: string | null, api_key?: string | null): Promise<any>;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wasmflashcard_free: (a: number, b: number) => void;
  readonly __wbg_promptresponse_free: (a: number, b: number) => void;
  readonly __wbg_wasmrigservice_free: (a: number, b: number) => void;
  readonly wasmrigservice_new: () => [number, number, number];
  readonly wasmrigservice_get_config: (a: number) => number;
  readonly wasmrigservice_update_model_config: (a: number, b: number, c: number) => [number, number];
  readonly wasmrigservice_handle_prompt: (a: number, b: number, c: number, d: any) => any;
  readonly wasmrigservice_generate_response: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => any;
  readonly wasmrigservice_generate_questions: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
  readonly wasmrigservice_generate_flashcards: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => any;
  readonly __wbg_modelconfig_free: (a: number, b: number) => void;
  readonly __wbg_get_modelconfig_provider: (a: number) => number;
  readonly __wbg_set_modelconfig_provider: (a: number, b: number) => void;
  readonly __wbg_get_modelconfig_model_name: (a: number) => [number, number];
  readonly __wbg_set_modelconfig_model_name: (a: number, b: number, c: number) => void;
  readonly __wbg_get_modelconfig_api_key_env: (a: number) => [number, number];
  readonly __wbg_set_modelconfig_api_key_env: (a: number, b: number, c: number) => void;
  readonly __wbg_get_modelconfig_base_url: (a: number) => [number, number];
  readonly __wbg_set_modelconfig_base_url: (a: number, b: number, c: number) => void;
  readonly modelconfig_new: () => number;
  readonly __wbg_minifyconfig_free: (a: number, b: number) => void;
  readonly __wbg_get_minifyconfig_js: (a: number) => number;
  readonly __wbg_set_minifyconfig_js: (a: number, b: number) => void;
  readonly __wbg_get_minifyconfig_html: (a: number) => number;
  readonly __wbg_set_minifyconfig_html: (a: number, b: number) => void;
  readonly __wbg_get_minifyconfig_css: (a: number) => number;
  readonly __wbg_set_minifyconfig_css: (a: number, b: number) => void;
  readonly __wbg_r2range_free: (a: number, b: number) => void;
  readonly __wbg_get_r2range_offset: (a: number) => [number, number];
  readonly __wbg_set_r2range_offset: (a: number, b: number, c: number) => void;
  readonly __wbg_get_r2range_length: (a: number) => [number, number];
  readonly __wbg_set_r2range_length: (a: number, b: number, c: number) => void;
  readonly __wbg_get_r2range_suffix: (a: number) => [number, number];
  readonly __wbg_set_r2range_suffix: (a: number, b: number, c: number) => void;
  readonly __wbg_intounderlyingsource_free: (a: number, b: number) => void;
  readonly intounderlyingsource_pull: (a: number, b: any) => any;
  readonly intounderlyingsource_cancel: (a: number) => void;
  readonly __wbg_intounderlyingsink_free: (a: number, b: number) => void;
  readonly intounderlyingsink_write: (a: number, b: any) => any;
  readonly intounderlyingsink_close: (a: number) => any;
  readonly intounderlyingsink_abort: (a: number, b: any) => any;
  readonly __wbg_intounderlyingbytesource_free: (a: number, b: number) => void;
  readonly intounderlyingbytesource_type: (a: number) => number;
  readonly intounderlyingbytesource_autoAllocateChunkSize: (a: number) => number;
  readonly intounderlyingbytesource_start: (a: number, b: any) => void;
  readonly intounderlyingbytesource_pull: (a: number, b: any) => any;
  readonly intounderlyingbytesource_cancel: (a: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_6: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h9c53b12e2241e354: (a: number, b: number) => void;
  readonly closure371_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure383_externref_shim: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
