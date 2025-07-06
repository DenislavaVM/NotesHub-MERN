import { StrictMode } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { LabelsProvider } from "./context/LabelsProvider.jsx";
import { NotificationProvider } from "./context/NotificationProvider.jsx";
import { NotesProvider } from "./context/NotesContext.jsx";
import { SearchProvider } from "./context/SearchContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <SocketProvider>
          <ThemeProvider>
            <SearchProvider>
              <LabelsProvider>
                <NotificationProvider>
                  <NotesProvider>
                    <App />
                  </NotesProvider>
                </NotificationProvider>
              </LabelsProvider>
            </SearchProvider>
          </ThemeProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  </StrictMode>,
)