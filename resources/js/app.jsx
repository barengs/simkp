import "./bootstrap";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./src/App";
import { Provider } from "react-redux";
import { store } from "./src/store";
import { BrowserRouter } from "react-router-dom";
import "../css/app.css";


// Create the root container
const container = document.getElementById("app");
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    );
} else {
    console.error("Failed to find the root element");
}
