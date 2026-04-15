import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContextProvider } from "./context/authContext";
import { DarkModeContextProvider } from "./context/darkModeContext";
import { register as registerSW } from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <DarkModeContextProvider>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </DarkModeContextProvider>
  </React.StrictMode>
);

// Register service worker for PWA installability
registerSW({
  onUpdate: (registration) => {
    // Notify user that a new version is available
    if (window.confirm("New version available! Click OK to update.")) {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      window.location.reload();
    }
  },
  onSuccess: () => {
    console.log("[PWA] SISTec Alumni Portal is ready for offline use.");
  },
});
