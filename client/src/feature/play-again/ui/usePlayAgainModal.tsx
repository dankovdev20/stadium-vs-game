import { useEffect } from "react";
import PlayAgainModal from "./PlayAgainModal";
import { toast, ToastContainer } from "react-toastify";

export default function usePlayAgainModal() {
  useEffect(() => {
    toast(
      () => (
        <PlayAgainModal isWinner={false} winnerName="Player 1" readyCount={1} />
      ),
      {
        position: "top-center",
        autoClose: 10000, // 10 seconds
        hideProgressBar: true, // hiding the original sloppy one
        closeOnClick: false,
        closeButton: false,
        pauseOnHover: false,
        className:
          "!bg-white !rounded-2xl !p-0 !max-w-lg !w-96 shadow-2xl overflow-hidden mt-12",
      },
    );
  }, []);
  return <ToastContainer progressClassName={"bg-green-500 h-3"} />;
}
