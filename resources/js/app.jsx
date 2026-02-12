import "./bootstrap";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./components/store";
import App from "./components/App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/app.css";

// Create the root container
const container = document.getElementById("app");
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <Provider store={store}>
            <BrowserRouter>
                <App />
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    draggable
                    theme="light"
                />
            </BrowserRouter>
        </Provider>
    );
} else {
    console.error("Failed to find the root element");
}
