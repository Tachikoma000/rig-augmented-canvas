/**
 * RigService module handles AI model interactions using the Rig library.
 * It provides methods for generating responses, questions, and flashcards.
 */

use serde::{Deserialize, Serialize};
use std::error::Error;
use std::sync::RwLock;

use crate::models::{AgentWrapper, ModelConfig, create_agent, create_agent_with_system_prompt};

/**
 * RigService is the main service for interacting with AI models.
 * It maintains a default agent instance and configuration.
 */
pub struct RigService {
    agent: Option<AgentWrapper>,  // Default agent for handling prompts (None if no API key available)
    config: RwLock<ModelConfig>,  // Thread-safe configuration
    has_api_key: bool,            // Flag indicating if an API key is available
}

/**
 * Data structures for parsing AI responses.
 */
#[derive(Serialize, Deserialize)]
struct QuestionsOutput {
    questions: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
struct FlashcardsOutput {
    filename: String,
    flashcards: Vec<Flashcard>,
}

/**
 * Represents a single flashcard with front (question) and back (answer) sides.
 */
#[derive(Serialize, Deserialize, Clone)]
pub struct Flashcard {
    pub front: String,
    pub back: String,
}

impl RigService {
    /**
     * Creates a new RigService with default configuration.
     * Initializes the default agent for handling prompts if an API key is available.
     */
    pub fn new() -> Result<Self, Box<dyn Error>> {
        let config = ModelConfig::default();
        
        // Check if an API key is available in the environment
        let has_api_key = crate::models::has_api_key(&config, None);
        
        // Try to create the agent if an API key is available
        let agent = if has_api_key {
            match create_agent(&config, None) {
                Ok(agent) => Some(agent),
                Err(e) => {
                    // If there's an error other than missing API key, return it
                    if !e.to_string().contains("API key not found") {
                        return Err(e);
                    }
                    None
                }
            }
        } else {
            None
        };
        
        Ok(Self { 
            agent,
            config: RwLock::new(config),
            has_api_key,
        })
    }
    
    /**
     * Checks if the service has a valid API key.
     * 
     * @return true if an API key is available, false otherwise
     */
    pub fn has_api_key(&self) -> bool {
        self.has_api_key
    }
    
    /**
     * Retrieves the current model configuration.
     */
    pub fn get_config(&self) -> Result<ModelConfig, Box<dyn Error>> {
        match self.config.read() {
            Ok(config) => Ok(config.clone()),
            Err(e) => Err(format!("Failed to read config: {}", e).into()),
        }
    }
    
    /**
     * Updates the model configuration with new settings.
     */
    pub fn update_config(&self, new_config: ModelConfig) -> Result<(), Box<dyn Error>> {
        match self.config.write() {
            Ok(mut config) => {
                *config = new_config;
                Ok(())
            },
            Err(e) => Err(format!("Failed to write config: {}", e).into()),
        }
    }
    
    /**
     * Recreates the default agent with the current configuration.
     * Useful after configuration changes.
     */
    #[allow(dead_code)]
    pub fn recreate_agent(&mut self) -> Result<(), Box<dyn Error>> {
        let config = self.get_config()?;
        
        // Check if an API key is available
        self.has_api_key = crate::models::has_api_key(&config, None);
        
        if self.has_api_key {
            match create_agent(&config, None) {
                Ok(agent) => {
                    self.agent = Some(agent);
                    Ok(())
                },
                Err(e) => Err(e)
            }
        } else {
            self.agent = None;
            Ok(())
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
        content: &str,
        system_prompt: Option<&str>,
        api_key: Option<&str>,
    ) -> Result<String, Box<dyn Error>> {
        // Get the response based on whether we have a system prompt and/or API key
        let response = match (system_prompt, api_key) {
            // Both system prompt and API key provided
            (Some(system_prompt), Some(api_key)) => {
                let config = self.get_config()?;
                let temp_agent = create_agent_with_system_prompt(&config, system_prompt, Some(api_key))?;
                temp_agent.prompt(content).await?
            },
            // Only system prompt provided
            (Some(system_prompt), None) => {
                let config = self.get_config()?;
                let temp_agent = create_agent_with_system_prompt(&config, system_prompt, None)?;
                temp_agent.prompt(content).await?
            },
            // Only API key provided
            (None, Some(api_key)) => {
                if !api_key.is_empty() {
                    let config = self.get_config()?;
                    let temp_agent = create_agent(&config, Some(api_key))?;
                    temp_agent.prompt(content).await?
                } else {
                    // Empty API key, check if we have an existing agent
                    if let Some(agent) = &self.agent {
                        agent.prompt(content).await?
                    } else {
                        return Err("No API key provided and no default agent available. Please provide an OpenAI API key in the plugin settings.".into());
                    }
                }
            },
            // Neither system prompt nor API key provided
            (None, None) => {
                // Check if we have an existing agent
                if let Some(agent) = &self.agent {
                    agent.prompt(content).await?
                } else {
                    return Err("No API key provided and no default agent available. Please provide an OpenAI API key in the plugin settings.".into());
                }
            }
        };
        
        Ok(response)
    }

    /**
     * Generates a list of questions about the given content.
     * 
     * @param content The text to generate questions about
     * @param count The number of questions to generate
     * @param api_key Optional API key to use for this specific request
     * @return A list of AI-generated questions
     */
    pub async fn generate_questions(
        &self,
        content: &str,
        count: usize,
        api_key: Option<&str>,
    ) -> Result<Vec<String>, Box<dyn Error>> {
        let prompt = format!(
            "Based on the following content, generate {} thoughtful questions that would help someone understand the material better. Return the response as a JSON object with a 'questions' field containing an array of strings.\n\nContent: {}\n\nQuestions:",
            count, content
        );
        
        // Get the response as a String
        let response_str = self.generate_response(&prompt, None, api_key).await?;
        
        // Parse the JSON response
        let output: QuestionsOutput = serde_json::from_str(&response_str)
            .map_err(|e| format!("Failed to parse questions response: {}", e))?;
        
        Ok(output.questions)
    }

    /**
     * Generates flashcards based on the given content.
     * 
     * @param content The text to create flashcards from
     * @param title Optional title for the flashcards
     * @param api_key Optional API key to use for this specific request
     * @return A tuple with the suggested filename and list of flashcards
     */
    pub async fn generate_flashcards(
        &self,
        content: &str,
        title: Option<&str>,
        api_key: Option<&str>,
    ) -> Result<(String, Vec<Flashcard>), Box<dyn Error>> {
        let title_prompt = title.unwrap_or("this content");
        
        let prompt = format!(
            "Create flashcards for studying {}. Each flashcard should have a question on the front and the answer on the back. Return the response as a JSON object with a 'filename' field containing a suggested filename (without extension) and a 'flashcards' field containing an array of objects, each with 'front' and 'back' fields.\n\nContent: {}\n\nFlashcards:",
            title_prompt, content
        );
        
        // Get the response as a String
        let response_str = self.generate_response(&prompt, None, api_key).await?;
        
        // Parse the JSON response
        let output: FlashcardsOutput = serde_json::from_str(&response_str)
            .map_err(|e| format!("Failed to parse flashcards response: {}", e))?;
        
        Ok((output.filename, output.flashcards))
    }
}
