import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router'
import { DataProvider } from "./context/DataContext";
import { FilterProvider } from "./context/FilterContext";
import { WebpageProvider } from "./context/WebpageContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/NetworkVisualizer">
      <WebpageProvider><FilterProvider><DataProvider><App /></DataProvider></FilterProvider></WebpageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
