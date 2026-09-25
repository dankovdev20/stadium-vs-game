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
      // Тост — только транспорт: вся рамка/фон у самой модалки (пиксельная
      // панель), поэтому обёртку toastify делаем прозрачной и без отступов.
      className: "!bg-transparent !p-0 !shadow-none !rounded-none !overflow-visible !min-h-0 !max-h-none !w-fit !max-w-none !mx-auto !mt-4",
    });
  }, []);

  const hidePlayAgainModal = useCallback(() => {
    toast.dismiss(TOAST_ID);
  }, []);

  return { showPlayAgainModal, hidePlayAgainModal, isOpen };
}
