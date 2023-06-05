use wasm_bindgen::prelude::*;

// extern crate wee_alloc;
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    name.to_string()
}
