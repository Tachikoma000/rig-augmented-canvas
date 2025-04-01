use wasm_bindgen::prelude::*;

#[wasm_bindgen(module = "obsidian")]
extern "C" {
    pub type Plugin;

    #[wasm_bindgen(structural, method)]
    pub fn addCommand(this: &Plugin, command: JsValue);

    #[wasm_bindgen(structural, method)]
    pub fn addRibbonIcon(this: &Plugin, icon: &str, title: &str, callback: &JsValue) -> JsValue;

    #[wasm_bindgen(structural, method)]
    pub fn addSettingTab(this: &Plugin, setting_tab: &JsValue);

    #[wasm_bindgen(structural, method)]
    pub fn registerEvent(this: &Plugin, event: JsValue);

    #[wasm_bindgen(structural, method)]
    pub fn registerDomEvent(this: &Plugin, element: &JsValue, event: &str, callback: &JsValue);

    #[wasm_bindgen(structural, method)]
    pub fn registerInterval(this: &Plugin, interval_id: f64);

    pub type Notice;

    #[wasm_bindgen(constructor)]
    pub fn new(message: &str) -> Notice;

    pub type App;

    pub type Workspace;

    #[wasm_bindgen(structural, getter)]
    pub fn workspace(this: &App) -> Workspace;

    #[wasm_bindgen(structural, method, catch)]
    pub fn getActiveViewOfType(this: &Workspace, view_type: &str) -> Result<JsValue, JsValue>;
}
