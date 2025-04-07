import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { setupMocks } from "./api/mocks/setup";
import "./index.css";

// Initialize the application
async function init() {
  // Setup MSW in development
  if (import.meta.env.MODE === "development") {
    await setupMocks();
  }

  // Render the app
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

init();
