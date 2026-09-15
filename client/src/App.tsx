import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePlayAgainModal } from "./feature/play-again/model/usePlayAgainModal";
import StartScreen from "./screens/StartScreen/StartScreen";
import { useGameState } from "./game/GameContext";
import { DevPanel } from "./dev/devPanel";

export default function App() {
  const { phase } = useGameState();
  const { showPlayAgainModal, isOpen } = usePlayAgainModal();

  useEffect(() => {
    // TODO: вызывать не на монтировании App, а по реальному событию конца игры
    showPlayAgainModal(() => {
      // TODO: отправка "готов играть снова" на сервер
    });
  }, [showPlayAgainModal]);

  return (
    <>
      {phase === "start" && <StartScreen />}
      {phase === "lobby" && <div className="p-8 text-center">Ожидание соперника…</div>}
      {phase === "pick" && <div className="p-8 text-center">Экран выбора зоны (заглушка)</div>}
      {phase === "reveal" && <div className="p-8 text-center">Экран результата раунда (заглушка)</div>}
      {phase === "result" && <div className="p-8 text-center">Финальный счёт (заглушка)</div>}
      {phase === "disconnected" && <div className="p-8 text-center text-red-600">Соперник отключился</div>}

      <DevPanel />
      {/* <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 pointer-events-none ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      <ToastContainer
        progressClassName="bg-green-500 h-3"
        className="!z-50"
      /> */}
    

      
    </>
  );
}