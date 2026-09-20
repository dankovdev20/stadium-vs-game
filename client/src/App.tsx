import { useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePlayAgainModal } from "./feature/play-again/model/usePlayAgainModal";
import StartScreen from "./screens/StartScreen/StartScreen";
import LobbyScreen from "./screens/LobbyScreen/LobbyScreen";
import CustomizationScreen from "./screens/CustomizationScreen/CustomizationScreen";
import GameScreen from "./screens/GameScreen/GameScreen";
import ScreenShell from "./components/layout/ScreenShell";
import { useGameState, useGamePhase } from "./game/GameContext";
import { DevPanel } from "./dev/devPanel";


export default function App() {
  const phase = useGamePhase();
  const { lastGameOver, disconnectedInfo } = useGameState();
  const { showPlayAgainModal, hidePlayAgainModal, isOpen } = usePlayAgainModal();

  // Сплэш перед LOBBY — чисто локальный шаг, сервер о нём не знает.
  const [hasEnteredLobby, setHasEnteredLobby] = useState(false);

  // Kiosk-режим: без контекстного меню на долгом тапе/правом клике (см. index.css).
  useEffect(() => {
    const preventContextMenu = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", preventContextMenu);
    return () => document.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  const shownForRound = useRef<number | null>(null);
  useEffect(() => {
    if (lastGameOver && shownForRound.current !== lastGameOver.scores.player_1 + lastGameOver.scores.player_2) {
      shownForRound.current = lastGameOver.scores.player_1 + lastGameOver.scores.player_2;
      showPlayAgainModal();
    }
  }, [lastGameOver, showPlayAgainModal]);

  // Модалка GAME_OVER не привязана к фазе автоматически (это отдельный toast) —
  // закрываем её вручную, как только сервер увёл комнату дальше по FSM.
  useEffect(() => {
    if (phase !== "GAME_OVER") {
      hidePlayAgainModal();
    }
  }, [phase, hidePlayAgainModal]);

  return (
    <>
      {phase === "LOBBY" && !hasEnteredLobby && <StartScreen onPlay={() => setHasEnteredLobby(true)} />}
      {phase === "LOBBY" && hasEnteredLobby && <LobbyScreen />}
      {phase === "CUSTOMIZATION" && <CustomizationScreen />}
      {(phase === "PLAYING" || phase === "ROUND_RESULT") && <GameScreen />}
      {phase === "GAME_OVER" && (
        <ScreenShell tone="dark">
          <div className="flex min-h-[100dvh] items-center justify-center">
            <p className="font-[Poppins] font-semibold text-white/90">Koniec meczu...</p>
          </div>
        </ScreenShell>
      )}
      {phase === "PAUSED_DISCONNECT" && (
        <ScreenShell tone="dark">
          <div className="flex min-h-[100dvh] items-center justify-center">
            <p className="font-[Poppins] text-xl font-bold text-[var(--color-danger-500)]">Rywal się rozłączył...</p>
          </div>
        </ScreenShell>
      )}

      {disconnectedInfo && (
        <div className="fixed inset-x-0 top-0 z-30 bg-[var(--color-danger-500)] p-4 text-center font-[Poppins] font-semibold text-white">
          Gracz {disconnectedInfo.role} rozłączony. Reset za {disconnectedInfo.timeoutSec}s
        </div>
      )}

      {/* <DevPanel /> */}

      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 pointer-events-none ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      <ToastContainer progressClassName="bg-green-500 h-3" className="!z-50" />
    </>
  );
}
