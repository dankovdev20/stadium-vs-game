import { useEffect, useRef } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePlayAgainModal } from "./feature/play-again/model/usePlayAgainModal";
import StartScreen from "./screens/StartScreen/StartScreen";
import { useGameState, useGamePhase, useGameEmit } from "./game/GameContext";
import { DevPanel } from "./dev/devPanel";


export default function App() {
  const phase = useGamePhase();
  const { lastGameOver } = useGameState();
  const emit = useGameEmit();
  const { showPlayAgainModal, isOpen } = usePlayAgainModal();
  const { disconnectedInfo } = useGameState();

  // раньше срабатывало на монтировании — теперь реально на приход game:over
  const shownForRound = useRef<number | null>(null);
  useEffect(() => {
    if (lastGameOver && shownForRound.current !== lastGameOver.scores.player_1 + lastGameOver.scores.player_2) {
      shownForRound.current = lastGameOver.scores.player_1 + lastGameOver.scores.player_2;
      showPlayAgainModal(() => emit("game:restart"));
    }
  }, [lastGameOver, showPlayAgainModal, emit]);

  return (
    <>
      {phase === "LOBBY" && <div className="p-8 text-center">Экран выбора терминала (заглушка)</div>}
      {phase === "CUSTOMIZATION" && <div className="p-8 text-center">Конструктор персонажа (заглушка)</div>}
      {phase === "PLAYING" && <div className="p-8 text-center">Экран выбора зоны (заглушка)</div>}
      {phase === "ROUND_RESULT" && <div className="p-8 text-center">Экран результата раунда (заглушка)</div>}
      {phase === "GAME_OVER" && <div className="p-8 text-center">Финальный счёт (заглушка)</div>}
      {phase === "PAUSED_DISCONNECT" && <div className="p-8 text-center text-red-600">Соперник отключился</div>}

      {disconnectedInfo && (
        <div className="p-8 text-center text-red-600">
          Gracz {disconnectedInfo.role} rozłączony. Reset za {disconnectedInfo.timeoutSec}s
        </div>
      )}

      <DevPanel />

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