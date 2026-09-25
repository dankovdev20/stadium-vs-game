import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePlayAgainModal } from "./feature/play-again/model/usePlayAgainModal";
import LobbyScreen from "./screens/LobbyScreen/LobbyScreen";
import CustomizationScreen from "./screens/CustomizationScreen/CustomizationScreen";
import GameScreen from "./screens/GameScreen/GameScreen";
import ScreenShell from "./components/layout/ScreenShell";
import { useGameState, useGamePhase, useConnectionStatus } from "./game/GameContext";
import ConnectionOverlay from "./components/status/ConnectionOverlay";
import DisconnectBanner from "./components/status/DisconnectBanner";
import SpectatorScreen from "./components/status/SpectatorScreen";
import { DevPanel } from "./dev/devPanel";


export default function App() {
  const phase = useGamePhase();
  const { myRole, resetEpoch } = useGameState();
  const { restoring, connectCount } = useConnectionStatus();
  const { showPlayAgainModal, hidePlayAgainModal, isOpen } = usePlayAgainModal();

  // Kiosk-режим: без контекстного меню на долгом тапе/правом клике (см. index.css).
  useEffect(() => {
    const preventContextMenu = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", preventContextMenu);
    return () => document.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  // Матч идёт, а у этого терминала нет роли (и мы её уже не восстанавливаем) —
  // показываем заглушку вместо игровых экранов, тапы там всё равно игнорирует сервер.
  const isSpectator = phase !== "LOBBY" && !myRole && !restoring;

  // Модалка GAME_OVER — отдельный toast, к фазе сам не привязан: открываем на
  // входе в GAME_OVER и закрываем, как только сервер увёл комнату дальше по FSM.
  // Раньше повторный показ сверялся с суммой очков прошлого матча — и если
  // следующий матч (даже у другой пары) кончался с той же суммой, модалка не
  // появлялась вовсе. toastId внутри защищает от дублей.
  useEffect(() => {
    if (phase === "GAME_OVER" && myRole) showPlayAgainModal();
    else hidePlayAgainModal();
  }, [phase, myRole, showPlayAgainModal, hidePlayAgainModal]);

  return (
    <>
      {/* key: локальный стейт лобби (оптимистичный выбор роли) не должен
          пережить ни сброс комнаты, ни переподключение — см. LobbyScreen. */}
      {phase === "LOBBY" && <LobbyScreen key={`${resetEpoch}-${connectCount}`} />}
      {isSpectator && <SpectatorScreen />}
      {!isSpectator && phase === "CUSTOMIZATION" && <CustomizationScreen />}
      {!isSpectator && (phase === "PLAYING" || phase === "ROUND_RESULT") && <GameScreen />}
      {!isSpectator && phase === "GAME_OVER" && (
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

      <DisconnectBanner />
      <ConnectionOverlay />

     {/*  <DevPanel /> */}

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
