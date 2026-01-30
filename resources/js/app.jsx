import "./bootstrap";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./components/App";

// Create the root container
const container = document.getElementById("app");
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
} else {
    console.error("Failed to find the root element");
}
