import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { store } from "./store/store.js";
import App from './App.jsx'
import { Provider } from "react-redux";
import { DialogProvider } from "./contexts/DialogContext.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Provider store={store}>
            <DialogProvider>
                <App />
            </DialogProvider>
        </Provider>
    </StrictMode>
);
