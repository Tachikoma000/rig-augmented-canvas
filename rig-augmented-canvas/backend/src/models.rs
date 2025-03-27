/**
 * Models module defines the AI model configuration and agent creation.
 * It provides a wrapper around the Rig library's Agent type.
 */

use rig::{agent::Agent, providers::openai};
use serde::{Deserialize, Serialize};
use std::error::Error;

/**
 * Supported AI model providers.
 * Currently only OpenAI is implemented, but this enum allows for future expansion.
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelProvider {
    OpenAI,
}

/**
 * Configuration for AI models.
 * Contains settings like provider, model name, API key environment variable, etc.
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfig {
    pub provider: ModelProvider,     // The AI provider (e.g., OpenAI)
    pub model_name: String,          // The specific model to use (e.g., "o3-mini")
    pub api_key_env: Option<String>, // Environment variable name for the API key
    pub base_url: Option<String>,    // Optional custom API endpoint
}

/**
 * Default configuration for ModelConfig.
 * Uses OpenAI's o3-mini model with the OPENAI_API_KEY environment variable.
 */
impl Default for ModelConfig {
    fn default() -> Self {
        Self {
            provider: ModelProvider::OpenAI,
            model_name: "o3-mini".to_string(),
            api_key_env: Some("OPENAI_API_KEY".to_string()),
            base_url: None,
        }
    }
}

/**
 * Indicates whether an API key is available either from the environment
 * or from the provided direct key.
 * 
 * @param config The model configuration
 * @param direct_api_key Optional API key to use directly
 * @return true if an API key is available, false otherwise
 */
pub fn has_api_key(config: &ModelConfig, direct_api_key: Option<&str>) -> bool {
    // Check direct API key first
    if let Some(key) = direct_api_key {
        if !key.is_empty() {
            return true;
        }
    }
    
    // Then check environment variable
    if let Some(key_env) = &config.api_key_env {
        if let Ok(key) = std::env::var(key_env) {
            if !key.is_empty() {
                return true;
            }
        }
    }
    
    false
}

/**
 * Wrapper around the Rig library's Agent type.
 * Provides a simplified interface for prompting the AI model.
 */
pub struct AgentWrapper(pub Agent<openai::CompletionModel>);

impl AgentWrapper {
    /**
     * Sends a prompt to the AI model and returns the response as a String.
     * 
     * @param content The text to send to the AI model
     * @return The AI-generated response
     */
    pub async fn prompt(&self, content: &str) -> Result<String, Box<dyn Error>> {
        // Call the parent prompt method and convert the result to String
        let result = rig::completion::Prompt::prompt(&self.0, content).await?;
        Ok(result.to_string())
    }
}

/**
 * Creates an agent with the specified configuration.
 * 
 * @param config The model configuration
 * @param direct_api_key Optional API key to use directly instead of from environment
 * @return A wrapped agent ready for prompting
 */
pub fn create_agent(config: &ModelConfig, direct_api_key: Option<&str>) -> Result<AgentWrapper, Box<dyn Error>> {
    match config.provider {
        ModelProvider::OpenAI => {
            // First try to use the direct API key if provided
            let api_key = if let Some(key) = direct_api_key {
                if !key.is_empty() {
                    key.to_string()
                } else {
                    // If direct key is empty, fall back to environment variable
                    get_api_key_from_env(config)?
                }
            } else {
                // No direct key, use environment variable
                get_api_key_from_env(config)?
            };
            
            let client = openai::Client::new(&api_key);
            
            // Create the agent
            let agent = client.agent(&config.model_name).build();
            
            Ok(AgentWrapper(agent))
        }
    }
}

/**
 * Creates an agent with the specified configuration and system prompt.
 * The system prompt guides the AI's behavior for all interactions with this agent.
 * 
 * @param config The model configuration
 * @param system_prompt The system prompt to use
 * @param direct_api_key Optional API key to use directly instead of from environment
 * @return A wrapped agent ready for prompting
 */
pub fn create_agent_with_system_prompt(config: &ModelConfig, system_prompt: &str, direct_api_key: Option<&str>) -> Result<AgentWrapper, Box<dyn Error>> {
    match config.provider {
        ModelProvider::OpenAI => {
            // First try to use the direct API key if provided
            let api_key = if let Some(key) = direct_api_key {
                if !key.is_empty() {
                    key.to_string()
                } else {
                    // If direct key is empty, fall back to environment variable
                    get_api_key_from_env(config)?
                }
            } else {
                // No direct key, use environment variable
                get_api_key_from_env(config)?
            };
            
            let client = openai::Client::new(&api_key);
            
            // Create the agent with system prompt
            let agent = client.agent(&config.model_name).preamble(system_prompt).build();
            
            Ok(AgentWrapper(agent))
        }
    }
}

/**
 * Helper function to get API key from environment variable.
 * 
 * @param config The model configuration containing the environment variable name
 * @return The API key as a string
 */
fn get_api_key_from_env(config: &ModelConfig) -> Result<String, Box<dyn Error>> {
    if let Some(key_env) = &config.api_key_env {
        std::env::var(key_env).map_err(|_| {
            format!(
                "OpenAI API key not found. Please either:\n1. Set the {} environment variable, or\n2. Enter your API key in the plugin settings",
                key_env
            ).into()
        })
    } else {
        Err("API key environment variable not specified for OpenAI".into())
    }
}
