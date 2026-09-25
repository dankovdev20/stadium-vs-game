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
// Раскомментировать вместе с <DevPanel /> ниже (неиспользуемый импорт ломал `npm run build`).
// import { DevPanel } from "./dev/devPanel";
import Panel from "./components/ui/Panel";
import { useKioskScaleCssVar } from "./components/layout/kioskScale";


export default function App() {
  const phase = useGamePhase();
  const { myRole, resetEpoch } = useGameState();
  const { restoring, connectCount } = useConnectionStatus();
  const { showPlayAgainModal, hidePlayAgainModal, isOpen } = usePlayAgainModal();
  // Слои вне сцены 1920×1080 (тост финала, оверлей связи, баннер обрыва)
  // масштабируются той же величиной, что и сама сцена.
  useKioskScaleCssVar();

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
      {/* Финал — модалка-тост (PlayAgainModal); под ней тот же стадион. */}
      {!isSpectator && phase === "GAME_OVER" && <ScreenShell />}
      {phase === "PAUSED_DISCONNECT" && (
        <ScreenShell>
          <Panel className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-20 pb-12 pt-10">
            <p className="font-display text-[96px] uppercase leading-[0.85]">Rywal się rozłączył…</p>
          </Panel>
        </ScreenShell>
      )}

      <DisconnectBanner />
      <ConnectionOverlay />

     {/*  <DevPanel /> */}

      <div
        className={`pointer-events-none fixed inset-0 z-40 bg-ink/35 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      <ToastContainer progressClassName="bg-green-500 h-3" className="!z-50" />
    </>
  );
}
