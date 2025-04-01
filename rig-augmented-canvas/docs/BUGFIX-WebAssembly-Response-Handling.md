# WebAssembly Response Handling Bugfix

This document details a critical bugfix for the Rig Augmented Canvas plugin related to handling responses from the WebAssembly module.

## Issue Description

Users were experiencing empty response cards when using the plugin's AI features. The console showed errors like:

```
Invalid response format: _PromptResponse {__wbg_ptr: 1317136}
Error: Invalid response from AI service
```

## Root Cause Analysis

The issue was in the communication between the TypeScript plugin and the Rust WebAssembly module. Specifically:

1. The plugin was using the `handle_prompt` method of the WebAssembly module, which returns a `PromptResponse` object.
2. This object is a WebAssembly object with a pointer (`__wbg_ptr`) to memory in the WebAssembly instance.
3. The TypeScript code was trying to access the `response` property of this object directly, but it couldn't because of how WebAssembly objects are exposed to JavaScript.

## Solution

The solution was to use the `generate_response` method directly instead of `handle_prompt`. The `generate_response` method returns a string directly, bypassing the need to extract data from the WebAssembly object.

### Changes Made

1. In `api.ts`, we modified the `sendPrompt` method to use `generate_response` instead of `handle_prompt`:

```typescript
// Before
const response = await this.wasmModule.handle_prompt(
    this.settings.openaiApiKey,
    jsValue
);

// After
const response = await this.wasmModule.generate_response(
    content,
    systemPrompt,
    this.settings.openaiApiKey
);
```

2. Similarly, we updated the `sendMultiNodePrompt` method to combine the node contents and use `generate_response`:

```typescript
// Combine all node contents with the prompt
let combinedContent = "";

// Add each node's content
for (let i = 0; i < nodeContents.length; i++) {
    combinedContent += `Node ${i + 1}: ${nodeContents[i].content}\n\n`;
}

// Add the user's prompt
combinedContent += `Prompt: ${prompt}`;

// Send the combined content to the WebAssembly module
const response = await this.wasmModule.generate_response(
    combinedContent,
    systemPrompt,
    this.settings.openaiApiKey
);
```

## Technical Details

### WebAssembly Interface

Looking at the TypeScript definitions in `pkg/rig_augmented_canvas.d.ts`, we can see the difference between the two methods:

```typescript
// Returns a PromptResponse object (problematic)
handle_prompt(api_key: string | null | undefined, prompt: any): Promise<PromptResponse>;

// Returns a string directly (solution)
generate_response(content: string, system_prompt?: string | null, api_key?: string | null): Promise<string>;
```

The `PromptResponse` class is defined as:

```typescript
export class PromptResponse {
  private constructor();
  free(): void;
}
```

This is a WebAssembly class with no exposed properties in JavaScript, which is why we couldn't access the `response` property directly.

### Rust Implementation

In the Rust code (`src/lib.rs`), the `handle_prompt` method is implemented to handle different types of requests (single node or multi-node) and then call `generate_response` internally:

```rust
pub async fn handle_prompt(
    &self,
    api_key: Option<String>,
    prompt: JsValue,
) -> Result<PromptResponse, js_sys::Error> {
    let serde_value = serde_wasm_bindgen::from_value(prompt).unwrap();
    let request: PromptRequest = serde_json::from_value(serde_value).unwrap();

    match request {
        PromptRequest::SingleNode {
            content,
            system_prompt,
        } => {
            match self
                .generate_response(content, system_prompt, api_key)
                .await
            {
                Ok(response) => Ok(PromptResponse { response }),
                Err(e) => {
                    return Err(e);
                }
            }
        }
        // ... multi-node handling
    }
}
```

The `generate_response` method is more direct:

```rust
pub async fn generate_response(
    &self,
    content: String,
    system_prompt: Option<String>,
    api_key: Option<String>,
) -> Result<String, js_sys::Error> {
    // ... implementation
    Ok(response)
}
```

By using `generate_response` directly, we bypass the complexity of handling the `PromptResponse` object and get the string response directly.

## Lessons Learned

1. **WebAssembly Object Handling**: Be cautious when working with objects returned from WebAssembly. They may not behave like regular JavaScript objects.

2. **API Design**: When designing APIs that cross language boundaries, prefer simple types (strings, numbers, booleans) over complex objects when possible.

3. **Debugging WebAssembly**: Use console logging to inspect the actual structure of objects returned from WebAssembly.

4. **Documentation**: Document the expected behavior of WebAssembly interfaces to help future developers understand how to use them correctly.

## Future Considerations

If more complex data structures need to be returned from the WebAssembly module, consider:

1. Using JSON serialization/deserialization to pass data between Rust and JavaScript
2. Creating proper TypeScript interfaces for WebAssembly objects
3. Adding helper methods to extract data from WebAssembly objects

## Related Files

- `plugin/src/api.ts`: Contains the API client that communicates with the WebAssembly module
- `src/lib.rs`: Contains the Rust implementation of the WebAssembly module
- `pkg/rig_augmented_canvas.d.ts`: Contains the TypeScript definitions for the WebAssembly module
