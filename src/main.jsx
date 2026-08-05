import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";

import "./styles/variables.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/sidebar.css";
import "./styles/topbar.css";
import "./styles/dashboard.css";
import "./styles/cards.css";
import "./styles/customers.css";
import "./styles/leads.css";
import "./styles/pipeline.css";
import "./styles/tasks.css";
import "./styles/calendar.css";
import "./styles/analytics.css";
import "./styles/settings.css";
import "./styles/auth.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);