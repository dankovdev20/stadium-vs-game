import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePlayAgainModal } from "./feature/play-again/model/usePlayAgainModal";
import StartScreen from "./screens/StartScreen/StartScreen";

export default function App() {
  const { showPlayAgainModal, isOpen } = usePlayAgainModal();

  useEffect(() => {
    // TODO: вызывать не на монтировании App, а по реальному событию конца игры
    showPlayAgainModal(() => {
      // TODO: отправка "готов играть снова" на сервер
    });
  }, [showPlayAgainModal]);

  return (
    <div className="relative bg-zinc-900 text-white min-h-screen flex items-center justify-center">
      <StartScreen />

      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 pointer-events-none ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      <ToastContainer
        progressClassName="bg-green-500 h-3"
        className="!z-50"
      />
    </div>
  );
}