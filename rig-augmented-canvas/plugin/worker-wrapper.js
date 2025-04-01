// This is a wrapper for the worker.js file that exposes it globally
// so it can be loaded via a script tag in Obsidian

// Use an async IIFE instead of top-level await
(async function() {
    try {
        console.log("Worker wrapper starting to load WASM module");
        
        // Store the original module in a global variable
        // Try to import from the root directory first, then fallback to worker directory
        try {
            console.log("Attempting to import from ./worker.js");
            window.workerWasm = await import('./worker.js');
            console.log("Successfully imported from ./worker.js");
        } catch (e) {
            console.log("Failed to import from ./worker.js, error:", e);
            console.log("Attempting to import from ./worker/worker.js");
            // If that fails, try the worker directory
            window.workerWasm = await import('./worker/worker.js');
            console.log("Successfully imported from ./worker/worker.js");
        }
        console.log("Worker WASM module loaded successfully");
        
        // Dispatch an event to notify that the module is loaded
        window.dispatchEvent(new CustomEvent('wasm-module-loaded'));
        console.log("Dispatched wasm-module-loaded event");
    } catch (error) {
        console.error("Error loading worker WASM module:", error);
    }
})();

// Export a function to get the module
export default function getWorkerWasm() {
    return window.workerWasm;
}
