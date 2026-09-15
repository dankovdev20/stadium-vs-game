import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.tsx";
import { GameProvider } from "./game/GameContext.tsx";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GameProvider>
    <App />
    </GameProvider>
  </StrictMode>,
);
