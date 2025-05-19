import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { DataProvider } from "./context/DataContext";
import { FilterProvider } from "./context/FilterContext";
import { WebpageProvider } from "./context/WebpageContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <WebpageProvider><FilterProvider><DataProvider><App /></DataProvider></FilterProvider></WebpageProvider>
    </BrowserRouter>

  </StrictMode>
);
