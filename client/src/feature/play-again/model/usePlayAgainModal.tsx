import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import PlayAgainModal from "../ui/PlayAgainModal";
import { fetchGameResult } from "./mockApi";

const TOAST_ID = "play-again-modal";

export function usePlayAgainModal() {
  const [isOpen, setIsOpen] = useState(false);

  const showPlayAgainModal = useCallback(async (onPlayAgain: () => void) => {
    let data;
    try {
      data = await fetchGameResult();
    } catch (e) {
      console.error("Не удалось получить результат игры", e);
      return;
    }

    setIsOpen(true);

    toast(
      () => (
        <PlayAgainModal
          isWinner={data.isWinner}
          winnerName={data.winnerName}
          readyCount={data.readyCount}
          totalPlayers={data.totalPlayers}
          duration={data.duration}
          onPlayAgain={onPlayAgain}
        />
      ),
      {
        toastId: TOAST_ID,
        position: "top-center",
        autoClose: data.duration * 1000,
        hideProgressBar: true,
        closeOnClick: false,
        closeButton: false,
        pauseOnHover: false,
        onClose: () => setIsOpen(false), // фон разблюривается, когда тост закрылся
        className:
          "!bg-white !rounded-2xl !p-0 !w-[40rem] !max-w-[calc(100vw-2rem)] shadow-2xl overflow-hidden mt-12",
      },
    );
  }, []);

  return { showPlayAgainModal, isOpen };
}