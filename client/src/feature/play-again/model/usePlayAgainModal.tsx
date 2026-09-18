import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import PlayAgainModal from "../ui/PlayAgainModal";

const TOAST_ID = "play-again-modal";

// Тонкая обёртка над react-toastify: сам компонент PlayAgainModal —
// самодостаточный подписчик на GameContext (см. его комментарий), поэтому
// здесь не нужно прокидывать никакие данные — только открыть/закрыть тост.
export function usePlayAgainModal() {
  const [isOpen, setIsOpen] = useState(false);

  const showPlayAgainModal = useCallback(() => {
    setIsOpen(true);
    toast(() => <PlayAgainModal />, {
      toastId: TOAST_ID,
      position: "top-center",
      autoClose: false, // закрываем сами, когда сервер уводит фазу с GAME_OVER
      hideProgressBar: true,
      closeOnClick: false,
      closeButton: false,
      pauseOnHover: false,
      onClose: () => setIsOpen(false),
      className: "!bg-white !rounded-2xl !p-0 !max-w-lg !w-96 shadow-2xl overflow-hidden mt-12",
    });
  }, []);

  const hidePlayAgainModal = useCallback(() => {
    toast.dismiss(TOAST_ID);
  }, []);

  return { showPlayAgainModal, hidePlayAgainModal, isOpen };
}
