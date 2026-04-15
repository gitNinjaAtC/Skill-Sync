import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContextProvider } from "./context/authContext";
import { DarkModeContextProvider } from "./context/darkModeContext";
import { register as registerSW } from "./serviceWorkerRegistration";
import SplashScreen from "./components/SplashScreen/SplashScreen";

// Remove the CSS ::before overlay once JS is running
document.body.classList.add("app-ready");

const Root = () => {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      <DarkModeContextProvider>
        <AuthContextProvider>
          <App />
        </AuthContextProvider>
      </DarkModeContextProvider>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
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
