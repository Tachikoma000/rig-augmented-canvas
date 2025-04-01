mod obsidian;
mod models;
mod utils;

use js_sys::JsString;
use serde::{Deserialize, Serialize};
use serde_json;
use wasm_bindgen::prelude::*;

// Re-export models for use in JavaScript
use models::{
    create_agent, create_agent_with_system_prompt, AgentWrapper, ModelConfig,
};

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone)]
pub struct WasmFlashcard {
    front: String,
    back: String,
}

#[wasm_bindgen]
#[derive(Serialize)]
pub struct PromptResponse {
    response: String,
}

#[wasm_bindgen]
pub struct RigCommand {
    id: JsString,
    name: JsString,
}

#[wasm_bindgen]
impl RigCommand {
    #[wasm_bindgen(getter)]
    pub fn id(&self) -> JsString {
        self.id.clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_id(&mut self, id: &str) {
        self.id = JsString::from(id)
    }

    #[wasm_bindgen(getter)]
    pub fn name(&self) -> JsString {
        self.name.clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_name(&mut self, name: &str) {
        self.name = JsString::from(name)
    }

    pub fn callback(&self) {
        obsidian::Notice::new("Hello from Rig Augmented Canvas WASM!");
    }
}

#[wasm_bindgen]
pub struct WasmRigService {
    agent: Option<AgentWrapper>,
    config: ModelConfig,
}

#[wasm_bindgen]
impl WasmRigService {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<Self, js_sys::Error> {
        // Enable console error logging
        utils::set_panic_hook();

        let config = ModelConfig::new();

        // Check if an API key is available in the environment
        let has_api_key = crate::models::has_api_key(&config, None);

        // Try to create the agent if an API key is available
        let agent = if has_api_key {
            match create_agent(&config, None) {
                Ok(agent) => Some(agent),
                Err(e) => {
                    // If there's an error other than missing API key, return it
                    if !e.to_string().contains("API key not found") {
                        return Err(js_sys::Error::new(&e.to_string()));
                    }
                    None
                }
            }
        } else {
            None
        };

        Ok(Self { agent, config })
    }

    // Get model configuration
    pub fn get_config(&self) -> ModelConfig {
        self.config.clone()
    }

    // Update model configuration
    pub fn update_model_config(&mut self, config_json: String) -> Result<(), JsValue> {
        let config: ModelConfig = serde_json::from_str(config_json.clone().as_ref())
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        self.config = config;
        Ok(())
    }

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
            PromptRequest::MultiNode {
                nodes,
                prompt,
                system_prompt,
            } => {
                // Combine all node contents with the prompt
                let mut combined_content = String::new();

                // Add each node's content
                for (i, node) in nodes.iter().enumerate() {
                    combined_content.push_str(&format!("Node {}: {}\n\n", i + 1, node.content));
                }

                // Add the user's prompt
                combined_content.push_str(&format!("Prompt: {}", prompt));

                // Generate response
                match self
                    .generate_response(combined_content, system_prompt, api_key)
                    .await
                {
                    Ok(response) => Ok(PromptResponse { response }),
                    Err(e) => {
                        return Err(e);
                    }
                }
            }
        }
    }

