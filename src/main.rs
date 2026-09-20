   use axum::{routing::post, Json, Router};
   use serde::{Deserialize, Serialize};
   use std::collections::HashMap;

   #[derive(Deserialize)]
   struct TextPayload {
       text: String,
   }

   #[derive(Serialize)]
   struct CountResponse {
       counts: HashMap<String, usize>,
   }

   // CPU-intensive task: Counting word frequencies
   async fn process(Json(payload): Json<TextPayload>) -> Json<CountResponse> {
       let mut counts = HashMap::new();
       for word in payload.text.split_whitespace() {
           *counts.entry(word.to_lowercase()).or_insert(0) += 1;
       }
       Json(CountResponse { counts })
   }

   #[tokio::main]
   async fn main() {
       let app = Router::new().route("/process", post(process));
       
       println!("🦀 Rust Worker listening on port 8081...");
       let listener = tokio::net::TcpListener::bind("127.0.0.1:8081").await.unwrap();
       axum::serve(listener, app).await.unwrap();
   }