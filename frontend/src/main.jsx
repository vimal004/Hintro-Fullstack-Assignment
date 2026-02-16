import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

/* ── Google Sans — official font via Fontsource ── */
import "@fontsource/google-sans/400.css";
import "@fontsource/google-sans/500.css";
import "@fontsource/google-sans/700.css";

import "./styles/index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