    /**
     * Generates an AI response for the given content.
     *
     * @param content The text to send to the AI model
     * @param system_prompt Optional system prompt to guide the AI's behavior
     * @param api_key Optional API key to use for this specific request
     * @return The AI-generated response
     */
    pub async fn generate_response(
        &self,
        content: String,
        system_prompt: Option<String>,
        api_key: Option<String>,
    ) -> Result<String, js_sys::Error> {
        // Get the response based on whether we have a system prompt and/or API key
        let response = match (system_prompt, api_key) {
            // Both system prompt and API key provided
            (Some(system_prompt), Some(api_key)) => {
                let config = self.get_config();
                let temp_agent =
                    create_agent_with_system_prompt(&config, &system_prompt, Some(&api_key))
                        .map_err(|e| js_sys::Error::new(&e.to_string()))?;
                temp_agent
                    .prompt(&content)
                    .await
                    .map_err(|e| js_sys::Error::new(&e.to_string()))?
            }
            // Only system prompt provided
            (Some(system_prompt), None) => {
                let config = self.get_config();
                let temp_agent = create_agent_with_system_prompt(&config, &system_prompt, None)
                    .map_err(|x| js_sys::Error::new(&x.to_string()))?;
                temp_agent
                    .prompt(&content)
                    .await
                    .map_err(|x| js_sys::Error::new(&x.to_string()))?
            }
            // Only API key provided
            (None, Some(api_key)) => {
                if !api_key.is_empty() {
                    let config = self.get_config();
                    let temp_agent = create_agent(&config, Some(&api_key))
                        .map_err(|x| js_sys::Error::new(&x.to_string()))?;
                    temp_agent
                        .prompt(&content)
                        .await
                        .map_err(|x| js_sys::Error::new(&x.to_string()))?
                } else {
                    // Empty API key, check if we have an existing agent
                    if let Some(agent) = &self.agent {
                        agent
                            .prompt(&content)
                            .await
                            .map_err(|e| js_sys::Error::new(&e.to_string()))?
                    } else {
                        return Err(js_sys::Error::new("No API key provided and no default agent available. Please provide an OpenAI API key in the plugin settings."));
                    }
                }
            }
            // Neither system prompt nor API key provided
            (None, None) => {
                // Check if we have an existing agent
                if let Some(agent) = &self.agent {
                    agent
                        .prompt(&content)
                        .await
                        .map_err(|e| js_sys::Error::new(&e.to_string()))?
                } else {
                    return Err(js_sys::Error::new("No API key provided and no default agent available. Please provide an OpenAI API key in the plugin settings."));
                }
            }
        };

        Ok(response)
    }

    pub async fn generate_questions(
        &self,
        content: String,
        count: usize,
        api_key: Option<String>,
    ) -> Result<Vec<String>, JsValue> {
        let prompt = format!(
            "Based on the following content, generate {} thoughtful questions that would help someone understand the material better. Return the response as a JSON object with a 'questions' field containing an array of strings.\n\nContent: {}\n\nQuestions:",
            count, content
        );

        // Get the response as a String
        let response_str = match self.generate_response(prompt, None, api_key).await {
            Ok(response) => response,
            Err(e) => return Err(JsValue::from(e)),
        };

        // Parse the JSON response
        let output: QuestionsOutput = serde_json::from_str(&response_str)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse questions response: {}", e)))?;

        Ok(output.questions)
    }

    pub async fn generate_flashcards(
        &self,
        content: &str,
        title: Option<String>,
        api_key: Option<String>,
    ) -> Result<JsValue, JsValue> {
        let title_prompt = title.clone().unwrap_or_else(|| "this content".to_string());
        
        let prompt = format!(
            "Create flashcards for studying {}. Each flashcard should have a question on the front and the answer on the back. Return the response as a JSON object with a 'filename' field containing a suggested filename (without extension) and a 'flashcards' field containing an array of objects, each with 'front' and 'back' fields.\n\nContent: {}\n\nFlashcards:",
            title_prompt, content
        );
        
        // Get the response as a String
        let response_str = match self.generate_response(prompt, None, api_key).await {
            Ok(response) => response,
            Err(e) => return Err(JsValue::from(e)),
        };
        
        // Parse the JSON response
        let output: FlashcardsResult = match serde_json::from_str(&response_str) {
            Ok(output) => output,
            Err(e) => return Err(JsValue::from_str(&format!("Failed to parse flashcards response: {}", e))),
        };
        
        Ok(serde_wasm_bindgen::to_value(&output).unwrap())
    }
}

#[wasm_bindgen]
pub fn onload(plugin: &obsidian::Plugin) {
    let cmd = RigCommand {
        id: JsString::from("rig-example"),
        name: JsString::from("Rig Example Command"),
    };
    plugin.addCommand(JsValue::from(cmd))
}

#[derive(Deserialize)]
#[serde(untagged)]
enum PromptRequest {
    // For processing a single node's content
    SingleNode {
        content: String,
        system_prompt: Option<String>,
    },
    // For processing multiple nodes with a custom prompt
    MultiNode {
        nodes: Vec<NodeContent>,
        prompt: String,
        system_prompt: Option<String>,
    },
}

#[derive(Deserialize)]
struct NodeContent {
    #[allow(dead_code)]
    id: String,
    content: String,
}

/**
 * Data structures for parsing AI responses.
 */
#[derive(Serialize, Deserialize)]
struct QuestionsOutput {
    questions: Vec<String>,
}

#[derive(Serialize, Deserialize)]
struct FlashcardsResult {
    filename: String,
    flashcards: Vec<WasmFlashcard>,
}
