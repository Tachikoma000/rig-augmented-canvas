/**
 * Main entry point for the Rig Augmented Canvas backend server.
 * This file sets up the HTTP server using Axum and defines the API endpoints
 * that the Obsidian plugin will communicate with.
 */

mod rig_service;
mod models;

use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use models::ModelConfig;
use tokio::net::TcpListener;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::rig_service::RigService;

/**
 * AppState holds shared state accessible by all request handlers.
 * It contains the RigService which manages AI model interactions.
 */
#[derive(Clone)]
struct AppState {
    rig_service: Arc<RigService>,
}

/**
 * Main function that initializes and starts the HTTP server.
 * Sets up logging, creates the RigService, configures CORS,
 * and defines all API routes.
 */
#[tokio::main]
async fn main() {
    // Initialize tracing for logging
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Create Rig service for AI model interactions
    let rig_service = match RigService::new() {
        Ok(service) => {
            let has_api_key = service.has_api_key();
            if !has_api_key {
                println!("No OpenAI API key found in environment. The server will start, but you'll need to provide an API key in the Obsidian plugin settings.");
                println!("You can also set the OPENAI_API_KEY environment variable before starting the backend.");
            }
            Arc::new(service)
        },
        Err(e) => {
            // Print a more helpful error message for errors other than missing API key
            eprintln!("Failed to initialize Rig service: {}", e);
            eprintln!("\nNote: You can provide your OpenAI API key in two ways:");
            eprintln!("1. Set the OPENAI_API_KEY environment variable before starting the backend");
            eprintln!("2. Enter your API key in the Obsidian plugin settings");
            std::process::exit(1);
        }
    };

    // Create shared application state
    let state = AppState { rig_service };

    // CORS configuration to allow cross-origin requests from the Obsidian plugin
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Create router with all API endpoints
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/prompt", post(handle_prompt))
        .route("/api/questions", post(handle_questions))
        .route("/api/flashcards", post(handle_flashcards))
        .route("/api/model-config", get(get_model_config))
        .route("/api/model-config", post(update_model_config))
        .layer(cors)
        .with_state(state);

    // Start HTTP server on localhost:3000
    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("Listening on {}", addr);
    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

/**
 * Simple health check endpoint to verify the server is running.
 * Returns a 200 OK status with no body.
 */
async fn health_check() -> impl IntoResponse {
    StatusCode::OK
}

/**
 * Endpoint to retrieve the current model configuration.
 * Returns the configuration as JSON.
 */
async fn get_model_config(
    State(state): State<AppState>,
) -> impl IntoResponse {
    match state.rig_service.get_config() {
        Ok(config) => (
            StatusCode::OK,
            Json(config),
        ),
        Err(e) => {
            tracing::error!("Error getting model config: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ModelConfig::default()),
            )
        }
    }
}

/**
 * Endpoint to update the model configuration.
 * Accepts a JSON payload with the new configuration.
 */
async fn update_model_config(
    State(state): State<AppState>,
    Json(config): Json<ModelConfig>,
) -> impl IntoResponse {
    match state.rig_service.update_config(config) {
        Ok(_) => StatusCode::OK,
        Err(e) => {
            tracing::error!("Error updating model config: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

/**
 * Data structures for handling prompt requests and responses.
 * 
 * NodeContent: Represents a single canvas node with its content
 * PromptRequest: Can be either a single node request or a multi-node request
 * PromptResponse: Contains the AI-generated response
 */
#[derive(Deserialize)]
struct NodeContent {
    #[allow(dead_code)]
    id: String,
    content: String,
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

#[derive(Serialize)]
struct PromptResponse {
    response: String,
}

/**
 * Main endpoint for handling AI prompts.
 * Supports both single-node and multi-node requests.
 * Extracts the API key from headers if provided.
 */
async fn handle_prompt(
    State(state): State<AppState>,
    headers: axum::http::HeaderMap,
    Json(request): Json<PromptRequest>,
) -> impl IntoResponse {
    // Check for API key in header (allows per-request API keys)
    let api_key = headers.get("x-openai-key").and_then(|v| v.to_str().ok()).map(|s| s.to_string());
    match request {
        PromptRequest::SingleNode { content, system_prompt } => {
            match state
                .rig_service
                .generate_response(&content, system_prompt.as_deref(), api_key.as_deref())
                .await
            {
                Ok(response) => (
                    StatusCode::OK,
                    Json(PromptResponse { response }),
                ),
                Err(e) => {
                    tracing::error!("Error generating response: {}", e);
                    let error_message = if e.to_string().contains("API key not found") {
                        "Error: OpenAI API key not found. Please enter your API key in the plugin settings or set the OPENAI_API_KEY environment variable before starting the backend."
                    } else {
                        &format!("Error: {}", e)
                    };
                    
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(PromptResponse {
                            response: error_message.to_string(),
                        }),
                    )
                }
            }
        },
        PromptRequest::MultiNode { nodes, prompt, system_prompt } => {
            // Combine all node contents with the prompt
            let mut combined_content = String::new();
            
            // Add each node's content
            for (i, node) in nodes.iter().enumerate() {
                combined_content.push_str(&format!("Node {}: {}\n\n", i + 1, node.content));
            }
            
            // Add the user's prompt
            combined_content.push_str(&format!("Prompt: {}", prompt));
            
            // Generate response
            match state
                .rig_service
                .generate_response(&combined_content, system_prompt.as_deref(), api_key.as_deref())
                .await
            {
                Ok(response) => (
                    StatusCode::OK,
                    Json(PromptResponse { response }),
                ),
                Err(e) => {
                    tracing::error!("Error generating multi-node response: {}", e);
                    let error_message = if e.to_string().contains("API key not found") {
                        "Error: OpenAI API key not found. Please enter your API key in the plugin settings or set the OPENAI_API_KEY environment variable before starting the backend."
                    } else {
                        &format!("Error: {}", e)
                    };
                    
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(PromptResponse {
                            response: error_message.to_string(),
                        }),
                    )
                }
            }
        }
    }
}

/**
 * Data structures for handling question generation requests and responses.
 */
#[derive(Deserialize)]
struct QuestionsRequest {
    content: String,
    count: Option<usize>,
}

#[derive(Serialize)]
struct QuestionsResponse {
    questions: Vec<String>,
}

/**
 * Endpoint for generating questions based on content.
 * Takes content and an optional count parameter.
 * Returns a list of AI-generated questions.
 */
async fn handle_questions(
    State(state): State<AppState>,
    headers: axum::http::HeaderMap,
    Json(request): Json<QuestionsRequest>,
) -> impl IntoResponse {
    // Check for API key in header (allows per-request API keys)
    let api_key = headers.get("x-openai-key").and_then(|v| v.to_str().ok()).map(|s| s.to_string());
    
    match state
        .rig_service
        .generate_questions(&request.content, request.count.unwrap_or(5), api_key.as_deref())
        .await
    {
        Ok(questions) => (
            StatusCode::OK,
            Json(QuestionsResponse { questions }),
        ),
        Err(e) => {
            tracing::error!("Error generating questions: {}", e);
            let error_message = if e.to_string().contains("API key not found") {
                "OpenAI API key not found. Please enter your API key in the plugin settings or set the OPENAI_API_KEY environment variable before starting the backend."
            } else {
                &format!("{}", e)
            };
            
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(QuestionsResponse {
                    questions: vec![format!("Error: {}", error_message)],
                }),
            )
        }
    }
}

/**
 * Data structures for handling flashcard generation requests and responses.
 */
#[derive(Deserialize)]
struct FlashcardsRequest {
    content: String,
    title: Option<String>,
}

// Use the Flashcard type from rig_service to avoid type mismatch
use crate::rig_service::Flashcard;

#[derive(Serialize)]
struct FlashcardsResponse {
    filename: String,
    flashcards: Vec<Flashcard>,
}

/**
 * Endpoint for generating flashcards based on content.
 * Takes content and an optional title parameter.
 * Returns a suggested filename and a list of flashcards with front/back content.
 */
async fn handle_flashcards(
    State(state): State<AppState>,
    headers: axum::http::HeaderMap,
    Json(request): Json<FlashcardsRequest>,
) -> impl IntoResponse {
    // Check for API key in header (allows per-request API keys)
    let api_key = headers.get("x-openai-key").and_then(|v| v.to_str().ok()).map(|s| s.to_string());
    
    match state
        .rig_service
        .generate_flashcards(&request.content, request.title.as_deref(), api_key.as_deref())
        .await
    {
        Ok((filename, flashcards)) => (
            StatusCode::OK,
            Json(FlashcardsResponse {
                filename,
                flashcards: flashcards.clone(),
            }),
        ),
        Err(e) => {
            tracing::error!("Error generating flashcards: {}", e);
            let error_message = if e.to_string().contains("API key not found") {
                "OpenAI API key not found. Please enter your API key in the plugin settings or set the OPENAI_API_KEY environment variable before starting the backend."
            } else {
                &format!("{}", e)
            };
            
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(FlashcardsResponse {
                    filename: format!("error: {}", error_message),
                    flashcards: vec![],
                }),
            )
        }
    }
}
